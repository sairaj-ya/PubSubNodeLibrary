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