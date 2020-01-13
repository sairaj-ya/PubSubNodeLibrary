const logger = require('./BotCentralLogging');
const HostConfig = require('../config/HostConfig');
const AgentConfig = require('../config/AgentConfig');
const redis_options = HostConfig['redis'];

logger.info('[redis_options]',redis_options)
const redis = require('redis');
const client = redis.createClient(redis_options);
const clientDup  = client.duplicate();

// const client = redis.createClient();
const CONSTANTS = require('./constants');

const USER_MESSAGE_QUEUE = "usermessage_queue2";
const BOTRESPONSE_QUEUE  = "botresponse_queue";
const USER_NODE_CACHE = "USER_NODE_CACHE";
class RedisQueue {
  constructor() {
    this.REDIS_KEY_EXP = 24 * 60 * 60; // expire the key every day
    this.UPDATE_INTERVAL = 1000 * 60 * 5; //
    this.init();
    var key_arr = [AgentConfig.botId, AgentConfig.accountId, AgentConfig.username]
    this.keybase = key_arr.join(":::");
    this.LP_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.LP_SOCKET;
    this.BC_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.BC_SOCKET;
    this.NODE_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.NODE_STATUS;
    this.MESSAGE_Q_KEY = this.keybase + ':::' + 'MESSAGE_Q';
    // client.subscribe(this.MESSAGE_Q_KEY);
    this.lpMessagesBuffer = [];
    this.bcMessagesBuffer = [];
    this.lpMessageTimeoutId =  setInterval(this.setLPNodeInfo.bind(this), this.UPDATE_INTERVAL);
    this.bcMessageTimeoutId =  setInterval(this.setBCNodeInfo.bind(this), this.UPDATE_INTERVAL);
  }

  init() {
    var vm = this;
    process.on('SIGINT', function() {
      logger.info('[SIGINT]');
      vm.setNodeStatus(CONSTANTS.STOPPED);
      vm.setLPSocketStatus(CONSTANTS.STOPPED);
      vm.setBCSocketStatus(CONSTANTS.STOPPED);
      process.exit(1);
    });
  }

  initializeUserQueue(userId) {
    try {
      let userQueueRedisKey = "USER_NODE_CACHE:"+userId;
      let resQKey = this.MESSAGE_Q_KEY;
      client.set(userQueueRedisKey, resQKey, 'EX', this.REDIS_KEY_EXP, (err, res) => {
        logger.info(userQueueRedisKey, resQKey, err);
      });
    } catch(e) {
      logger.error(e);
    }
  }

  sendToUserMessageQueue(obj) {
    try {
      client.rpush(USER_MESSAGE_QUEUE, JSON.stringify(obj), (err, reply)=> {
        if(err) {
          logger.error("[sendToUserMessageQueue]", obj, err);
        }
      })
    } catch(e) {
      logger.error("[sendToUserMessageQueue] exception", e)
    }
  }

  listenForBotResponseQueue(callback) {
    const botResKey = BOTRESPONSE_QUEUE + '-' + this.MESSAGE_Q_KEY;
    this.botResInterval = setInterval(() => {
       clearInterval(this.botResInterval);
       clientDup.blpop(botResKey, 0, (err, reply) => {
          if(err || !reply || reply.length < 2) {
            logger.error("botResKey", err, reply);
            callback(true)
          } else if(reply[1]) {
            callback(null, reply[1])
          }
	  this.listenForBotResponseQueue(callback);
      });
    }, 0);
  }

  setBCNodeInfo() {
    let key = this.BC_STATUS_KEY;
    client.get(key,(err, val) => {
      if(err) {
        logger.error('[setBCNodeInfo]',err)
        return;
      }
      let obj = JSON.parse(val) || {};
      if(this.bcMessagesBuffer && this.bcMessagesBuffer.length > 0) {
        let lastMessageTime = this.bcMessagesBuffer.pop();
        obj['lastMessage'] = lastMessageTime;
        this.bcMessagesBuffer = [];
      }
      // logger.info('__bcMessageRedis__',obj)
      this.addMessageToRedis(key, JSON.stringify(obj));
    })
  }

  setLPNodeInfo(pingInfo){
    let key = this.LP_STATUS_KEY;
    client.get(key , (err, val) => {
      if(err) {
        logger.error('[setLPNodeInfo][__lpMessageBuffer__]',err);
        return;
      }
      let obj = JSON.parse(val) || {};
      if(this.lpMessagesBuffer && this.lpMessagesBuffer.length > 0) {
        let lastMessageTime = this.lpMessagesBuffer.pop();
        obj['lastMessage'] = lastMessageTime;
        this.lpMessagesBuffer = [];
      }
      if(pingInfo) {
        obj['pingInfo'] = pingInfo;
        if(AgentConfig.appType == 'chat') {
          if(pingInfo['agentStatus']) {
            obj['status'] = 'connected';
          }
        } else {
          if(pingInfo['clock']) {
            obj['status'] = 'connected';
          }
        }
      }
      logger.info(`[setLPNodeInfo] ${JSON.stringify(obj)}`);
      this.addMessageToRedis(key, JSON.stringify(obj));
    })
  }

