'use strict'
const request = require('request');
const OAuth = require('oauth-1.0a')
const crypto  = require('crypto');
const AgentConfig = require('../config/AgentConfig');

const generateOAUTHOption = (options) => {
  // Initialize
  const oauth = OAuth({
    consumer: {
      key: AgentConfig.appKey,
      secret: AgentConfig.secret
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });
  const token_info = {
      key: AgentConfig.accessToken,
      secret: AgentConfig.accessTokenSecret
  }
  const oauth_header = oauth.toHeader(oauth.authorize(options, token_info));
  oauth_header['Content-Type'] = 'application/json';
  return {...options, headers: oauth_header};
}


const getPreviousSkill = (url, dialogId, callback) => {
  try {
    var d = new Date();
    d.setDate(d.getDate() - 60); // look for the conversationId in the past 60 days
    let options = generateOAUTHOption({
        method: 'POST',
        url: url,
        json: true,
        body: {
          "start": {
            "from": d.getTime(),
            "to": new Date().getTime()
          },
          "conversationId": dialogId,
          "contentToRetrieve": [
            "transfers"
          ]
        }
    });
    request(options, (error, response, body) => {
      if(error) {
        callback(error);
      } else {
        let previousSkillId = null;
        if(body && body['conversationHistoryRecords']) {
          let records = [];
          body['conversationHistoryRecords'].forEach(record => {
              records = [...records, ...record['transfers']];
          });
          if(records.length > 0) {
            previousSkillId = records[records.length - 1]['sourceSkillId']
          }
        }
        callback(null, previousSkillId);
      }
    })
  } catch(e) {
    callback(e);
  }
}

const getResponseEvent = (c) => {
  return {
    sequence: c.sequence,
    message: c.event.message,
    metadata : c.metadata,
    event: c.event,
    serverTimestamp: c.serverTimestamp,
    originatorMetadata : c.originatorMetadata,
    eventId : c.eventId,
    role: c.originatorMetadata.role,
    originatorId : c.originatorId,
    originatorClientProperties: c.originatorClientProperties
  }
}

const getHTTPMessage = (change) => {
  return {
    originatorId : change.originatorId,
    originatorMetadata: change.originatorMetadata,
    serverTimestamp: change.serverTimestamp,
    event: change.event,
    dialogId: change.dialogId,
    eventId: change.eventId
  }
}

const getChatInfo = (convDetails) =>{
  let chatInfo = {};
  if(convDetails.context.type === "SharkContext") {

      chatInfo['sharkVisitorId'] = convDetails.context.visitorId;
      chatInfo['sharkSessionId'] = convDetails.context.sessionId;
      chatInfo['sharkContextId'] = convDetails.context.interactionContextId;
  }

  if(convDetails.campaignInfo) {
    chatInfo['campaignId'] = convDetails.campaignInfo.campaignId;
    chatInfo['engagementId'] = convDetails.campaignInfo.engagementId;
  }

  if(convDetails.startTs) {
    chatInfo['startTs'] = convDetails.startTs;
  }

  if(convDetails.context.clientProperties) {
      chatInfo['os'] = convDetails.context.clientProperties.os;
      chatInfo['appId'] = convDetails.context.clientProperties.appId;
  }

  if(convDetails.conversationHandlerDetails) {
    chatInfo['currentSkillId'] = convDetails.conversationHandlerDetails.skillId;
  }

  return chatInfo;
}

/**
 * Is a specific PID (the bot user by default) a participant in a specific conversation, and if so with what role?
 *
 * @param {Object} conversationDetails - A conversationDetails object from an ExConversationChangeNotification
 * @param {String} [pid=(bot_user_pid)]
 *
 * @returns {String} - A role name or 'undefined'
 */
const getRole = (conversationDetails, pid) => {
    let participant = conversationDetails.participants.filter(p => p.id === pid)[0];
    return participant && participant.role;
};
module.exports = {
  getChatInfo,
  getRole,
  getHTTPMessage,
  getPreviousSkill
}
