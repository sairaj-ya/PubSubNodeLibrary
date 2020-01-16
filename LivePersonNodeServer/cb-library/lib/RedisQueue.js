const AgentConfig = require('./config/AgentConfig');
const redis = require('redis');

// const client = redis.createClient();
// const CONSTANTS = require('../../../../LivePersonNodeServer/LPMessengerSDKBot/BotCentralLib/constants');

// const USER_MESSAGE_QUEUE = "usermessage_queue2";
// const BOTRESPONSE_QUEUE  = "botresponse_queue";
// const USER_NODE_CACHE = "USER_NODE_CACHE";
class RedisQueue {
  constructor(env) {
    const redis_options = AgentConfig['path'][env]['redis'];
    console.log('[redis_options]',redis_options);
    this.client = redis.createClient(redis_options);
    this.REDIS_KEY_EXP = 24 * 60 * 60; // expire the key every day
    //this.clientDup  = client.duplicate();
    //this.UPDATE_INTERVAL = 1000 * 60 * 5; //
    //this.init();
    //var key_arr = [AgentConfig.botId, AgentConfig.accountId, AgentConfig.username]
    //this.keybase = key_arr.join(":::");
    //this.LP_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.LP_SOCKET;
    //this.BC_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.BC_SOCKET;
    //this.NODE_STATUS_KEY = this.keybase +  ':::' + CONSTANTS.NODE_STATUS;
    //this.MESSAGE_Q_KEY = this.keybase + ':::' + 'MESSAGE_Q';
    // client.subscribe(this.MESSAGE_Q_KEY);
    //this.lpMessagesBuffer = [];
    //this.bcMessagesBuffer = [];
    //this.lpMessageTimeoutId =  setInterval(this.setLPNodeInfo.bind(this), this.UPDATE_INTERVAL);
    //this.bcMessageTimeoutId =  setInterval(this.setBCNodeInfo.bind(this), this.UPDATE_INTERVAL);
  }

  setToRedis(key, value, cb) {
    this.client.set(key, value,'EX', this.REDIS_KEY_EXP, function(err, reply) {
      if(err){
        console.log(`[Error][Add key]: ${key} failed, ${err}`);
        cb(err, null);
      } else {
        console.log(`[Add key]: ${key} successful, ${reply}`);
        cb(null, true);
      }
    })
  }

  getFromRedis(key, cb){
    this.client.get(key , (err, val) => {
      if(err) {
        console.log(`[Error][Getting the last Sequence for Dialogue]: ${key}, ${err}`);
        cb(err, null);
        return;
      }else{
        cb(null, val);
      }
    });
  }

  removeKeyFromRedis(key, cb) {
    this.client.del(key, function(err,reply){
        if(err) {
          console.log(`[Error][Remove key from Redis]: ${key} failed, ${reply}`);
          cb(err, null);
        }else{
          cb(null, true);
        }
    })
  }
}

module.exports = RedisQueue;
