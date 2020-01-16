const conf = {
  maskedMessageLength : 4,
  timersConfig : {
    STARTUP_WAIT_TIMER : 10 * 1000,
    GET_CLOCK_INTERVAL : 60 * 1000,
    MIN_WAIT : 10 * 1000,
    MAX_WAIT : 60 * 1000 * 3,
    CONSTANT_RECONNECT_WAIT : 3*60*1000,
    SELF_MONITORING_WAIT : 5 * 60 * 1000
  },
  defaultMsg : {
    defaultCloseDialogMessage: 'LP_CLOSEDIALOG',
    defaultCloseConversationMessage: 'LP_CLOSECONVERSATION',
    defaultGreetingMessage: 'hi',
    defaultStepupMessage: '_STEPUP_',
    defaultEmptyMessage : 'BLANK_MESSAGE',
    defaultEscalationFailMessage : '__agent_escalation_failed__',
    defaultImageReceivedMessage : '__image_received__'
  },
  misc : {
    retryMessageInterval : 30000,
    messageResendMaxRetries : 1
  },
  path : {
    "aws-us" : {
      "websocket" : "wss://chat.botcentralapi.com",
      "redis": {
        "host" : "prod2redis.qnqxx8.ng.0001.usw1.cache.amazonaws.com",
        "port" : "6379"
      }
    },
    "aws-eu" : {
      "websocket" : "ws://chat-i.eubotintra.com",
      "redis": {
        "host" : "eu-prod-redis.bpw09s.ng.0001.euw2.cache.amazonaws.com",
        "port" : "6379"
      }
    },
    "aws-ap" : {
      "websocket" : "wss://chat-ap.botcentralapi.com",
      "redis": {
        "host" : "ap-prod-redis.bsczzu.ng.0001.apse2.cache.amazonaws.com",
        "port" : "6379"
      }
    },
    "dev" : {
      "websocket" : "wss://dev.msg.botcentralapi.com",
      "redis": {
        "host" : "localhost",
        "port" : "6379"
      }
    },
    "local" : {
      "websocket" : "ws://localhost:9092/socket.io",
      "redis": {
        "host" : "localhost",
        "port" : "6379"
      }
    },
    "alpha" : {
      "websocket" : "wss://botbuilder2-chat.botcentralapi.com",
      "redis": {
        "host" : "redis-prod.5o3coz.ng.0001.usw2.cache.amazonaws.com",
        "port" : "6379"
      }
    },
    "lp-alpha" : {
      "websocket" : "wss://va-a.bc-msg.liveperson.net",
      "redis": {
        "host" : "avor-dbb102",
        "port" : "6379"
      }
    },
    "us-staging" : {
      "websocket" : "wss://staging.msg.botcentralapi.com",
      "redis": {
        "host" : "redisstaging.5o3coz.ng.0001.usw2.cache.amazonaws.com",
        "port" : "6379"
      }
    },
    "lp-qa" : {
      "websocket" : "wss://msg-dev.dev.lprnd.net",
      "redis": {
        "host" : "qtor-bot10",
        "port" : "6379"
      }
    },
    "lp-us-va" : {
      "websocket" : "wss://va.bc-msg.liveperson.net",
      "redis": {
        "host" : "svor-dbb103",
        "port" : "6379"
      }
    },
    "lp-lo-eu" : {
      "websocket" : "wss://lo.bc-msg.liveperson.net",
      "redis": {
        "host" : "slor-abb126",
        "port" : "6379"
      }
    },
    "lp-ap-sy" : {
      "websocket" : "wss://sy.bc-msg.liveperson.net",
      "redis": {
        "host" : "ssor-dbb115",
        "port" : "6379"
      }
    }
  }
};

module.exports = conf;
