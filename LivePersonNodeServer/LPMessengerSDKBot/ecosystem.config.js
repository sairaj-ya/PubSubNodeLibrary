function __getAppNameFromConf(conf) {
  var appName = ''+conf.lpAccountId+'::'+ conf.lpAccountUser
  + '::' + conf.botId.substring(0,5) + '::'+conf.type;
  return appName
}

function getApp(conf) {
  var appName = __getAppNameFromConf(conf);
  return {
    name      : appName ,
    script    : 'src/BotCentralConnector.js',
    instances  : 1,
    exec_mode  : "fork",
    env: {
      COMMON_VARIABLE: 'true',
      APP_NAME : appName,
      APP_TYPE : conf.type,
      BOT_ID : conf.botId,
      SKILL_ID : conf.skillId,
      LP_ACCOUNT : conf.lpAccountId,
      LP_USER: conf.lpAccountUser,
      LP_PASS: conf.lpPassword,
      CSDSDOMAIN : conf.csdsDomain,
      FALLBACK_SKILLID : conf.fallbackSkillId,
      EXTERNAL_WEBHOOK_URL : conf.externalWebhookUrl,
      LP_APPKEY : conf.lpAppKey,
      LP_APPSECRET : conf.lpAppSecret,
      LP_ACCESSTOKEN : conf.lpAccessToken,
      LP_ACCESSTOKENSECRET : conf.lpAccessTokenSecret,
      LP_ROLE : conf.lpUserRole
    }
  }
}

