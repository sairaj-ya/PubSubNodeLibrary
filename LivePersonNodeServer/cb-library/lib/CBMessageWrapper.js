const BCAgent = require('./BotCentralWebSocket');
const ms = require('./ConversationDataStore').getConversationDataStore();
const messagingUtil = require('./LPMessagingUtil');
const evUtil = require('./eventHelper');
const leEvents = require('./LiveEngageEvents');

class CBMessageWrapper{
    constructor() {
    }
    init(environment, cb) {
        try{
            this.bc = new BCAgent(environment, cb);
            //this.botMessageHandler = botMessageEventHandler;
            //this.registerBCCallbacks();
        }catch(e) {
            console.log('[CBMessageWrapper Initialization Exception]', e);
            cb(e, false);
        }
    }

    stop(cb){
        try{
            this.bc.closeSocketConnection(cb);
        }catch(e) {
            console.log('[CBMessageWrapper Stop Exception]', e);
            cb(e, false);
        }
    }

    getStatus(){
        return this.bc.getSocketStatus();
    }

    subscribeCallBacks(botMessageEventHandler, cb){
        try{
            this.botMessageHandler = botMessageEventHandler;
            this.registerBCCallbacks();
            cb(null, true);
        }catch(e) {
            console.log('[CBMessageWrapper Subscribe Callback Exception]', e);
            cb(e, false);
        }
    }

    registerBCCallbacks() {
        /**
         * Register callbacks for Botcentral websocket
         */
        this.bc.setOnMessageCallback(this.sendMessageToLP.bind(this));
        this.bc.setOnTypingOnCallback(this.onTypingEvent.bind(this));
        this.bc.setOnTypingOffCallback(this.onTypingEvent.bind(this));
        this.bc.setOnEndConversation(this.onEndConversation.bind(this));
        this.bc.setOnCloseDialog(this.onCloseDialog.bind(this));
    }

