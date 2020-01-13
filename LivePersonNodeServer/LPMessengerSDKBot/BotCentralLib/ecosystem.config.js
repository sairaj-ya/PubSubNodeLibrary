function __getAppNameFromConf(conf) {
  var appName = conf.lpAccountId+'::'+ conf.lpAccountUser
  + '::' + conf.botId.substring(0,5) + '::'+conf.type;
  return appName
}

function getApp(conf) {
  var appName = __getAppNameFromConf(conf);
  return {
    name      : appName,
    script    : 'redis_connector.js',
    instances  : 1,
    max_memory_restart : "200M",
    exec_mode  : "fork",
    env: {
	COMMON_VARIABLE: 'true',
      APP_NAME : appName,
      APP_TYPE : conf.type,
      BOT_ID : conf.botId,
      SKILL_ID : conf.skillId,
      LP_ACCOUNT : conf.lpAccountId,
      LP_USER: conf.lpAccountUser,
      LP_PASS: conf.lpAccountPwd,
      LP_APPKEY : conf.lpAppKey,
      LP_APPSECRET : conf.lpAppSecret,
      LP_ACCESSTOKEN : conf.lpAccessToken,
      LP_ACCESSTOKENSECRET : conf.lpAccessTokenSecret
      // BOT_ENV: 'dev'
    },
    env_production : {
      NODE_ENV: 'production'
    }
  }
}

function getAgentInfo() {
  let appEnv = {
    "lpAccountId": "21692729",
    "lpAccountUser": "bot2",
    "lpPassword" : "Liveperson2019!",
    "botId" : "fe88f70fba561d5611af049cc46bd2564a43761d", //"5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",
    "type" : "messaging",
  }
  var agentArray = [
    getApp(appEnv)
  ]
  return agentArray
}

module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : getAgentInfo(),

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
