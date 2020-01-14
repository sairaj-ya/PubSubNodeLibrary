const logger = require('./BotCentralLogging');
const io = require('socket.io-client');

const RedisQueue = require('./RedisQueue')
const MessageConverter = require('./MessageConverter')
const HostConfig = require('../config/HostConfig');
const AgentConfig = require('../config/AgentConfig');

const CB_keywords = [
  'freset', 'reset', '__agent_escalation_failed__', '__image_received__'
]

const rq = RedisQueue.getRedisQueue();

class BotCentralWebSocket {
    constructor(environment, cb) {
      this.converter = new MessageConverter();
      this.status = false;
      this.messageCache = {};
      this.ws = this.initializeSocket(environment, cb);
      //this.setOnBotResponse();
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
      let path = 'ws://localhost:9092';
      logger.info(`[botcentralWebsocket] bot environment : ${env}`);
      if(env == 'dev') {
        path = 'wss://dev.msg.botcentralapi.com';
        logger.info('Connecting to dev socket server')
      } else if (env == 'local') {
        logger.info('Connecting to local socket server')
        path = 'ws://localhost:9092/';
      } else {
        path = HostConfig['websocket']['path'];
        logger.info('[botcentralWebsocket] Connecting to prod socket server', path)
      }
      try{
        var socket = io(path,
          {
            transports: ['websocket'],
            rejectUnauthorized: false,
            forceNode: true
          });
        socket.on('connect', function(res){
          logger.info('[botcentralWebsocket] botcentral server connect successful', res);
          vm.status = true;
          cb(null, true);
        });
        socket.on('connection', function(res){
          logger.info('[botcentralWebsocket] botcentral server connection successful', res);
          vm.status = true;
        });

        socket.on('closed', data => {
          logger.info('[botcentralWebsocket] botcentral server connection closed', data);
          vm.status = false;
        });

        socket.on('error', (err) => {
          logger.info('[botcentralWebsocket] botcentral server error', err);
          vm.status = false;
          // vm.api.notifyError('BC_SOCKET', err.stack);
        });
        socket.on('connect_error', (error) => {
          logger.info('[botcentralWebsocket] botcentral server connection error', error);
          vm.status = false;
        });

        socket.on('reconnect_attempt', () => {
          socket.io.opts.transports = ['websocket'];
          logger.info('[botcentralWebsocket] botcentral server connection reconnect_attempt');
        });

        socket.on('disconnect', (reason) => {
          logger.info('[botcentralWebsocket] botcentral server connection disconnect', reason);
          vm.status = false;
        });

        socket.on('reconnecting', (attemptNumber) => {
          logger.info('[botcentralWebsocket] botcentral server connection reconnecting', attemptNumber);
        });
        return socket;
      }catch(e){
        cb(e, false);
      }
    }

    closeSocketConnection(cb){
      let vm = this;
      this.ws.on('disconnect', reason => {
        logger.info('[botcentralWebsocket] botcentral server connection disconnected', reason);
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
      logger.info(`[botresponse][consumerId:${recipient_id}] ${JSON.stringify(res)}`);
      vm.removeFromMessageCache(recipient_id);
      rq.updateLastBCMessageTimestamp();
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
        logger.info(`[botresponse][_ignore_message_][${recipient_id}]`, res.message.text)
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
      logger.info(`${JSON.stringify(clonedMsgObj)}`);
    }

    sendMessage(message, botId, userMeta, count = 1) {
      if(!userMeta) {
        logger.warn('[userMessage] userMeta not found!')
        return
      }
        let mid = userMeta['mid'];

        let conversationId = userMeta['dialogId'];
        let botId = AgentConfig.botId;
      if(count > AgentConfig.misc.messageResendMaxRetries) {
        if(!userMeta.consumerId.toUpperCase().startsWith('MANAGER')){
          logger.info(`${JSON.stringify(userMeta)}`);
          logger.error(`[MESSAGE_RESEND_EXCEED_MAX_RETRIES][count: ${count}] Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`); 
          //, Message: ${JSON.stringify(message)}]`);/* Commenting the message for security reasons */
          //logger.error(`Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`);
        }
        return;
      }

      // logger.error(`Stuck_conversation botId:${botId} conversationId:${conversationId} msgId:${mid}`);
      try {
        var msgObj = this.converter.convertToBCMessage(message, botId, userMeta);
        logger.info(`[userMessage][consumerId: ${userMeta.consumerId}][count: ${count}]`);
        this.logMaskedMsgObj(msgObj);
        this.ws.emit('usermessage', msgObj);

        if(message instanceof Object || !CB_keywords.includes(message)) {
            this.addToMessageCache(message, botId, userMeta, count);
        }
      } catch(e) {
        logger.error(`[userMessage][consumerId: ${userMeta.consumerId}]`,e)
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