function getAgentInfo() {
  var apple_env = {
   "lpAccountId": "77195711",
   "lpAccountUser": "botCentral1",
   "lpAppKey" : "aaf6b29a3895424ebb92fe1f09d14071",
   "lpAppSecret" : "5a4f5a30d3fabc70",
   "lpAccessToken" : "376836631c10453cafedb10138087699",
   "lpAccessTokenSecret": "16f1a2e6328af873",
   "botId" : "e24256b073b0ee5dddd7408c9e720fbe4e41030d",
   "type" : "messaging",
}
  var appEnv2 = {
   "lpAccountId": "34690282",
   "lpAccountUser": "Bcentral2",
   "lpAppKey" : "b8859bc230104ca2bd6c7cd4798a059e",
   "lpAppSecret" : "37476688384a2e30",
   "lpAccessToken" : "ecfd61e65cde4448b20c72388bd4da5d",
   "lpAccessTokenSecret": "25bdb06b25d3fc0d",
   "botId" : "e49cffac3d171e229353708eeaef7d8734a17a4b",
   "type" : "messaging"
}

var app_env_test = {
   "lpAccountId": "25348739",
   "lpAccountUser": "Bot_User",
   "lpUserRole" : "MANAGER",
   "lpAppKey" : "cca1b2d9a0044076a457fd90b19e8984",
   "lpAppSecret" : "6bef593c0ed51be7",
   "lpAccessToken" : "132ca9268c9e4c63b3aab7fcacb73eb8",
   "lpAccessTokenSecret": "4eeb1dc677872420",
   "botId" : "21722609c116521d94e4ac98d8be57b01dde9fc9",
   "type" : "messaging",
  }
var app_env_test_2 = {
   "lpAccountId": "25348739",
   "lpAccountUser": "bot_user_2",
   "lpUserRole" : "ASSIGNED_AGENT",
   "lpAppKey" : "cca1b2d9a0044076a457fd90b19e8984",
   "lpAppSecret" : "6bef593c0ed51be7",
   "lpAccessToken" : "132ca9268c9e4c63b3aab7fcacb73eb8",
   "lpAccessTokenSecret": "4eeb1dc677872420",
   "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",
   "type" : "messaging",
  }
var app_env_test_3 = {
   "lpAccountId": "25348739",
   "lpAccountUser": "bot_user_3",
   "lpUserRole" : "ASSIGNED_AGENT",
   "lpAppKey" : "cca1b2d9a0044076a457fd90b19e8984",
   "lpAppSecret" : "6bef593c0ed51be7",
   // "externalWebhookUrl" : "http://localhost:5000/echo",
   "lpAccessToken" : "132ca9268c9e4c63b3aab7fcacb73eb8",
   "lpAccessTokenSecret": "4eeb1dc677872420",
   "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",//"a6524902fd3188ab7c36e019ae10c2deff95a0a9",
   "type" : "messaging",
  }
var app_env_test_5 = {
   "lpAccountId": "25348739",
   "lpAccountUser": "bot_user_4",
   "lpUserRole" : "ASSIGNED_AGENT",
   "fallbackSkillId" : "449666414",
   "lpAppKey" : "cca1b2d9a0044076a457fd90b19e8984",
   "lpAppSecret" : "6bef593c0ed51be7",
   // "externalWebhookUrl" : "http://localhost:5000/echo",
   "lpAccessToken" : "132ca9268c9e4c63b3aab7fcacb73eb8",
   "lpAccessTokenSecret": "4eeb1dc677872420",
   "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",//"a6524902fd3188ab7c36e019ae10c2deff95a0a9",
   "type" : "messaging",
  }
var app_env_test_4 = {
   "lpAccountId": "le9527084",
   "lpAccountUser": "bot",
   "lpUserRole" : "ASSIGNED_AGENT",
   // "externalWebhookUrl" : "http://localhost:5000/echo",
   "csdsDomain" : "hc1n.dev.lprnd.net",
   "lpAppKey" : "963bad0b587d4625b5c9546526c9bc3a",
   "lpAppSecret" : "aa5d5ceef83c0580",

   "lpAccessToken" : "5cc40d1e857648cda73ab8a0473172ef",
   "lpAccessTokenSecret": "7e991635aac40d7b",
   "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",//"a6524902fd3188ab7c36e019ae10c2deff95a0a9",
   "type" : "messaging",
  }
var app_env_test_abc = {
   "lpAccountId": "76985789",
   "lpAccountUser": "chubot",
   "lpUserRole" : "ASSIGNED_AGENT",
   "lpAppKey" : "35bb28786cda4934991f9cc76e1ba20c",
   "lpAppSecret" : "388d744834c1d477",
   "lpAccessToken" : "4e1f97c9d545483d8170371b807417a9",
   "lpAccessTokenSecret": "5064d5a111d8a5a0",
   "botId" : '5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948', //"5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",
   "type" : "messaging",
  }
var app_env_test_UK = {
   "lpAccountId": "61939614",
   "lpAccountUser": "vm_greeter_bot",
   "lpUserRole" : "ASSIGNED_AGENT",
   "lpAppKey" : "51335654000a41f7a9692ae4b228b7e3",
   "lpAppSecret" : "30d7d83e643524a2",
   "lpAccessToken" : "813900342aae488abd60df73502a8059",
   "lpAccessTokenSecret": "76616c1a4a2bd4d6",
   "botId" : "62b30729875dce6bb80ea4064359cd4e7fe455fa",
   "type" : "messaging",
  }

  var manager_bot = {
    "lpAccountId": "5391223",
    "lpAccountUser": "after_hours",
    "lpUserRole" : "MANAGER",
    "lpAppKey" : "4990e9a4e0154611b52a1f400be5d5ea",
    "lpAppSecret" : "8c2f61a748900e10",
    "lpAccessToken" : "48d8e07dbe644b4c8cc766688bd3f045",
    "lpAccessTokenSecret": "591e88accbe38920",
    "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",
    "type" : "messaging",
  }

  var app_env_abc_81505669 = {
     "lpAccountId": "81505669",
     "lpAccountUser": "bot_user_1",
     "lpUserRole" : "ASSIGNED_AGENT",
     "fallbackSkillId" : "449666414",
     "lpAppKey" : "0299d5a3adb944c4bf2e59cf4aea0844",
     "lpAppSecret" : "23c4b720595f2fd9",
     "lpAccessToken" : "242ebbc3863943eeab7966c57e35508f",
     "lpAccessTokenSecret": "2e020eba7f2c58ac",
     "botId" : "5240f5495002575763a0156510f243e815df766b",//"a6524902fd3188ab7c36e019ae10c2deff95a0a9",
     "type" : "messaging",
    }

  var app_env_test_qa_2 = {
     "lpAccountId": "le76472100",
     "lpAccountUser": "retailBot",
     "lpUserRole" : "ASSIGNED_AGENT",
     // "externalWebhookUrl" : "http://localhost:5000/echo",
     "csdsDomain" : "hc1n.dev.lprnd.net",
     "lpAppKey" : "2ec10c60152b41f1aad6960bccffc96c",
     "lpAppSecret" : "2af3f95a0e9d6054",
     "lpAccessToken" : "dd26a1eb9dce4604a4ddde231b31c36a",
     "lpAccessTokenSecret": "4124693489003739",
     "botId" : "5a4d06ebc5ff00f19d8d55629c3f517b5f3d7948",//"a6524902fd3188ab7c36e019ae10c2deff95a0a9",
     "type" : "messaging",
    }

    var sairaj_test_botAp = {
      "lpAccountId": "21692729",
      "lpAccountUser": "bot_ap",
      "lpUserRole" : "ASSIGNED_AGENT",
      "lpAppKey" : "acf7034d14374fdcbb412d5f2396b82f",
      "lpAppSecret" : "716d6153d7e5db1c",
      "lpAccessToken" : "6a1810a53e3c4f7f84eea3ae43951467",
      "lpAccessTokenSecret": "61d914374e774c07",
      "botId" : "dcdf2d52ebc5518e9630a10a95623464ffb37954",
      "type" : "messaging",
    }

    var sairaj_test_bot = {
      "lpAccountId": "21692729",
      "lpAccountUser": "August6",
      "lpUserRole" : "ASSIGNED_AGENT",
      "lpAppKey" : "acf7034d14374fdcbb412d5f2396b82f",
      "lpAppSecret" : "716d6153d7e5db1c",
      "lpAccessToken" : "6a1810a53e3c4f7f84eea3ae43951467",
      "lpAccessTokenSecret": "61d914374e774c07",
      "botId" : "1f8dda228209f1263685470396f380aa941ba031",
      "type" : "messaging",
    }

    var sairaj_manager_bot = {
      "lpAccountId": "21692729",
      "lpAccountUser": "August20",
      "lpUserRole" : "MANAGER",
      "lpAppKey" : "dc7464de6e4a45348446659c5b96b922",
      "lpAppSecret" : "13c7b41ddeee7429",
      "lpAccessToken" : "4c583a411db0423894666519d3745270",
      "lpAccessTokenSecret": "16206f8ba7642f6f",
      "botId" : "14714b64573eb613d72ff235e4805347c372c403",
      "type" : "messaging",
    }

  var agentArray = [
    // getApp(app_env_test),
    // getApp(app_env_test_2),
    // getApp(app_env_test_2),
    // getApp(app_env_test_4) 
    // getApp(app_env_test_UK)
    // getApp(app_env_test_3)
    // getApp(appEnv2),
    //getApp(app_env_test_qa_2)
    getApp(sairaj_test_botAp),
    getApp(sairaj_test_bot),
    getApp(sairaj_manager_bot)
    // getApp(app_env_abc_81505669)
    // getApp(app_env_test_5)
  ]
  return agentArray
}

ENV = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : getAgentInfo(),
  // [
    // getApp(bid, accountId,'finbotmsg2', password),
    // getApp(bid, accountId,'finbotmsg3', password)
    // getApp(bid, accountId,'ContactUs Bot2', password),
    // getApp(bid, accountId,'webagent2', password)
    // First application
    // getApp(bid, accountId,'LPSMS', password)
  // ],

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

console.log('env config', JSON.stringify(ENV))

module.exports = ENV
