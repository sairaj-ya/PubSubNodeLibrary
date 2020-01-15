const {
  getPlainTextEvent,
  getRichContentEvent,
  getParticipantChangeEvent,
  getQuickReplyEvent,
  getTypingEvent,
  getEscalateEvent,
  getEndConvEvent
}  = require('./eventHelper')

/**
 * Process message listeners, used for API retrieval
 * pm2 can send message bus to retrieve agent status or open convs
 */

const _onMessageReceived = (agent, data) => {
  const {
    consumerId,
    dialogId,
    messages
    // action,
    // content,
    // message,
    // escalationSkillId
  } = data;
  for(var i = 0; i< messages.length; i++) {
    const { message, action, content, escalationSkillId } = messages[i];
    switch(action) {
      case 'PlainText':
        agent.publishEvent(getPlainTextEvent(dialogId, message));
        break;
      case 'StructuredContent':
        agent.publishEvent(getRichContentEvent(dialogId, content));
        break;
      case 'QuickReply':
        if(content) {
          agent.publishEvent(getQuickReplyEvent(dialogId, content['message'], content['quickReplies']));
        }
        break;
      case 'Transfer':
        agent.updateConversationField(getEscalateEvent(dialogId, escalationSkillId))
        break;
      case 'close':
        agent.updateConversationField(getEndConvEvent(dialogId));
        break;
      default:
        agent.publishEvent(getPlainTextEvent(dialogId, message));
    }
  }
}

const initProcessListeners = (agent) => {
  process.on('message', function(packet) {
    let type = packet.type;
    let data = packet.data;
    console.log(`[Process Message]:${type}`, '\tData:', JSON.stringify(data));
    switch(type) {
      case 'SEND_MESSAGE':
        _onMessageReceived(agent, data)
        break;
      case 'STATUS_UPDATE':
        agent.setAgentStatus(data);
    }
  });
}

module.exports = {
  initProcessListeners
}
