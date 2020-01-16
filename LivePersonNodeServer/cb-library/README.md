# cb-library

> Conversation Builder node sdk to communicate with the conversation Builder bots

### Install

run `npm install` on the root folder to import all the required dependencies

### Quick Start Example

## start connection with the conversation builder
this api is needed to start the connection with the conversation builder
@environment is the input to this method.
Accepted environment values are following:
    "aws-us" 
    "aws-eu" 
    "aws-ap" 
    "dev"
    "local"
    "alpha"
    "lp-alpha"
    "us-staging"
    "lp-qa"
    "lp-us-va"
    "lp-lo-eu"
    "lp-ap-sy"
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

//inputs
// @environment, @callback
pubSub.startCBConnection('dev', (err, isSuc)=>{
    if(err){
        console.log(`Error while starting the cb`);
    }else{
        console.log(`Successfully connected the cb`);
        console.log(pubSub.cbConnectionStatus());
    }
});

```
## stop connection with the conversation builder
this api is needed to stop the connection with the conversation builder
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

//inputs
//@callback
pubSub.stopCBConnection((err, isSuc)=>{
    if(err){
        console.log(`Error while stopping the cb`);
    }else{
        console.log(`Successfully stopped the cb`);
        console.log(pubSub.cbConnectionStatus());
    }
});

```

## status of the conversation builder connection status
this api is needed to get the status of the connection with the conversation builder
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

pubSub.cbConnectionStatus();

```

## Set last Sequence for the dialogue
this api is needed to set the last responded sequence id for the dialogue Id
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

//inputs
// dialogue Id,
//sequence Id,
//@callback
var seqId = 1
pubSub.setLastSequenceForDialogue("e4bee960-af74-4930-87f7-05550171d783", seqId, (err, reply)=>{
    if(err){
        console.log(`Error while setting to redis ${err}`);
    }else{
        console.log(`reply for the set to redis : ${reply}`);
    }

});

```

## get last Sequence for the dialogue
this api is needed to get the last responded sequence id set for the dialogue Id in the redis
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

//inputs
// dialogue Id,
//@callback
var seqId = 1
pubSub.getLastSequenceForDialogue("e4bee960-af74-4930-87f7-05550171d783", (err, val)=>{
    if(err){
        console.log(`Error while getting from redis: ${err}`);
    }else{
        console.log(`last sequence: ${val}`);
    }
})

```

## Delete the dialogue from redis
this api is needed to delete the dialogue Id from the redis
```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

//inputs
// dialogue Id,
//@callback
var seqId = 1
pubSub.removeDialogueSequenceMapping("e4bee960-af74-4930-87f7-05550171d783", (err, reply)=>{
    if(err){
        console.log(`Error while deleting from redis: ${err}`);
    }else{
        console.log(`Deleted the mapping for dialogueId: e4bee960-af74-4930-87f7-05550171d783 and reply from the redis is: ${reply}`);
    }
})

```

## subscribe to ConversationBuilder
call this api to subscribe for the bots responses
@botMessageEventHandler is the handler function you need to provide to pass as an argument. This method is called when ever there is a bot response.

@botMessageEventHandler should have two arguments, 
@obj- response object from the Bot, @eventType- node agent event type.

```javascript

const convBuilderPubSub = require('./cb-library');
const pubSub = new convBuilderPubSub();

pubSub.startCBConnection('dev', (err, isSuc)=>{
    if(err){
        console.log(`error while starting the cb`);
    }else{
        console.log(`successfully connected`);
        pubSub.subscribeToConversationBuilder(printFunc,(err, isSuc)=>{
            if(err){
                console.log(`error while subscribing to cb`);
            }else{
                console.log(`successfully subscribed`);
            }
        });
    }
});

function printFunc(obj, eventType){
    console.log(`Bot response`);
    console.log(eventType);
    console.log(JSON.stringify(obj));
}

```

## register dialogue to ConversationBuilder
call this method to subscribe any upsert or delete events triggered by the ums with the conversation builder.
@dialogId- dialog id for which the upsert event or delete event is triggered.
@change- change object is emitted by the ums, on 'cqm.ExConversationChangeNotification' event
@lpUserInfoListObj - is an optional field, it can be an empty array([]) or refer to example_lpUserInfoListObj.json for an example structure

```javascript

const convBuilderPubSub = require('./cb-library');

const pubSub = new convBuilderPubSub();

