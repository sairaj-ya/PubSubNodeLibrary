const BCAgent = require('./BotCentralWebSocket');
const ms = require('../BotCentralLib/ConversationDataStore').getConversationDataStore();
const messagingUtil = require('../src/LPMessagingUtil');
const logger = require('./BotCentralLogging');

class CBMessageWrapper{
    constructor() {
    }
    init(environment, cb) {
        try{
            this.bc = new BCAgent(environment, cb);
            //this.botMessageHandler = botMessageEventHandler;
            //this.registerBCCallbacks();
        }catch(e) {
            logger.error('[CBMessageWrapper Initialization Exception]', e);
            cb(e, false);
        }
    }

    stop(cb){
        try{
            this.bc.closeSocketConnection(cb);
        }catch(e) {
            logger.error('[CBMessageWrapper Stop Exception]', e);
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
            logger.error('[CBMessageWrapper Subscribe Callback Exception]', e);
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
        this.botMessageHandler(evUtil.getEndConvEvent(meta['dialogId']), "EndConversationEvent", (e,res) => {
          if(e) {
            logger.error(LOG_HEADER('onEndConversation',meta), e);
          } else {
            logger.info(LOG_HEADER('onEndConversation',meta), res);
            //this.bc.sendResetMsg(meta);
          }
        });
    }
    
    onCloseDialog(res) {
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) {return;}
        let reason = 'random reason';
        let closeDialogObj = evUtil.getCloseDialogEvent(meta['dialogId'], reason)
        this.botMessageHandler(evUtil.getEndConvEvent(meta['dialogId']), "CloseConversationEvent", (e,res) => {
          if(e) {
            logger.error(LOG_HEADER('onCloseDialog', meta), e, JSON.stringify(closeDialogObj), res)
          } else {
            logger.info(LOG_HEADER('onCloseDialog', meta), res);
            //this.bc.sendResetMsg(meta);
          }
        });
      }

    onTypingEvent(res) {
        let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
        if(!meta) { return; }
        let state = '';
        if(res.sender_action == 'typing_on')  { state = 'COMPOSING' }
        else if(res.sender_action == 'typing_off') { state = 'PAUSE' }
        else { return; }
        this.publishEvent(evUtil.getTypingEvent(meta['dialogId'], state));
        this.botMessageHandler(evUtil.getTypingEvent(meta['dialogId'], state), "PublishEvent", (e, res) => {
            if(e) {
                logger.info(`[BotStudio bot Message Handler][onTyping][Event type: PublishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}][LP_logger.error]`);
            } else {
                logger.info(`[BotStudio bot Message Handler][onTyping][Event type: PublishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}]`, JSON.stringify(eventObj), res);
            }
        });
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
            this.botMessageHandler(eventObj, "PublishEvent", (e, res) => {
                if(e) {
                  logger.info(`[BotStudio bot Message Handler][Send Message][Event type: PublishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}][LP_logger.error]`, JSON.stringify(eventObj), e);
                } else {
                  logger.info(`[BotStudio bot Message Handler][Send Message][Event type: PublishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}]`, JSON.stringify(eventObj), res);
                }
            });
          }
        }
    }

    sendToConversationBuilder(messageItem, botId) {
        let { originatorId, dialogId, message } = messageItem;
        ms.addLPMessage(originatorId, messageItem);
    
        if(typeof message === 'string' || message instanceof String) {
          if(message == '__APPLEPAY_SUCCESS__'
          || message == '__APPLEPAY_FAILURE__'
          || message == AgentConfig.defaultMsg.defaultStepupMessage) {
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
          logger.info(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: Message: ${message==undefined || message==null || message.trim()==''? '':message.substring(0, Math.min(AgentConfig.maskedMessageLength, message.length))}`);  //: ${message}`) /* Commented to align with security constraints */
          this._processAndSendMessage(dialogId, message, messageItem.sequence, botId);
        } else {
            logger.info(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: [Not Supported type For Bot Survey]`);
        }
    }

    _processAndSendMessageToCB(dialogId, message, sequence, botId) {
        let meta = ms.getMetaObjectFromDialogId(dialogId);
        if(!meta) {return;}
        let consumerId = meta['consumerId'];
        meta['mid'] = `${dialogId}-${sequence}`;
        this.bc.sendMessage(message.join(' '), botId, meta);
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

    onUserConnected(dialogId, change, cb) {
        try{
            if (change.type === 'UPSERT' && (!ms.containDialogId(dialogId) || this.isStepUp(change))) {
                let stepUpOccured = false;
                if(this.isStepUp(change)) {
                    stepUpOccured = true;
                }
                logger.info(`[onUserConnected][dialogId: ${dialogId}]`, change);
                ms.addToMetaStore(dialogId, {});
                const consumerId = change.result.conversationDetails.participants.filter(p => p.role === "CONSUMER")[0].id;
                if (consumerId) {
                    this.setConversationDetails(dialogId, change.result.conversationDetails);
                }
            }else if (change.type === 'DELETE') {
                logger.info(`[onUserConnected][DELETE][dialogId:${dialogId}]`);
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