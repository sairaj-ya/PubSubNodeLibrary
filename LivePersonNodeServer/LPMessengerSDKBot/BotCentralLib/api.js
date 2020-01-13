const logger = require('./BotCentralLogging');
var uuidV4 = require('uuid/v4');
var request = require("request");
const config = require('./config');
const HOSTS = config['api'];

const PACKAGES = {
  platform : "/bot-platform-manager-0.1",
  monitor : "/service-monitoring-0.1"
};


logger.info('[HOSTS]: ', HOSTS);

class BotcentralAPI {
  constructor(conf) {
    this.conf = conf;
    this.env = conf.env;
    this.botId = conf.botId;
    if(conf['type'] == 'cao') {
      this.escalationType = 'CAO'
    } else {
      this.escalationType = 'LivePerson'
    }
  }

  notifyEscalation(dialogId, botRes){
    let escalation_url = HOSTS.prod + PACKAGES.platform + '/userMessageEvent';
    var userId = botRes.recipient.id;
    var options = {
       method: 'POST',
       url: escalation_url, //'http://platformservice.botcentralapi.com/bot-platform-manager-0.1/userMessageEvent',
       headers:{
         'cache-control': 'no-cache',
         'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
         'content-type': 'application/json'
       },
        body:{
          chatBotId: this.botId,//'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
          sessionId: '',  //'70057810-0f2b-4e10-8ed7-b67febe23782',
          conversationId: dialogId,
          chatUserId: userId,  // '4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
          userText: 'escalation',
          leAgentId : this.conf.username,
          leAccountId : this.conf.accountId,
          eventType: 'EVENT_ESCALATION_SUBMITTED',
          escalationType: this.escalationType,
          senderId: userId, //'4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
          recipientId: this.botId, //'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
          platform: 'HTMLCLIENT'
        },
        json: true };
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if(error) {
          logger.error(`[notifyEscalation][${dialogId}]`,error);
        } else {
          logger.info(`[notifyEscalation][${dialogId}]`,body);
        }
    });
  }
  notifyEscalationFail(dialogId, botRes){
    let escalation_url = HOSTS.prod + PACKAGES.platform + '/userMessageEvent';
    var userId = botRes.recipient.id;
    var options = {
       method: 'POST',
       url: escalation_url, //'http://platformservice.botcentralapi.com/bot-platform-manager-0.1/userMessageEvent',
       headers:{
         'cache-control': 'no-cache',
         'authorization': 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
         'content-type': 'application/json'
       },
        body:{
          chatBotId: this.botId,//'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
          conversationId: dialogId,  //'70057810-0f2b-4e10-8ed7-b67febe23782',
          chatUserId: userId,  // '4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
          userText: 'escalation',
          eventType: 'EVENT_ESCALATION_FAILED',
          escalationType: this.escalationType,
          leAgentId : this.conf.username,
          leAccountId : this.conf.accountId,
          senderId: userId, //'4f38f257f6307b07cacd6b81b858b9033d15a1120d039f635fa1a030a2cd15f6',
          recipientId: this.botId, //'a1bf3876a607d5a38d34b01136c2ac287efdc3be',
          platform: 'HTMLCLIENT'
        },
        json: true };
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if(error) {
          logger.error(`[notifyEscalationFail][${dialogId}]`,error);
        } else {
          logger.info(`[notifyEscalationFail][${dialogId}]`,body);
        }
    });
  }


  notifyError(type, msg) {
    let errObj = this.__constructNotificationObj(type, msg)
    let url = HOSTS.prod_status + PACKAGES.monitor + '/sysadmin/nodejs/log/error/'
    var options = { method: 'POST',
       url: url,
       headers:{ 'cache-control': 'no-cache',
         authorization: 'cIbdgJvBHqN2m33+tA1Qv0YEJ9IKpOoi34BijK7deZ82mvBbDIDYkOrJJ02xNv0x',
        'content-type': 'application/json' },
        body: errObj,
        json: true };
    logger.info('[notifyError][_err_obj_]', errObj)
    request(options, function (error, response, body) {
        //if (error) throw new Error(error);
        if(error) {
          logger.error('[notifyError]', error);
        } else {
          logger.info('[notifyError]', body);
        }
    });
  }


  __constructNotificationObj(type, msg) {
    var conf = this.conf;
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
        "botId": conf['botId'],
        "lpAccountId": conf['accountId'],
        "lpAccountUser": conf['username'],
        // "creatorId": conf['accountId'] + ':::' + conf['username']
    }
    return obj;
  }
}
module.exports =  BotcentralAPI;
