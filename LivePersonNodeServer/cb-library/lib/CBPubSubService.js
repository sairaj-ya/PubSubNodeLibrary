const convBuilderWrapper = require('./CBMessageWrapper');

const convBuilder = new convBuilderWrapper();
class CBPubSubService {
    constructor() {
    }

    publishToConversationBuilder(messageItem, botId, agentInfo, cb) {
        //implementation of publish to CB.
        try {
            convBuilder.sendToConversationBuilder(messageItem, botId, agentInfo);
            cb(null, true);
        }catch(e) {
            console.log('[ConversationBuilder Publish Event implementation Exception]', e);
            cb(e, null);
        }
    }

    registerDialogueToConversationBuilder(dialogId, change, lpUserInfoListObj, cb){
        try {
            convBuilder.onUserConnected(dialogId, change, lpUserInfoListObj, (err, isRegisterSuccess) => {
                if(err) {
                    console.log(`[ConversationBuilder Register Dialogue Exception]`,err);
                    cb(err, null);
                    return;
                }    
                cb(null, isRegisterSuccess);
            })
        }catch(e) {
            console.log('[ConversationBuilder Register Dialogue implementation Exception]', e);
            cb(e, null);
        }
    }
    
    subscribeToConversationBuilder(botMessageEventHandler, cb){
        try{
            convBuilder.subscribeCallBacks(botMessageEventHandler, (err, isSubscribeSuccess) => {
                if(err) {
                    console.log(`[ConversationBuilder Subscribe Exception]`,err);
                    cb(err, null);
                    return;
                }    
                cb(null, isSubscribeSuccess);
            })
        }catch(e) {
            console.log('[ConversationBuilder Subscribe implementation Exception]', e);
            cb(e, null);
        }
    }

    startCBConnection(environment, cb){
        try{
            convBuilder.init(environment, (err, isStartSuccess) => {
                if(err) {
                    console.log(`[ConversationBuilder connection Start Exception]`,err);
                    cb(err, null);
                    return;
                }
                console.log(`[ConversationBuilder connection Start Successful]`);
                cb(null, isStartSuccess);
            })
        }catch(e) {
            console.log('[ConversationBuilder connection Start Exception]', e);
            cb(e, null);
        }
    }

    stopCBConnection(cb){
        try{
            convBuilder.stop((err, isStopSuccess) => {
                if(err) {
                    console.log(`[ConversationBuilder connection Stop Exception]`,err);
                    cb(err, null);
                    return;
                }
                console.log(`[ConversationBuilder connection Stop Successful]`);
                cb(null, isStopSuccess);
            })
        }catch(e) {
            console.log('[ConversationBuilder connection Stop implementation Exception]', e);
            cb(e, null);
        }
    }

    cbConnectionStatus(){
        return convBuilder.getStatus();
    }
}

module.exports = CBPubSubService;