    onEndConversation(res) {
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) {return;}
        this.botMessageHandler(evUtil.getEndConvEvent(meta['dialogId']), leEvents.endConversation);
    }
    
    onCloseDialog(res) {
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) {return;}
        let reason = 'random reason';
        let closeDialogObj = evUtil.getCloseDialogEvent(meta['dialogId'], reason)
        this.botMessageHandler(evUtil.getEndConvEvent(meta['dialogId']), leEvents.closeConversation);
      }  

    onTypingEvent(res) {
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) { return; }
        let state = '';
        if(res.sender_action == 'typing_on')  { state = 'COMPOSING' }
        else if(res.sender_action == 'typing_off') { state = 'PAUSE' }
        else { return; }
        this.botMessageHandler(evUtil.getTypingEvent(meta['dialogId'], state), leEvents.publish);
      }

    sendMessageToLP(res){
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) { return; }
        let { dialogId, userType } = meta;
        var lpObj = this.bc.convertMessage(res.message, userType);
        this.sendTransformedMessage(dialogId, lpObj, meta['consumerId']);
    }
    sendTransformedMessage(dialogId, lpObj, consumerId) {
        if(lpObj) {
          let {
            type, content, message, quickReplies, meta
          } = lpObj;
    
        //   if(type == 'luis') {
        //     this._sendLuisData(dialogId, content);
        //     return;
        //   }
          let eventObj = evUtil.getEvent(dialogId, lpObj);
          ms.addBCMessage(consumerId, lpObj);
          if(eventObj) {
            this.botMessageHandler(eventObj, leEvents.publish);
          }
        }
    }

    sendToConversationBuilder(messageItem, botId, agentInfo) {
        let { originatorId, dialogId, message } = messageItem;
        ms.addLPMessage(originatorId, messageItem);
    
        if(typeof message === 'string' || message instanceof String) {
          if(message == '__APPLEPAY_SUCCESS__'
          || message == '__APPLEPAY_FAILURE__'
          || message == '_STEPUP_') {
            // user entered __APPLEPAY_SUCCESS__ or system keyword, ignore...
            return;
          }
          if(messageItem.metadata) {
            let meta = messageItem.metadata.filter((item)=> item.type === 'ConnectorPaymentResponse');
            if(meta.length === 1) {
              message = '__APPLEPAY_SUCCESS__';
              if(meta[0].status === false) {
                  message = '__APPLEPAY_FAILURE__';
              }
            }
          }
          console.log(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: Message: ${message==undefined || message==null || message.trim()==''? '':message.substring(0, Math.min(4, message.length))}`);
          this._processAndSendMessageToCB(dialogId, message, messageItem.sequence, botId, agentInfo);
        } else {
          console.log(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: [Not Supported type For Bot Survey]`);
        }
    }

    _processAndSendMessageToCB(dialogId, message, sequence, botId, agentInfo) {
        let meta = ms.getMetaObjectFromDialogId(dialogId);
        if(!meta) {return;}
        let consumerId = meta['consumerId'];
        meta['mid'] = `${dialogId}-${sequence}`;
        if(!meta.lpChatInfo.conversationType)
          meta.lpChatInfo.conversationType = "messaging";
        if(!meta.agentInfo || !meta.agentInfo.accountId || !meta.agentInfo.accountUser){
          meta.agentInfo = {};
          meta.agentInfo.accountId = !agentInfo || !agentInfo.accountId ? null : agentInfo.accountId;
          meta.agentInfo.accountUser = !agentInfo || !agentInfo.accountUser ? null : agentInfo.accountUser;
        }
        this.bc.sendMessage(message, botId, meta);
    }

    isStepUp(c) {
        let dialogId = c.result.convId;
        if(!ms.containDialogId(dialogId)) {
          return false;
        }

        const newConsumerId = c.result.conversationDetails.participants.filter(p => p.role === "CONSUMER")[0].id;
        let metaObj = ms.getMetaObjectFromDialogId(dialogId);
        let newMeta = metaObj['consumerId'].split(":::");
        if (metaObj['consumerId'] == newConsumerId || (newMeta.length>1 && newMeta[1] === newConsumerId)) {
          return false;
        }
        return true;
    }

    onUserConnected(dialogId, change, lpUserInfoListObj, cb) {
        try{
            if (change.type === 'UPSERT' && (!ms.containDialogId(dialogId) || this.isStepUp(change))) {
                let stepUpOccured = false;
                if(this.isStepUp(change)) {
                    stepUpOccured = true;
                }
                console.log(`[onUserConnected][dialogId: ${dialogId}]`, change);
                ms.addToMetaStore(dialogId, {});
                const consumerId = change.result.conversationDetails.participants.filter(p => p.role === "CONSUMER")[0].id;
                if (consumerId) {
                    this.setConversationDetails(dialogId, change.result.conversationDetails);
                    change.result.conversationDetails.participants.forEach(p => {
                      if (p.role === 'CONSUMER') {
                        let userId = p.id;
                        ms.addUserToDialogPair(userId, dialogId);
                        ms.updateKey(dialogId, 'consumerId', userId);
                        console.log(`[onUserConnected][ACCEPTED][dialogId:${dialogId}][consumerId::${userId}]`);
                        if(lpUserInfoListObj==null)
                          lpUserInfoListObj = [];
                        ms.updateKey(dialogId, 'lpUserInfoList', lpUserInfoListObj);
                      }
                    });
                }
            }else if (change.type === 'DELETE') {
                console.log(`[onUserConnected][DELETE][dialogId:${dialogId}]`);
                // conversation was closed or transferred
                ms.removeFromMetaStore(dialogId);
            }
            cb(null, true);
        }catch(e){
            cb(e, null);
        }
    }
    setConversationDetails(dialogId, convDetails) {
        if(convDetails && convDetails.context) {
          let contextType = convDetails.context.type;
          if(convDetails.context.name && (convDetails.context.name == "RCS Business Messaging" || convDetails.context.name.toLowerCase().includes("rcs"))) {
            contextType = 'grbmIncoming';
          }
          ms.updateKey(dialogId, 'userType', contextType);
          let chatInfo = ms.getByKey(dialogId, 'lpChatInfo');
          if(!chatInfo) {
            chatInfo = messagingUtil.getChatInfo(convDetails);
            ms.updateKey(dialogId, 'lpChatInfo', chatInfo);
          }
        }
    }
}
module.exports = CBMessageWrapper;