const logger = require('../BotCentralLib/BotCentralLogging');
const rq = require('../BotCentralLib/RedisQueue').getRedisQueue();

const AgentConfig = require('../config/AgentConfig');

class NodeMonitor {
  constructor(agent) {
    this.agent = agent;
    this.connection_retries = 1;
    this.connection_total_failures = 0;

    this.init();
  }

  init() {
    this.agent.on('connected', msg => {
      this.resetConnectTimers();
      this.keepConnectionAlive();
    })

    this.agent.on('error', err => {
      if (err && err.code === 401) {
        if(this.connectionClock) { clearTimeout(this.connectionClock); }
        this._constantReconnect();
        this._exponentialReconnect();
      }
    });
    this.agent.on('closed', data => {
      if(this.connectionClock) { clearTimeout(this.connectionClock); }
      this._constantReconnect();
      this._exponentialReconnect();
    });

    this.startLPMonitoring();
  }

  resetConnectTimers() {
    if(this.connectionClock) { clearTimeout(this.connectionClock); }
    if(this.reconnect_timeout_id) { clearTimeout(this.reconnect_timeout_id); }
    if(this.reconnect_if_hanging) { clearTimeout(this.reconnect_if_hanging); }
    this.reconnectInProgress = false;
    this.connection_retries = 1;
    this.clock_failure_count = 0;
  }

  startLPMonitoring() {
    setTimeout(()=> {
      logger.info(`[startLPMonitoring] connected: ${this.agent.connected}`);
      if(!this.agent.connected) {
        this._constantReconnect();
        this._exponentialReconnect();
      }
      this.startLPMonitoring();
    }, AgentConfig.timersConfig.SELF_MONITORING_WAIT)
  }

  _constantReconnect() {
    if(this.reconnect_if_hanging) {
      clearTimeout(this.reconnect_if_hanging);
    }
    this.reconnect_if_hanging = setTimeout(()=>{
      // constant time reconnection after 3 minutes
      logger.info('[_constantReconnect][reconnect]', this.connection_retries, '\tTotal Failures',this.connection_total_failures);
      this.agent.reconnect(false);
    }, AgentConfig.timersConfig.CONSTANT_RECONNECT_WAIT);
  }


  _exponentialReconnect() {
    if(this.reconnectInProgress) {
      return;
    }
    this.reconnectInProgress = true;
    this.connection_total_failures += 1;
    let wait = (parseInt(this.connection_total_failures / 10) + 1) * this.connection_retries;
    if(wait > AgentConfig.timersConfig.MAX_WAIT) {
      wait = AgentConfig.timersConfig.MAX_WAIT;
    } else if(wait < AgentConfig.timersConfig.MIN_WAIT) {
      wait = AgentConfig.timersConfig.MIN_WAIT;
    }
    logger.info('[_exponentialReconnect][wait]', wait);
    this.reconnect_timeout_id = setTimeout(()=>{
      this.reconnectInProgress = false;
      logger.info('[_exponentialReconnect][reconnect]', this.connection_retries, '\tTotal Failures',this.connection_total_failures);
      // connection_retries gets reset to 1 after connect successful
      if(this.connection_retries && Math.log2(this.connection_retries) < 15) {
        this.connection_retries = this.connection_retries * 2;
      }
      this.agent.reconnect(false);
    }, wait)
  }

  keepConnectionAlive() {
    this.connectionClock = setTimeout(() => {
      try {
        this.agent.getClock({}, (e, resp) => {
          if (e) {
            logger.error('[keepConnectionAlive][clock]', this.clock_failure_count,e, resp);
            /*rq.setLPSocketStatus('Ping Failed');
            this.clock_failure_count += 1;
            if(this.clock_failure_count > 5) { this._exponentialReconnect(); }*/
          } else {
             rq.setLPNodeInfo({'clock': resp ,'lastUpdateTime' : new Date().getTime()});
             this.clock_failure_count = 0;
          }
       });
       this.keepConnectionAlive();
     } catch(e) {
       logger.error('[keepConnectionAlive][exception]', e);
       this.clock_failure_count += 1;
       this.keepConnectionAlive();
     }
   }, AgentConfig.timersConfig.GET_CLOCK_INTERVAL);
  }
}
module.exports = NodeMonitor;
