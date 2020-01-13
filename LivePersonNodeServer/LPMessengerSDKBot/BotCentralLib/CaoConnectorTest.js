
var conf = {
  appName: process.env.APP_NAME,
  appType : process.env.APP_TYPE,
  botId : process.env.BOT_ID,
  accountId:  process.env.LP_ACCOUNT,
  cao_username:  process.env.LP_USER,
  cao_password: process.env.LP_PASS
};

const BCAgent = require('./BotCentralWebSocket')
const bcAgent = new BCAgent(conf);

const sendMessageToCAO = (res) => {
  let from = decrypt(res.recipient.id);
  let msg = res.message.text;
}

const onEscalation = (res, callback) => {
  let from = decrypt(res.recipient.id);
}
const onTypingOn = (res) => {
  let from = decrypt(res.recipient.id);

}
const onTypingOff = (res) => {
  let from = decrypt(res.recipient.id);

}

const onEndConversation = (res) => {
  let from = decrypt(res.recipient.id);

}

bcAgent.setOnMessageCallback(sendMessageToCAO);
bcAgent.setOnEscalationCallback(onEscalation);
bcAgent.setOnTypingOnCallback(onTypingOn);
bcAgent.setOnTypingOffCallback(onTypingOff);
bcAgent.setOnEndConversation(onEndConversation);
