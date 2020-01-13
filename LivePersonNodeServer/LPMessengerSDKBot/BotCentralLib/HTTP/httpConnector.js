const request = require('request');
const logger = require('../BotCentralLogging');
const rq = require('../RedisQueue').getRedisQueue();

const HostConfig = require('../../config/HostConfig');
const AgentConfig = require('../../config/AgentConfig');


class HTTPConnector {
  constructor() {
    this.apiGeeSession = null;
    this.initialize();
  }

  initialize() {
    if(AgentConfig.webhook.apigee_auth_url
      && AgentConfig.webhook.apigee_grant_type
      && AgentConfig.webhook.apigee_audience
      && AgentConfig.webhook.apigee_client_id
      && AgentConfig.webhook.apigee_client_secret
    ) {
      this.setApigeeSession();
    }
  }

  setApigeeSession(count = 1) {
    var options = {
       method: 'POST',
       url: AgentConfig.webhook.apigee_auth_url,
       headers:{
         'content-type': 'application/json'
       },
        body:{
          "grant_type": AgentConfig.webhook.apigee_grant_type,
          "audience": AgentConfig.webhook.apigee_audience,
          "client_id": AgentConfig.webhook.apigee_client_id,
          "client_secret": AgentConfig.webhook.apigee_client_secret
        },
        json: true
      };
    var vm = this;
    request(options, (error, response, body) => {
        //if (error) throw new Error(error);
        if(error) {
          logger.error(`[getApigeeAuthToken]`, error);
          rq.setLPSocketStatus('getApigeeAuthToken Failed');
          setTimeout(()=> {
            this.setApigeeSession(count + 1);
          }, 1000 * count);
        } else {
          logger.info(`[getApigeeAuthToken]`, body);
          this.apiGeeSession = body;
        }
        this.apiGeeTimer = setTimeout(()=>{
          this.setApigeeSession();
        }, this.apiGeeSession.expires_in  * 1000 / 6);
    });
  }

  postToWebhook(messageObj) {
    let options = {
      json: true,
      method: 'POST',
      url: AgentConfig.webhook.externalWebhookUrl,
      headers : {
        'Content-Type' : 'application/json'
      },
      body : messageObj
    }
    if(AgentConfig.webhook.externalWebhookAPIKey) {
      options['headers']['authorization'] = AgentConfig.webhook.externalWebhookAPIKey;
    }
    if(this.apiGeeSession) {
      options['headers']['authorization'] = 'Bearer ' + this.apiGeeSession.access_token;
    }
    logger.info(`[getApigeeAuthToken]`,this.apiGeeSession);
    logger.info(`[postMessageToURL]`, options);
    request(options, (err, response, body)=> {
      if(err) {
        logger.error('externalWebhookUrl',err);
      } else {
        logger.info('externalWebhookUrl',body);
      }
    })
  }
}

const httpConnector = new HTTPConnector();

module.exports = {
  getHTTPConnector : () => { return httpConnector; }
};
