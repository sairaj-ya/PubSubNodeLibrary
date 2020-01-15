const getEvent = (dialogId, lpObj) => {
  let {
    type, content, message, quickReplies, meta
  } = lpObj;
  let eventObj = null;
  switch(type) {
    case 'text':
      eventObj = getPlainTextEvent(dialogId, message);
      break;
    case 'abc':
      eventObj = getRichContentEvent(dialogId, content);
      break;
    case 'applePay':
      eventObj = getApplePayEvent(dialogId, content);
      break;
    case 'structuredContent':
      eventObj = getRichContentEvent(dialogId, content);
      break;
    case 'quickReply':
      eventObj = getQuickReplyEvent(dialogId, message, quickReplies);
      break;
  }
  return eventObj;
}

const getPlainTextEvent = (dialogId, message) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'ContentEvent',
      contentType: 'text/plain',
      message: message
    }
  }
}

const getRichContentEvent = (dialogId, content) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'RichContentEvent',
      content: content
    }
  }
}
const getApplePayEvent = (dialogId, content) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'RichContentEvent',
      content: content
    }
  }
}

const getQuickReplyEvent = (dialogId, message, quickReplies) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'ContentEvent',
      contentType: 'text/plain',
      message: message,
      quickReplies : quickReplies
    }
  }
}

const getTypingEvent = (dialogId, state) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'ChatStateEvent',
      chatState: state
    }
  }
}

const getEscalateEvent = (dialogId, escalationSkillId, agentId) => {
  let retObj = {
    conversationId: dialogId,
    conversationField: [{
      field: 'ParticipantsChange',
      type: 'REMOVE',
      role: 'ASSIGNED_AGENT'
    }]
  }
  if(agentId) {
    retObj['conversationField'].push({
        field: 'ParticipantsChange',
        type: 'SUGGEST',
        userId : agentId,
        role: 'ASSIGNED_AGENT'
      })
  }
  retObj['conversationField'].push({
    field: 'Skill',
    type: 'UPDATE',
    skill: escalationSkillId
  })
  return retObj;
}

const getParticipantChangeEvent = (dialogId, changeType ,role) => {
  return {
      'conversationId': dialogId,
      'conversationField': [{
          'field': 'ParticipantsChange',
          'type': changeType, // ADD or REMOVE
          'role': role
      }]
  }
}

const getEndConvEvent = (dialogId) => {
  return {
    conversationId: dialogId,
    conversationField: [{
      field: 'ConversationStateField',
      conversationState: 'CLOSE'
  }]};
}

const getCloseDialogEvent = (dialogId, reason) => {
  return {
    conversationId: dialogId,
    conversationField: [{
      field: 'DialogChange',
      type : 'UPDATE',
      dialog : {
          dialogId: dialogId,
          state: 'CLOSE',
          closedBy: 'AGENT',
          closedCause: reason
      }
  }]};
}

const getSecureFormEvent = (dialogId, reason) => {
  return {
    dialogId: dialogId,
    event: {
      type: 'ContentEvent',
      contentType: 'forms/secure-invitation',
      message: {
        formId: "813633132",
        invitationId: "91bdcd8b035fdbba60efe5760c0e921dd651c0ed9443bf2fde31ba06f57bc4fe-5a1fe959-94fc-4a97-8062-7968965443f7-1561593636564-1",
        title: "sample"
      }
    }
  }
}


module.exports = {
  getEvent,
  getPlainTextEvent,
  getRichContentEvent,
  getParticipantChangeEvent,
  getQuickReplyEvent,
  getTypingEvent,
  getApplePayEvent,
  getEscalateEvent,
  getEndConvEvent,
  getCloseDialogEvent,
  getSecureFormEvent
}
