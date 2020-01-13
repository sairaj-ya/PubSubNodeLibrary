const logger = require('./BotCentralLogging');
const AgentConfig = require('../config/AgentConfig');

const MAX_NUM_MESSAGE_IN_CACHE = 5;

class ConversationDataStore {
  constructor() {
    this.meta = {};
    this.dialogIdMap = {};

    this.lpMessageDataStore = {};
    this.bcMessageDataStore = {};
  }

  retrieveLastLPMessage(consumerId) {
    if(!this.lpMessageDataStore[consumerId] || this.lpMessageDataStore[consumerId].length == 0) {
      return null
    }
    return this.lpMessageDataStore[consumerId][this.lpMessageDataStore[consumerId].length - 1];
  }

  retrieveLastBCMessage(consumerId) {
    if(!this.bcMessageDataStore[consumerId] || this.bcMessageDataStore[consumerId].length == 0) {
      return null
    }
    return this.bcMessageDataStore[consumerId][this.bcMessageDataStore[consumerId].length - 1];
  }

  addLPMessage(consumerId, message) {
    if(!this.lpMessageDataStore[consumerId]) {
      this.lpMessageDataStore[consumerId] = []
    }
    this.lpMessageDataStore[consumerId].push(message);
    if(this.lpMessageDataStore[consumerId].length > MAX_NUM_MESSAGE_IN_CACHE) {
      this.lpMessageDataStore[consumerId].shift();
    }
  }

  addBCMessage(consumerId, message) {
    if(!this.bcMessageDataStore[consumerId]) {
      this.bcMessageDataStore[consumerId] = []
    }
    this.bcMessageDataStore[consumerId].push(message);
    if(this.bcMessageDataStore[consumerId].length > MAX_NUM_MESSAGE_IN_CACHE) {
      this.bcMessageDataStore[consumerId].shift();
    }
  }

  removeFromDataStore(consumerId) {
    if(this.lpMessageDataStore[consumerId]) {
        delete this.lpMessageDataStore[consumerId];
    }
    if(this.bcMessageDataStore[consumerId]) {
        delete this.bcMessageDataStore[consumerId];
    }
  }

  addToMetaStore(dialogId, obj) {
    this.meta[dialogId] = obj;
  }

  updateKey(dialogId, key, val) {
    if(!this.meta[dialogId]) {
        this.addToMetaStore(dialogId, {});
    }
    this.meta[dialogId][key] = val;
  }

  getByKey(dialogId, key) {
    if(this.meta[dialogId] && this.meta[dialogId][key]) {
        return this.meta[dialogId][key];
    }
    return null;
  }

  removeFromMetaStore(dialogId) {
    let consumerId = this.getByKey(dialogId, 'consumerId');
    if(consumerId) {
      delete this.dialogIdMap[consumerId];
    }
    if(this.meta[dialogId]) {
        delete this.meta[dialogId];
    }
  }

  addUserToDialogPair(userId, dialogId) {
    this.dialogIdMap[userId] = dialogId;
  }

  containDialogId(key) {
    return !!(this.meta[key])
  }

  getMetaObjectFromConsumerId(consumerId) {
    let dialogId = this.getDialogIdFromConsumerId(consumerId);
    if(!dialogId) { return null }
    let meta = this.meta[dialogId];
    if(meta) {
      return this._botcentralMetaWrapper(dialogId, meta)
    } else {
      logger.warn(`[getMetaObjectFromConsumerId][consumerId:${consumerId}] dialogId does not exist`)
      return null
    }
  }

  setAgentId(agentId) {
    this.agentId = agentId;
  }

  getMetaObjectFromDialogId(dialogId) {
    let meta = this.meta[dialogId];
    if(meta) {
      return this._botcentralMetaWrapper(dialogId, meta)
    } else {
      logger.warn(`[getMetaObjectFromDialogId][dialogId:${dialogId}] consumerId does not exist`)
      return null
    }
  }

  getDialogIdFromConsumerId(consumerId) {
    if(this.dialogIdMap[consumerId]) {
      return this.dialogIdMap[consumerId]
    } else {
      return null;
    }
  }

  _botcentralMetaWrapper(dialogId, meta) {
    if(!meta) {return null}
    return {
      'consumerId': meta.consumerId,
      'userType': meta.userType,
      'dialogId': dialogId,
      'lpUserInfoList' : meta.lpUserInfoList,
      'lpChatInfo' : {...meta.lpChatInfo, 'conversationType' : AgentConfig.appType},
      'agentInfo': {
        accountId : AgentConfig.accountId,
        accountUser: this.agentId ? this.agentId : AgentConfig.username //AgentConfig.username
      }
    }
  }
}

const ms = new ConversationDataStore();
const getConversationDataStore = () => {
  return ms;
}
module.exports = {
  getConversationDataStore
}
