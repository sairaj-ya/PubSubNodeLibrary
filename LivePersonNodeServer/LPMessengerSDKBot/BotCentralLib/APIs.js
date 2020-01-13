const request = require('request');
const hostConfig = require('../config/HostConfig');
const AgentConfig = require('../config/AgentConfig');

const HOSTS = hostConfig['api'];

const PACKAGES = {
  platform : "bot-platform-manager-0.1",
  monitor : "service-monitoring-0.1"
};

const notifyEscalation = (dialogId, userId) => {
  var options = {
      method: 'POST',
      url: `${HOSTS.prod}/${PACKAGES.platform}/userMessageEvent`,
      headers:{
       'cache-control': 'no-cache',
       'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
       'content-type': 'application/json'
      },
      body:{
        chatBotId: AgentConfig.botId,//'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
        sessionId: '',  //'70057810-0f2b-4e10-8ed7-b67febe23782',
        conversationId: dialogId,
        chatUserId: userId,  // '4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
        userText: 'escalation',
        leAgentId : AgentConfig.username,
        leAccountId : AgentConfig.accountId,
        eventType: 'EVENT_ESCALATION_SUBMITTED',
        escalationType: AgentConfig.appType == 'cao' ? 'CAO' : 'LivePerson',
        senderId: userId,
        recipientId: AgentConfig.botId,
        platform: 'HTMLCLIENT'
      },
      json: true
  };
  request(options, (error, response, body) => {
      //if (error) throw new Error(error);
      if(error) {
        console.error(`[notifyEscalation][${dialogId}]`,error);
      } else {
        console.log(`[notifyEscalation][${dialogId}]`,body);
      }
  });
}

const notifyEscalationFail = (dialogId, userId) => {
  var options = {
     method: 'POST',
     url: `${HOSTS.prod}/${PACKAGES.platform}/userMessageEvent`,
     headers:{
       'cache-control': 'no-cache',
       'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
       'content-type': 'application/json'
     },
      body:{
        chatBotId: AgentConfig.botId,//'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
        conversationId: dialogId,  //'70057810-0f2b-4e10-8ed7-b67febe23782',
        chatUserId: userId,  // '4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
        userText: 'escalation',
        eventType: 'EVENT_ESCALATION_FAILED',
        escalationType: AgentConfig.appType == 'cao' ? 'CAO' : 'LivePerson',
        leAgentId : AgentConfig.username,
        leAccountId : AgentConfig.accountId,
        senderId: userId, //'4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
        recipientId: AgentConfig.botId, //'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
        platform: 'HTMLCLIENT'
      },
      json: true };
  request(options, (error, response, body) => {
      //if (error) throw new Error(error);
      if(error) {
        console.error(`[notifyEscalationFail][${dialogId}]`,error);
      } else {
        console.log(`[notifyEscalationFail][${dialogId}]`,body);
      }
  });
}

const notifyFallbackEscalation = (dialogId, userId) => {
  var options = {
     method: 'POST',
     url: `${HOSTS.prod}/${PACKAGES.platform}/userMessageEvent`, //'http://platformservice.botcentralapi.com/bot-platform-manager-0.1/userMessageEvent',
     headers:{
       'cache-control': 'no-cache',
       'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
       'content-type': 'application/json'
     },
      body:{
        chatBotId: AgentConfig.botId,//'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
        conversationId: dialogId,  //'70057810-0f2b-4e10-8ed7-b67febe23782',
        chatUserId: userId,  // '4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
        userText: 'escalation',
        eventType: 'EVENT_ESCALATION_FALLBACK',
        escalationType: AgentConfig.appType == 'cao' ? 'CAO' : 'LivePerson',
        leAgentId : AgentConfig.username,
        leAccountId : AgentConfig.accountId,
        senderId: userId, //'4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
        recipientId: AgentConfig.botId, //'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
        platform: 'HTMLCLIENT'
      },
      json: true };
  request(options, (error, response, body) => {
      //if (error) throw new Error(error);
      if(error) {
        console.error(`[notifyFallbackEscalation][${dialogId}]`,error);
      } else {
        console.log(`[notifyFallbackEscalation][${dialogId}]`,body);
      }
  });
}

const notifyError = (type, msg) => {
  let errObj = __constructNotificationObj(type, msg);
  var options = {
    method: 'POST',
    url: `${HOSTS.prod_status}/${PACKAGES.monitor}/sysadmin/nodejs/log/error/`,
    headers:{
      'cache-control': 'no-cache',
      'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
      'content-type': 'application/json'
    },
    body: errObj,
    json: true
  };
  console.info('[notifyError][_err_obj_]', errObj)
  request(options, (error, response, body) => {
      //if (error) throw new Error(error);
      if(error) {
        logger.error('[notifyError]', error);
      } else {
        logger.info('[notifyError]', body);
      }
  });
}

const __constructNotificationObj = (type, msg) => {
  function isString (value) {
    return typeof value === 'string' || value instanceof String;
  };
  function isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
  };

  let p_msg = ''
  if(isString(msg)) {
    p_msg = msg;
  } else if(isObject(msg)) {
    function simpleStringify (object){
        var simpleObject = {};
        for (var prop in object ){
            if (!object.hasOwnProperty(prop)){
                continue;
            }
            if (typeof(object[prop]) == 'object'){
                continue;
            }
            if (typeof(object[prop]) == 'function'){
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject); // returns cleaned up JSON
    };
    p_msg = simpleStringify(msg)
  }

  var obj = {
      "message": p_msg,
      "code": 500,
      "source": type,
      "botId": AgentConfig.botId,
      "lpAccountId": AgentConfig.accountId,
      "lpAccountUser": AgentConfig.username,
      // "creatorId": conf['accountId'] + ':::' + conf['username']
  }
  return obj;
}

module.exports = {
  notifyEscalation,
  notifyEscalationFail,
  notifyFallbackEscalation,
  notifyError
}