pubSub.startCBConnection('dev', (err, isSuc)=>{
    if(err){
        console.log(`error while starting the cb`);
    }else{
        console.log(`successfully connected`);
        console.log(pubSub.cbConnectionStatus());
        pubSub.subscribeToConversationBuilder(printFunc,(err, isSuc)=>{
            if(err){
                console.log(`error while subscribing to cb`);
            }else{
                console.log(`successfully subscribed`);
                console.log(pubSub.cbConnectionStatus());
                pubSub.registerDialogueToConversationBuilder("e4bee960-af74-4930-87f7-05550171d783", upsertObj, lpUserInfoList, (err, isSuc)=>{
                    if(err){
                        console.log(`register failed`);
                    }else{
                        console.log(`register success`);
                    }
                });
            }
        });
    }
});

function printFunc(obj, eventType){
    console.log(`Bot response`);
    console.log(eventType);
    console.log(JSON.stringify(obj));
}


lpUserInfoList = [];

upsertObj = refer to the object defined in the below section

```

## publish to ConversationBuilder
this method is called to publish any message to the conversation Builder
following are the three arguments to the method:
@messageItem- message object emitted by the ums, 
@botId- is the bot id to which you want publish the message to, 
@agentInfo- is the object with agent with account id and account user info
(example: agentInfo = { accountId : "21692729", accountUser : "920631632"})
this is an optional parameter

```javascript

const convBuilderPubSub = require('./cb-library');

const pubSub = new convBuilderPubSub();

pubSub.startCBConnection('dev', (err, isSuc)=>{
    if(err){
        console.log(`error while starting the cb`);
    }else{
        console.log(`successfully connected`);
        console.log(pubSub.cbConnectionStatus());
        pubSub.subscribeToConversationBuilder(printFunc,(err, isSuc)=>{
            if(err){
                console.log(`error while subscribing to cb`);
            }else{
                console.log(`successfully subscribed`);
                console.log(pubSub.cbConnectionStatus());
                pubSub.registerDialogueToConversationBuilder("e4bee960-af74-4930-87f7-05550171d783", upsertObj, lpUserInfoList, (err, isSuc)=>{
                    if(err){
                        console.log(`register failed`);
                    }else{
                        console.log(`register success`);
                        pubSub.publishToConversationBuilder(mItem, botId, null, (err, isSuc)=>{
                            if(err){
                                console.log(`pub error`);
                            }else{
                                console.log(`pub success`);
                            }
                        });
                    }
                });
            }
        });
    }
});

function printFunc(obj, eventType){
    console.log(`Bot response`);
    console.log(eventType);
    console.log(JSON.stringify(obj));
}

botId ="289e08a08779cc682f70e4e88adab332f1dda2d4";
agentInfo = {
    accountId : "21692729",
    accountUser : "920631632"
}

mItem = {"dialogId":"e4bee960-af74-4930-87f7-05550171d783","sequence":1,"message":"nope","event":{"type":"ContentEvent","message":"nope","contentType":"text/plain"},"serverTimestamp":1579022485877,"originatorMetadata":{"id":"e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec","role":"CONSUMER","clientProperties":{"type":".ClientProperties","appId":"webAsync","ipAddress":"73.15.38.19","deviceFamily":"DESKTOP","os":"OSX","osVersion":"10.14.6","integration":"WEB_SDK","integrationVersion":"3.0.32","browser":"CHROME","browserVersion":"79.0.3945.117","features":["PHOTO_SHARING","CO_BROWSE","QUICK_REPLIES","MARKDOWN_HYPERLINKS","AUTO_MESSAGES","MULTI_DIALOG","FILE_SHARING","RICH_CONTENT"]}},"role":"CONSUMER","originatorId":"e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec","originatorClientProperties":{"type":".ClientProperties","appId":"webAsync","ipAddress":"73.15.38.19","deviceFamily":"DESKTOP","os":"OSX","osVersion":"10.14.6","integration":"WEB_SDK","integrationVersion":"3.0.32","browser":"CHROME","browserVersion":"79.0.3945.117","features":["PHOTO_SHARING","CO_BROWSE","QUICK_REPLIES","MARKDOWN_HYPERLINKS","AUTO_MESSAGES","MULTI_DIALOG","FILE_SHARING","RICH_CONTENT"]}};

lpUserInfoList = [];

