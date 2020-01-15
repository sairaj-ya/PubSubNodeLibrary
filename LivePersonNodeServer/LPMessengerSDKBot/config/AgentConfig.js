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
  websocket:{
    "aws-us" : "wss://chat.botcentralapi.com",
    "aws-eu" : "ws://chat-i.eubotintra.com",
    "aws-ap" : "wss://chat-ap.botcentralapi.com",
    "dev" : "wss://dev.msg.botcentralapi.com",
    "local" : "ws://localhost:9092/socket.io",
    "alpha" : "wss://botbuilder2-chat.botcentralapi.com",
    "lp-alpha" : "wss://va-a.bc-msg.liveperson.net",
    "us-staging" : "wss://staging.msg.botcentralapi.com",
    "lp-qa" : "wss://msg-dev.dev.lprnd.net",
    "lp-us-va" : "wss://va.bc-msg.liveperson.net",
    "lp-lo-eu" : "wss://lo.bc-msg.liveperson.net",
    "lp-ap-sy" : "wss://sy.bc-msg.liveperson.net"
  }
};

module.exports = conf;
