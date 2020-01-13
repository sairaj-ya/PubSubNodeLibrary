const BCAgent = require('./BotCentralWebSocket');
const ms = require('../BotCentralLib/ConversationDataStore').getConversationDataStore();

class CBMessageWrapper{
    constructor() {
    }
    init(environment, botId, botMessageEventHandler, cb) {
        try{
            this.bc = new BCAgent(environment);
            this.botMessageHandler = botMessageEventHandler;
            this.registerBCCallbacks();
            cb(null, true);
        }catch(e) {
            logger.error('[CBMessageWrapper Initialization Exception]', e);
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
    
          if(type == 'luis') {
            this._sendLuisData(dialogId, content);
            return;
          }
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
        let { originatorId, dialogId, message } = lastItem;
        ms.addLPMessage(originatorId, lastItem);
    
        if(typeof message === 'string' || message instanceof String) {
          if(message == '__APPLEPAY_SUCCESS__'
          || message == '__APPLEPAY_FAILURE__'
          || message == AgentConfig.defaultMsg.defaultStepupMessage) {
            // user entered __APPLEPAY_SUCCESS__ or system keyword, ignore...
            return;
          }
          if(lastItem.metadata) {
            let meta = lastItem.metadata.filter((item)=> item.type === 'ConnectorPaymentResponse');
            if(meta.length === 1) {
              message = '__APPLEPAY_SUCCESS__';
              if(meta[0].status === false) {
                  message = '__APPLEPAY_FAILURE__';
              }
            }
          }
          logger.info(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: Message: ${message==undefined || message==null || message.trim()==''? '':message.substring(0, Math.min(AgentConfig.maskedMessageLength, message.length))}`);  //: ${message}`) /* Commented to align with security constraints */
          this._processAndSendMessage(dialogId, message, lastItem.sequence, botId);
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
}
module.exports = CBMessageWrapper;