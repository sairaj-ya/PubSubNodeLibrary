const io = require('socket.io-client');
const MessageConverter = require('./MessageConverter')
const AgentConfig = require('../config/AgentConfig');
const CB_keywords = [
  'freset', 'reset', '__agent_escalation_failed__', '__image_received__'
]

class BotCentralWebSocket {
    constructor(environment, cb) {
      this.converter = new MessageConverter();
      this.status = false;
      this.messageCache = {};
      this.ws = this.initializeSocket(environment, cb);
    }

    convertMessage(res, userType) {
      return this.converter.convertToLPMessage(res, userType);
    }

    getSocket() {
      return this.ws;
    }

    getSocketStatus(){
      return this.status;
    }

    initializeSocket(env, cb) {
      let vm = this;
      let path = AgentConfig['websocket'][env];
      console.log(`[botcentralWebsocket] bot environment : ${env}`);
      console.log('[botcentralWebsocket] Connecting to socket server', path)
      try{
        var socket = io(path,
          {
            transports: ['websocket'],
            rejectUnauthorized: false,
            forceNode: true
          });
        socket.on('connect', function(res){
          console.log('[botcentralWebsocket] botcentral server connect successful', res);
          vm.status = true;
          vm.setOnBotResponse()
          cb(null, true);
        });
        socket.on('connection', function(res){
          console.log('[botcentralWebsocket] botcentral server connection successful', res);
          vm.status = true;
        });

        socket.on('closed', data => {
          console.log('[botcentralWebsocket] botcentral server connection closed', data);
          vm.status = false;
        });

        socket.on('error', (err) => {
          console.log('[botcentralWebsocket] botcentral server error', err);
          vm.status = false;
          // vm.api.notifyError('BC_SOCKET', err.stack);
        });
        socket.on('connect_error', (error) => {
          console.log('[botcentralWebsocket] botcentral server connection error', error);
          vm.status = false;
        });

        socket.on('reconnect_attempt', () => {
          socket.io.opts.transports = ['websocket'];
          console.log('[botcentralWebsocket] botcentral server connection reconnect_attempt');
        });

        socket.on('disconnect', (reason) => {
          console.log('[botcentralWebsocket] botcentral server connection disconnect', reason);
          vm.status = false;
        });

        socket.on('reconnecting', (attemptNumber) => {
          console.log('[botcentralWebsocket] botcentral server connection reconnecting', attemptNumber);
        });
        return socket;
      }catch(e){
        cb(e, false);
      }
    }

    closeSocketConnection(cb){
      let vm = this;
      this.ws.on('disconnect', reason => {
        console.log('[botcentralWebsocket] botcentral server connection disconnected', reason);
        vm.status = false;
        cb(null, true);
      });
      try{
        this.getSocket().close();
      }catch(e){
        cb(e, false);
      }
    }

    setOnBotResponse() {
      let vm = this;
      vm.ws.on('botresponse', (res) => {
        vm.processBotResponse(res);
      });
    }

    processBotResponse(res) {
      let vm = this;
      if(!res) { return; }
      let recipient_id = res.recipient.id;
      if (res.sender_action) {
        if(res.sender_action == 'typing_on') {
            vm.onTyping(res);
        } else {
            vm.onTypingOff(res);
        }
        return;
      }
      console.log(`[botresponse][consumerId:${recipient_id}] ${JSON.stringify(res)}`);
      vm.removeFromMessageCache(recipient_id);
      if(res.message && res.message.text
        && res.message.text.split('\n')[0] == AgentConfig.defaultMsg.defaultCloseConversationMessage) {
        vm.onEndConversation(res);
        return
      }

      if(res.message && res.message.text
        && res.message.text.split('\n')[0] == AgentConfig.defaultMsg.defaultCloseDialogMessage) {
        vm.onCloseDialog(res);
        return
      }

      // send the bot response message
      if(res.message.text != AgentConfig.defaultMsg.defaultEmptyMessage) {
          vm.onMessage(res);
      } else {
        console.log(`[botresponse][_ignore_message_][${recipient_id}]`, res.message.text)
      }

      // escalate the chat
      if(res.agentEscalation) {
          vm.onEscalation(res);
      }
    }

