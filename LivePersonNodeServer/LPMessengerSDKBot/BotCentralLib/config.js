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
       "region" : "lp-us-va",
       "websocket" : {
        "path": "wss://va.bc-msg.liveperson.net"
       },
       "redis": {
        "host" : "svor-dbb103",
        "port" : "6379"
       },
       "api" : {
        "prod": "va.bc-platform.liveperson.net",
        "prod_status" : "https://va.bc-mgmt.liveperson.net"
       }
    },
    {
      "region" : "dev",
      "websocket" : {
        "path": "wss://dev.chat.botcentralapi.com"
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
      "region" : "eu",
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
        "path": "wss://chat.botcentralapi.com"
      },
      "redis": {
        "host" : "localhost",
        "port" : "6379"
      },
      "api" : {
        "prod": "https://platformservice.botcentralapi.com",
        "prod_status" : "https://status.botcentralapi.com"
      }
    }
];

console.log('env var: ',process.env.awsregion)

let chosen_region = 'local';
const region_config = config.filter((item) => (item.region == chosen_region))[0]

module.exports = region_config;
