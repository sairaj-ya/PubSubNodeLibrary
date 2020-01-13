const conf = {
  appName: process.env.APP_NAME,
  appType: process.env.APP_TYPE,
  botId : process.env.BOT_ID,
  accountId: process.env.LP_ACCOUNT,
  skillId : process.env.SKILL_ID,
  username: process.env.LP_USER,
  password: process.env.LP_PASS,
  appKey: process.env.LP_APPKEY,
  secret: process.env.LP_APPSECRET,
  accessToken: process.env.LP_ACCESSTOKEN,
  accessTokenSecret: process.env.LP_ACCESSTOKENSECRET,
  role : process.env.LP_ROLE,
  fileOperation : {
    swift_to_brand : 'Swift_To_Brand',
    brand_to_swift : 'Brand_To_Swift'
  },
  fileStatus : {
    inProg : 'InProgress',
    success : 'Success',
    fail : 'Fail'
  },
  maskedMessageLength : 4,
  timersConfig : {
    STARTUP_WAIT_TIMER : 10 * 1000,
    GET_CLOCK_INTERVAL : 60 * 1000,
    MIN_WAIT : 10 * 1000,
    MAX_WAIT : 60 * 1000 * 3,
    CONSTANT_RECONNECT_WAIT : 3*60*1000,
    SELF_MONITORING_WAIT : 5 * 60 * 1000
  },
  webhook : {
    externalWebhookUrl : process.env.externalWebhookUrl || null,
    externalWebhookAPIKey : process.env.externalWebhookAPIKey || null,
    apigee_auth_url : process.env.apigee_auth_url || null,
    apigee_grant_type : process.env.apigee_grant_type || null,
    apigee_audience: process.env.apigee_audience || null,
    apigee_client_id : process.env.apigee_client_id || null,
    apigee_client_secret : process.env.apigee_client_secret || null,
  },
  defaultMsg : {
    defaultCloseDialogMessage: 'LP_CLOSEDIALOG',
    defaultCloseConversationMessage: 'LP_CLOSECONVERSATION',
    defaultGreetingMessage: process.env.defaultGreetingMessage || 'hi',
    defaultStepupMessage: process.env.defaultStepupMessage || '_STEPUP_',
    defaultEmptyMessage : process.env.defaultEmptyMessage || 'BLANK_MESSAGE',
    defaultEscalationFailMessage : process.env.defaultEscalationFailMessage || '__agent_escalation_failed__',
    defaultImageReceivedMessage : process.env.defaultImageReceivedMessage || '__image_received__'
  },
  misc : {
    enableAccessibility : process.env.enableAccessibility == "false" || true,
    disableGreetings : process.env.disableGreetings == "true" || false,
    messageDelay: process.env.messageDelay ? parseInt(process.env.messageDelay) : 100,
    fallbackSkillId : process.env.fallbackSkillId || null,
    fallbackEscalationTime : process.env.fallbackEscalationTime ? parseInt(process.env.fallbackEscalationTime) : 60 * 1000 * 3, // 3 minutes by default
    skipAgentMessage : process.env.skipAgentMessage == "true" || false,
    useCarousel: process.env.useCarousel === "true" || false,
    tileDisplay : process.env.tileDisplay == 'horizontal' ? 'horizontal' : 'vertical',
    applePayMerchantSessionURL : process.env.applePayMerchantSessionURL || null,
    messageResendMaxRetries : process.env.messageResendMaxRetries ? parseInt(process.env.messageResendMaxRetries) : 1,
    retryMessageInterval : process.env.retryMessageInterval ? parseInt(process.env.retryMessageInterval) : 30000,
    maxEscalationRetries : process.env.maxEscalationRetries ? parseInt(process.env.maxEscalationRetries) : 5,
    ringAcceptWait : process.env.ringAcceptWait ? parseInt(process.env.ringAcceptWait) : 100,
    botcentralConnectionType : process.env.botcentralConnectionType || null
  }
};

if(process.env.CSDSDOMAIN || (process.env.LP_ACCOUNT && process.env.LP_ACCOUNT.includes('le'))) {
  conf['csdsDomain'] = process.env.CSDSDOMAIN ? process.env.CSDSDOMAIN : 'hc1n.dev.lprnd.net';
}

module.exports = conf;