    logMaskedMsgObj(msgObj){
      var clonedMsgObj = JSON.parse(JSON.stringify(msgObj));
      var text = clonedMsgObj.entry[0].messaging[0].message.text;
      var fileInfo = clonedMsgObj.entry[0].messaging[0].message.fileInfo;
      if(text!=undefined && text!=null && text!='')
        clonedMsgObj.entry[0].messaging[0].message.text = text.substring(0, Math.min(AgentConfig.maskedMessageLength, text.length));
      if(fileInfo!=undefined && fileInfo!=null){
        if(fileInfo.caption!=undefined && fileInfo.caption!=null && fileInfo.caption!='')
          clonedMsgObj.entry[0].messaging[0].message.fileInfo.caption = fileInfo.caption.substring(0, Math.min(AgentConfig.maskedMessageLength, fileInfo.caption.length));
      }
      console.log(`${JSON.stringify(clonedMsgObj)}`);
    }

    sendMessage(message, botId, userMeta, count = 1) {
      if(!userMeta) {
        console.log('[userMessage] userMeta not found!')
        return
      }
        let mid = userMeta['mid'];

        let conversationId = userMeta['dialogId'];
      if(count > AgentConfig.misc.messageResendMaxRetries) {
        if(!userMeta.consumerId.toUpperCase().startsWith('MANAGER')){
          console.log(`${JSON.stringify(userMeta)}`);
          console.log(`[MESSAGE_RESEND_EXCEED_MAX_RETRIES][count: ${count}] Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`); 
          //, Message: ${JSON.stringify(message)}]`);/* Commenting the message for security reasons */
          //console.log(`Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`);
        }
        return;
      }

      // console.log(`Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`);
      try {
        var msgObj = this.converter.convertToBCMessage(message, botId, userMeta);
        console.log(`[userMessage][consumerId: ${userMeta.consumerId}][count: ${count}]`);
        this.logMaskedMsgObj(msgObj);
        this.ws.emit('usermessage', msgObj);

        if(message instanceof Object || !CB_keywords.includes(message)) {
            this.addToMessageCache(message, botId, userMeta, count);
        }
      } catch(e) {
        console.log(`[userMessage][consumerId: ${userMeta.consumerId}]`,e)
      }
    }

    addToMessageCache(message, botId, userMeta, count) {
      if(userMeta.consumerId in this.messageCache) {
        clearTimeout(this.messageCache[userMeta.consumerId]);
      }

      this.messageCache[userMeta.consumerId] = setTimeout(()=>{
        this.sendMessage(message, botId, userMeta, count+1)
      }, AgentConfig.misc.retryMessageInterval * count);
    }

    // sendImageMsg(userMeta) {
    //   this.sendMessage(AgentConfig.defaultMsg.defaultImageReceivedMessage, userMeta);
    // }

    // sendEscalationFailMsg(userMeta) {
    //   this.sendMessage(AgentConfig.defaultMsg.defaultEscalationFailMessage, userMeta);
    // }

    // sendResetMsg(userMeta) {
    //   this.sendMessage('freset', userMeta);
    // }

    removeFromMessageCache(consumerId) {
      if(this.messageCache[consumerId]) {
        clearTimeout(this.messageCache[consumerId]);
        delete this.messageCache[consumerId];
      }
    }


    setOnMessageCallback(cb) {
      this.onMessage = cb;
    }

    setOnEscalationCallback(cb) {
      this.onEscalation = cb;
    }

    setOnTypingOnCallback(cb) {
      this.onTyping = cb
    }

    setOnCloseDialog(cb) {
      this.onCloseDialog = cb
    }

    setOnTypingOffCallback(cb) {
      this.onTypingOff = cb
    }

    setOnEndConversation(cb) {
      this.onEndConversation = cb
    }
}

module.exports = BotCentralWebSocket;
