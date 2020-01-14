const logger = require('./BotCentralLogging');
const convBuilderWrapper = require('./CBMessageWrapper');

const convBuilder = new convBuilderWrapper();
class CBPubSubService {
    constructor() {
    }

    // call this method for publishing a user message to the bot.
    // @messageItem - message from the UMS.
    // @botId - BotID of the bot, to which this message to be published.
    // Sends true if no exception while sending the data to Conversation Builder
    // Sends false if there is any exception in publish
    // error is not null, if there is any exception in the process.
    publishToConversationBuilder(messageItem, botId, cb) {
        //implementation of publish to CB.
        try {
            convBuilder.sendToConversationBuilder(messageItem, botId);
            cb(null, true);
        }catch(e) {
            logger.error('[ConversationBuilder Publish Event implementation Exception]', e);
            cb(e, null);
        }
    }

    registerDialogueToConversationBuilder(dialogId, change, cb){
        try {
            convBuilder.onUserConnected(dialogId, change, (err, isRegisterSuccess) => {
                if(err) {
                    logger.error(`[ConversationBuilder Register Dialogue Exception]`,err);
                    cb(err, null);
                    return;
                }    
                cb(null, isRegisterSuccess);
            })
        }catch(e) {
            logger.error('[ConversationBuilder Register Dialogue implementation Exception]', e);
            cb(e, null);
        }
    }

    //call this method to get  botId corresponding to a skillId.
    // @skillID - skill ID.
    // returns the botID 
    // error is not null, if there is any exception in the process.
    // getBotDetails(skillID, cb){
    //     try{
    //         calltoimplementation(skillID, (err, botId) => {
    //             if(err) {
    //               logger.error(`[ConversationBuilder Get Bot Details Exception]`,err);
    //               cb(err, null);
    //               return;
    //             }        
    //             cb(null, botId);
    //         })
    //     }catch(e) {
    //         logger.error('[ConversationBuilder Get Bot Details implementation Exception]', e);
    //         cb(e, null);
    //     }
    // }
    
    // call this method to subscribe for the bots responses.
    // @LPAgent - the Live Person bot agent, which is answering this conversation.
    // Sends true if the subscribe is successful
    // Sends false if subscribe failed
    // error is not null, if there is any exception in the process.
    subscribeToConversationBuilder(botMessageEventHandler, cb){
        try{
            convBuilder.init(environment, botId, botMessageEventHandler, (err, isSubscribeSuccess) => {
                if(err) {
                    logger.error(`[ConversationBuilder Subscribe Exception]`,err);
                    cb(err, null);
                    return;
                }    
                cb(null, isSubscribeSuccess);
            })
        }catch(e) {
            logger.error('[ConversationBuilder Subscribe implementation Exception]', e);
            cb(e, null);
        }
    }

    startCBConnection(environment, cb){
        try{
            convBuilder.init(environment, (err, isStartSuccess) => {
                if(err) {
                    logger.error(`[ConversationBuilder connection Start Exception]`,err);
                    cb(err, null);
                    return;
                }
                logger.info(`[ConversationBuilder connection Start Successful]`);
                cb(null, isStartSuccess);
            })
        }catch(e) {
            logger.error('[ConversationBuilder connection Start Exception]', e);
            cb(e, null);
        }
    }

    stopCBConnection(cb){
        try{
            convBuilder.stop((err, isStopSuccess) => {
                if(err) {
                    logger.error(`[ConversationBuilder connection Stop Exception]`,err);
                    cb(err, null);
                    return;
                }
                logger.info(`[ConversationBuilder connection Stop Successful]`);
                cb(null, isStopSuccess);
            })
        }catch(e) {
            logger.error('[ConversationBuilder connection Stop implementation Exception]', e);
            cb(e, null);
        }
    }

    cbConnectionStatus(){
        return convBuilder.getStatus();
    }
}

module.exports = CBPubSubService;