upsertObj = {
    "type": "UPSERT",
    "result": {
        "convId": "e4bee960-af74-4930-87f7-05550171d783",
        "effectiveTTR": 1579022638304,
        "conversationDetails": {
            "skillId": "920631532",
            "participants": [{
                "id": "bc17a7b9-8c5c-5b6f-97e4-aa97be4e16f1",
                "role": "ASSIGNED_AGENT"
            }, {
                "id": "e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec",
                "role": "CONSUMER"
            }, {
                "id": "d3716e34-7830-52b5-b6f2-75886099ed2d",
                "role": "MANAGER"
            }],
            "dialogs": [{
                "dialogId": "e4bee960-af74-4930-87f7-05550171d783",
                "participantsDetails": [{
                    "id": "e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec",
                    "role": "CONSUMER",
                    "state": "ACTIVE"
                }, {
                    "id": "d3716e34-7830-52b5-b6f2-75886099ed2d",
                    "role": "MANAGER",
                    "state": "ACTIVE"
                }, {
                    "id": "bc17a7b9-8c5c-5b6f-97e4-aa97be4e16f1",
                    "role": "ASSIGNED_AGENT",
                    "state": "ACTIVE"
                }],
                "dialogType": "MAIN",
                "channelType": "MESSAGING",
                "state": "OPEN",
                "creationTs": 1579021723797,
                "metaDataLastUpdateTs": 1579021723797
            }],
            "state": "OPEN",
            "stage": "OPEN",
            "startTs": 1579021723797,
            "metaDataLastUpdateTs": 1579021725576,
            "firstConversation": true,
            "ttr": {
                "ttrType": "PRIORITIZED",
                "value": 600
            },
            "campaignInfo": {
                "campaignId": 774285730,
                "engagementId": 1039016132
            },
            "context": {
                "type": "SharkContext",
                "lang": "en-US",
                "clientProperties": {
                    "type": ".ClientProperties",
                    "appId": "webAsync",
                    "ipAddress": "73.15.38.19",
                    "deviceFamily": "DESKTOP",
                    "os": "OSX",
                    "osVersion": "10.14.6",
                    "integration": "WEB_SDK",
                    "integrationVersion": "3.0.32",
                    "browser": "CHROME",
                    "browserVersion": "79.0.3945.117",
                    "features": ["PHOTO_SHARING", "CO_BROWSE", "QUICK_REPLIES", "MARKDOWN_HYPERLINKS", "AUTO_MESSAGES", "MULTI_DIALOG", "FILE_SHARING", "RICH_CONTENT"]
                },
                "visitorId": "I5NTdlNmNmNTFhOGU1MTg3",
                "sessionId": "tkgdHRWzQ2OOEI7zBEXWkA",
                "interactionContextId": "6"
            },
            "conversationHandlerDetails": {
                "accountId": "21692729",
                "skillId": "920631532"
            },
            "__myRole": "ASSIGNED_AGENT"
        },
        "lastContentEventNotification": {
            "sequence": 25,
            "originatorClientProperties": {
                "type": ".ClientProperties",
                "appId": "webAsync",
                "ipAddress": "73.15.38.19",
                "deviceFamily": "DESKTOP",
                "os": "OSX",
                "osVersion": "10.14.6",
                "integration": "WEB_SDK",
                "integrationVersion": "3.0.32",
                "browser": "CHROME",
                "browserVersion": "79.0.3945.117",
                "features": ["PHOTO_SHARING", "CO_BROWSE", "QUICK_REPLIES", "MARKDOWN_HYPERLINKS", "AUTO_MESSAGES", "MULTI_DIALOG", "FILE_SHARING", "RICH_CONTENT"]
            },
            "originatorId": "e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec",
            "originatorPId": "e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec",
            "originatorMetadata": {
                "id": "e023f9cd6323aaae533bbca9aa2c989de850c90c29c34f8f6a6d7abd7a6917ec",
                "role": "CONSUMER",
                "clientProperties": {
                    "type": ".ClientProperties",
                    "appId": "webAsync",
                    "ipAddress": "73.15.38.19",
                    "deviceFamily": "DESKTOP",
                    "os": "OSX",
                    "osVersion": "10.14.6",
                    "integration": "WEB_SDK",
                    "integrationVersion": "3.0.32",
                    "browser": "CHROME",
                    "browserVersion": "79.0.3945.117",
                    "features": ["PHOTO_SHARING", "CO_BROWSE", "QUICK_REPLIES", "MARKDOWN_HYPERLINKS", "AUTO_MESSAGES", "MULTI_DIALOG", "FILE_SHARING", "RICH_CONTENT"]
                }
            },
            "serverTimestamp": 1579022038304,
            "event": {
                "type": "ContentEvent",
                "message": "hiiii",
                "contentType": "text/plain"
            },
            "dialogId": "e4bee960-af74-4930-87f7-05550171d783"
        }
    }
};

```