  updateLastLPMessageTimestamp() {
    this.lpMessagesBuffer.push(new Date().getTime());
  }

  updateLastBCMessageTimestamp() {
    this.bcMessagesBuffer.push(new Date().getTime());
  }

  setLPClockStatus(obj) {
    this.setLPNodeInfo(obj);
  }

  addMessageToRedis(key, value) {
    client.set(key, value,'EX', this.REDIS_KEY_EXP, function(err, reply) {
      if(err){
        logger.error('[addMessageToRedis]',err)
      } else {
        // logger.info(reply)
      }
    })
  }

  setConversationSkillId(convId, skillId) {
    this.addMessageToRedis(convId, skillId);
  }

  getConversationSkillId(convId, cb) {
    client.get(convId, cb)
  }

  retrieveMessageFromRedis(key) {
    var vm = this;
    client.get(key, function (err, reply) {
      if (err) {
       logger.error('[retrieveMessageFromRedis]',err)
       return
      };
      try {
        var arr = key.split(':::');
        var appName = arr[0];
        var userId = arr[1];
        var botId = arr[2];
        var dialogId = arr[3];
        var msgType = arr[4];
        logger.info(`appName: ${appName}`)
        logger.info(`userId: ${userId}`)
        logger.info(`botId: ${botId}`)
        logger.info(`dialogId: ${dialogId}`)
        logger.info(`msgType: ${msgType}`)

        if(msgType == CONSTANTS.BOT_TO_USER) {
          logger.info('stored object:', reply);
          // this.lpWS.publishText(dialogId, reply)
        }

        if(msgType == CONSTANTS.USER_TO_BOT) {
          var obj = JSON.parse(reply)
          logger.info('stored object:', reply);
          // vm.bcWS.emitMessageObj(obj)
        }
      } catch(e) {
        logger.error('redis retrieve error:',key,e)
      }
    });
  }

  removeKeyFromRedis(key) {
    client.del(key, function(err,o){
        if(err) {
          logger.error('[removeKeyFromRedis]',key)
        }
    })
  }

  setNodeStatus(status, cb) {
    var obj = {'status': status}
    this.addMessageToRedis(this.NODE_STATUS_KEY, JSON.stringify(obj));
  }

  setLPSocketStatus(status) {
    try {
      let key = this.LP_STATUS_KEY;
      if(status === CONSTANTS.STOPPED) {
        var obj = {'status': status}
        this.addMessageToRedis(key, JSON.stringify(obj));
        return;
      }
      client.get(key , (err, val) => {
        if(err) {
          logger.error('[setLPNodeInfo][__lpMessageBuffer__]',err);
          return;
        }
        let obj = {};
        if(val) {
          obj = JSON.parse(val);
        }
        if(!obj) {
          obj = {}
        }

        if(this.lpMessagesBuffer && this.lpMessagesBuffer.length > 0) {
          let lastMessageTime = this.lpMessagesBuffer.pop();
          obj['lastMessage'] = lastMessageTime;
          this.lpMessagesBuffer = [];
        }
        obj['status'] = status;
        logger.info(`[setLPNodeInfo] ${JSON.stringify(obj)}`);
        this.addMessageToRedis(key, JSON.stringify(obj));
      });
    }catch(e) {
      logger.error(`Error while settting the LPSocket Status`, JSON.stringify(e));
    }

  }

  setBCSocketStatus(status) {
    var obj = {'status': status}
    this.addMessageToRedis(this.BC_STATUS_KEY, JSON.stringify(obj));
  }

  fromBotToUser(userId, dialogId, botId, msg) {
    var key_arr = [this.keybase, dialogId, userId];
    var key = key_arr.join(':::');
    var b_to_u = key + ':::'+ CONSTANTS.BOT_TO_USER;
    var u_to_b = key + ':::'+CONSTANTS.USER_TO_BOT;
    this.removeKeyFromRedis(u_to_b);
    this.addMessageToRedis(b_to_u, msg);
  }

  fromUserToBot(userId, dialogId, botId, msg) {
    var key_arr = [this.keybase, dialogId, userId]
    var key = key_arr.join(':::')
    var b_to_u = key + ':::'+ CONSTANTS.BOT_TO_USER;
    var u_to_b = key + ':::'+ CONSTANTS.USER_TO_BOT;
    this.removeKeyFromRedis(b_to_u);
    this.addMessageToRedis(u_to_b, msg);
  }
}

const redis_queue = new RedisQueue();

const getRedisQueue = () => {
  return redis_queue;
}

module.exports = {
  getRedisQueue
}
