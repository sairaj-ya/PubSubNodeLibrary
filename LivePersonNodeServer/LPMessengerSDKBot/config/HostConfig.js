let config = [
    {
      "region" : "us",
      "websocket" : {
        "path": "wss://chat.botcentralapi.com"
      },
      "redis": {
        "host" : "prod2redis.qnqxx8.ng.0001.usw1.cache.amazonaws.com",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice.botcentralapi.com",
        "prod_status" : "https://status.botcentralapi.com"
      }
    },
    {
       'region' : 'alpha',
       'websocket' : {
         'path': 'wss://botbuilder2-chat.botcentralapi.com'
       },
       'redis': {
         'host' : 'redis-prod.5o3coz.ng.0001.usw2.cache.amazonaws.com',
         'port' : '6379'
       },
       'api' : {
         'prod': 'https://botbuilder2-platformservice.botcentralapi.com',
         'prod_status' : 'https://botbuilder2-platformservice.botcentralapi.com'
       }
     },
    {
       "region" : "lp-us-va",
       "websocket" : {
        "path": "wss://va.bc-msg.liveperson.net"
       },
       "redis": {
        "host" : "svor-dbb103",
        "port" : "6379"
       },
       "api" : {
        "prod": "https://va.bc-platform.liveperson.net",
        "prod_status" : "https://va.bc-mgmt.liveperson.net"
       }
    },
    {
      "region" : "dev",
      "websocket" : {
        "path": "wss://dev.msg.botcentralapi.com"
      },
      "redis": {
        "host" : "redisdev.5o3coz.ng.0001.usw2.cache.amazonaws.com",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://dev.service.botcentralapi.com",
        "prod_status" : "https://dev.service.botcentralapi.com"
      }
    },
    {
        "region" : "us-staging",
        "websocket" : {
          "path": "wss://staging.msg.botcentralapi.com"
        },
        "redis": {
          "host" : "redisstaging.5o3coz.ng.0001.usw2.cache.amazonaws.com",
          "port" : "6379"
        },
        "api" : {
          "prod": "https://staging.platformservice.botcentralapi.com",
          "prod_status" : "https://staging.status.botcentralapi.com"
        }
    },
    {
      "region" : "eu-old",
      "websocket" : {
        "path": "wss://chat-eu.botcentralapi.com"
      },
      "redis": {
        "host" : "eu-prod-redis.bpw09s.ng.0001.euw2.cache.amazonaws.com",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice-eu.botcentralapi.com",
        "prod_status" : "https://status-eu.botcentralapi.com"
      }
    },
    {
      "region" : "eu",
      "websocket" : {
        "path": "ws://chat-i.eubotintra.com"
      },
      "redis": {
        "host" : "eu-prod-redis.bpw09s.ng.0001.euw2.cache.amazonaws.com",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice-eu.botcentralapi.com",
        "prod_status" : "https://status-eu.botcentralapi.com"
      }
    },
    {
      "region" : "ap",
      "websocket" : {
        "path": "wss://chat-ap.botcentralapi.com"
      },
      "redis": {
        "host" : "ap-prod-redis.bsczzu.ng.0001.apse2.cache.amazonaws.com",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice-ap.botcentralapi.com",
        "prod_status" : "https://status-ap.botcentralapi.com"
      }
    },
    {
      "region" : "local",
      "websocket" : {
        "path": "ws://localhost:9092/socket.io"
      },
      "redis": {
        "host" : "localhost",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice.botcentralapi.com",
        "prod_status" : "https://status.botcentralapi.com"
      }
    },
    {
     "region" : "us-west-2",
     "websocket" : {
       "path": "wss://botbuilder2-msg.botcentralapi.com"
     },
     "redis": {
       "host" : "redis-prod.5o3coz.ng.0001.usw2.cache.amazonaws.com",
       "port" : "6379"
     },
     "api" : {
       "prod": "https://botbuilder2-botservice.botcentralapi.com",
       "prod_status" : "https://botbuilder2-botservice.botcentralapi.com"
     }
   },
   {
     "region" : "lp-qa",
     "websocket" : {
       "path": "wss://msg-dev.dev.lprnd.net"
     },
     "redis": {
       "host" : "qtor-bot10",
       "port" : "6379"
     },
     "api" : {
       "prod": "https://platform-dev.tlv.lpnet.com",
       "prod_status" : "https://platform-dev.tlv.lpnet.com"
     }
  },
  {
    'region' : 'lp-lo-eu',
    'websocket' : {
      'path': 'wss://lo.bc-msg.liveperson.net'
    },
    'redis': {
      'host' : 'slor-abb126',
      'port' : '6379'
    },
    'api' : {
      'prod': 'https://lo.bc-platform.liveperson.net',
      'prod_status' : 'https://lo.bc-mgmt.liveperson.net'
    }
  },
  {
    'region' : 'lp-alpha',
    'websocket' : {
      'path': 'wss://va-a.bc-msg.liveperson.net'
    },
    'redis': {
      'host' : 'avor-dbb102',
      'port' : '6379'
    },
    'api' : {
      'prod': 'https://va-a.bc-platform.liveperson.net',
      'prod_status' : 'https://va-a.bc-mgmt.liveperson.net'
    }
  },
  {
     "region" : "lp-ap-sy",
     "websocket" : {
      "path": "wss://sy.bc-msg.liveperson.net"
     },
     "redis": {
      "host" : "ssor-dbb115",
      "port" : "6379"
     },
     "api" : {
      "prod": "https://sy.bc-platform.liveperson.net",
      "prod_status" : "https://sy.bc-mgmt.liveperson.net"
     }
  }
];

console.log('env var: ',process.env.awsregion);
var s = ''
config.forEach((item) => { s += item.region; s += ',' });
console.log(s)
let chosen_region = 'local';
const region_config = config.filter((item) => (item.region == chosen_region))[0]

module.exports = region_config;
