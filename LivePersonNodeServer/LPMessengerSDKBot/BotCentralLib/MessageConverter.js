const logger = require('./BotCentralLogging');
var uuidV4 = require('uuid/v4');

const AgentConfig = require('../config/AgentConfig');

const tr = require('./Transformer');

const structuredContentWrapper = (res) => {
  return {
    type : 'structuredContent',
    content: res
  }
}

const textContentWrapper = (msg) => {
  return {
    type : 'text',
    message: msg
  }
}

const qrContentWrapper = (res) => {
  return {
    type : 'quickReply',
    message: res['text'],
    quickReplies: res['quickReply']
  }
}

const abcContentWrapper = (res) => {
  return {
    type : 'abc',
    content: res['content'],
    meta : res['meta']
  }
}
const applePayContentWrapper = (res) => {
  return {
    type : 'applePay',
    content: res['content'],
    meta : res['meta']
  }
}

const luisContentWrapper = (luisArray) => {
  return {
    type : 'luis',
    content: luisArray
  }
}


class MessageConverter {
  constructor() {
    //this.botId = AgentConfig['botId'];
  }

  convertToBCMessage(message, botId, userMeta) {
    let longDate = (new Date()).getTime();
    let entryId = uuidV4();
    let senderId = userMeta['consumerId'];
    let postObj = {
      object : 'page',//getBotId(),
      entry : [
        {
          id:  userMeta['mid'] ? userMeta['mid'] : entryId,
          time : longDate,
          messaging : [
            {
              conversationId : userMeta['dialogId'],
              sender : {
                id : senderId//getSenderId()
              },
              recipient : {
                id : botId//getBotId()
              },
              source: 'lp_web',
              channel: 'lp_web',
              timestamp: longDate
            }
          ]
        }
      ]
    };
    let userType = userMeta['userType'];
    if(userType == "SMSContext") {
      postObj.entry[0].messaging[0].source = 'lp_sms';
      postObj.entry[0].messaging[0].channel = 'lp_sms';
    } else if(userType == 'MobileAppContext') {
      postObj.entry[0].messaging[0].source = 'lp_inapp';
      postObj.entry[0].messaging[0].channel = 'lp_inapp';
    } else if(userType == 'grbmIncoming') {
      postObj.entry[0].messaging[0].source = 'lp_inapp';
      postObj.entry[0].messaging[0].channel = 'lp_rcs';
    } else if(userType == 'CustomContext') {
      postObj.entry[0].messaging[0].source = 'CustomContext';
      postObj.entry[0].messaging[0].channel = 'lp_abc';
      if(userMeta['lpChatInfo'] && userMeta['lpChatInfo']['appId'] == 'whatsapp') {
          postObj.entry[0].messaging[0].source = 'lp_inapp';
          postObj.entry[0].messaging[0].channel = 'lp_whatsapp';
      }
    } else if (userType == 'FacebookContext') {
      postObj.entry[0].messaging[0].source = 'lp_fb';
      postObj.entry[0].messaging[0].channel = 'lp_fb';
    }
    let phoneNum = userMeta['phoneNum'];
    if(userMeta['phoneNum']) {
      postObj.entry[0].messaging[0].sender['phoneNumber'] = userMeta['phoneNum'];
    }
    if(userMeta['lpCustomVariables']) {
      postObj.entry[0].messaging[0]['lpCustomVariables'] = userMeta['lpCustomVariables'];
    }
    if(userMeta['lpChatInfo']) {
      postObj.entry[0].messaging[0]['lpChatInfo'] = userMeta['lpChatInfo'];
    }
    if(userMeta['agentInfo']) {
      postObj.entry[0].messaging[0]['agentInfo'] = userMeta['agentInfo'];
    }
    if(userMeta['lpUserInfoList']) {
      postObj.entry[0].messaging[0]['lpUserInfoList'] = userMeta['lpUserInfoList'];
    }
    let msgId = 'mid.'+postObj.entry[0].messaging[0].timestamp +':' + postObj.entry[0].id;
    let msg = message;

    if(msg instanceof Object){
      postObj.entry[0].messaging[0].message = {
        mid : msgId,
        text : msg.caption,
        fileInfo : msg
      }
    }else{
      postObj.entry[0].messaging[0].message = {
        mid : msgId,
        text : msg
      }
    }
    return postObj;
  }

  convertToLPMessage(message, userType) {
    try {
      if(message.attachment && message.attachment.payload ) {
        if(message.attachment.type == 'image') {
          if(userType == 'grbmIncoming') {
            return structuredContentWrapper(tr.grbm.getGRBMImage(message));
          } else {
            return structuredContentWrapper(tr.common.getImage(message));
          }
        }

        if(message.attachment.type === 'audio') {
          logger.info('__unsupported format__: audio');
        }
        if(message.attachment.type === 'video') {
          logger.info('__unsupported format__: video');
        }
      }
    } catch(e) {

    }

    if(userType == 'CustomContext') {
      return this.getABCMessage(message);
    }

    if(userType == 'grbmIncoming') {
      return this.getGRBMMessage(message);
    }

    if(userType == 'FacebookContext') {
      return this.getFacebookMessage(message);
    }

    return this.getMobileWebMessage(message, userType);
  }

  getGRBMMessage(message) {
    var botMessageObject = {};
    try {
      if(message.attachment) {
        let atc = message.attachment;
        let payload = atc.payload;

        if(payload) {
          if (payload.template_type === 'button') {
          //   let res = tr.grbm.getGRBMButton(message, AgentConfig.misc.tileDisplay);
            // return structuredContentWrapper(res)
            // logger.error('[getGRBMMessage] GRBM does not support button tile')

            let res= tr.grbm.getGRBMButton(payload, AgentConfig.misc.tileDisplay);
            return structuredContentWrapper(res)
          }
          if (payload.template_type === 'generic') {
            let res = null;
            if(payload.elements && payload.elements.length == 1) {
              res = tr.grbm.getGRBMCard(payload.elements, AgentConfig.misc.tileDisplay);
            } else {
              res = tr.grbm.getGRBMCarousel(payload.elements);
            }
            return structuredContentWrapper(res)
          }

          if(payload.template_type == 'quickreply') {
            let res = tr.grbm.getGRBMQuickReply(message);
            return qrContentWrapper(res);
          }
        }
      } else {
        if(message.quick_replies) {
          let res =  tr.grbm.getGRBMQuickReply(message);
          return qrContentWrapper(res);
        } else {
          let msg = tr.common.fromTextMessage(message);
          return textContentWrapper(msg);
        }
      }
    } catch(e) {
      logger.error('[convertToLPMessage][exception]', e)
    }
    return {};
  }

  getFacebookMessage(message) {
    var botMessageObject = {}
    try {
      if(message.attachment) {
        let atc = message.attachment;
        let payload = atc.payload;
        if(payload) {
          if (payload.template_type === 'button') {
            let res =  tr.fb.getFacebookButton(message);
            return structuredContentWrapper(res)
          }

          if (payload.template_type === 'generic') {

            let res = tr.fb.getFacebookGenericTile(payload.elements);
            if(payload.elements && payload.elements.length > 1) {
              res = tr.fb.getFacebookList(payload.elements);
              if(AgentConfig.misc.tileDisplay == 'horizontal') {
                res = tr.fb.getFacebookCarousel(payload.elements);
              }
            }

            return structuredContentWrapper(res);
          }
          if(payload.template_type == 'quickreply') {
            let res = tr.fb.getFacebookQuickReply(message);
            return qrContentWrapper(res);
          }
        }
      } else {
        if(message.quick_replies) {
          let res =  tr.fb.getFacebookQuickReply(message);
          return qrContentWrapper(res);
        } else {
          let msg = tr.common.fromTextMessage(message);
          return textContentWrapper(msg);
        }
      }
    } catch(e) {
      logger.error('[convertToLPMessage][exception]', e)
    }
    return {};
  }

  getABCMessage(message) {
    var botMessageObject = {}
    try {
      if(message.attachment) {
        let atc = message.attachment;
        let payload = atc.payload;
        if(payload) {
          if(payload.template_type === 'listpicker') {
            let res =  tr.abc.getListPicker(payload.listPicker);
            return abcContentWrapper(res);
          }
          if(payload.template_type === 'timepicker') {
            let res =  tr.abc.getTimepicker(payload.timePicker);
            return abcContentWrapper(res);
          }
          if(payload.template_type == 'applepay') {
            let res = tr.abc.getApplePay(payload.applePayWidget);
            return applePayContentWrapper(res);
          }
          if(payload.template_type == 'richlink') {
            let res = tr.abc.getRichLink(payload.richLink);
            return structuredContentWrapper(res);
          }
        }
      } else {
        if(message.quick_replies) {
          let res =  tr.common.getQuickReply(message);
          return qrContentWrapper(res);
        } else {
          let msg = tr.common.fromTextMessage(message);
          return textContentWrapper(msg);
        }
      }
    } catch(e) {
      logger.error('[convertToLPMessage][exception]', e)
    }
    return {};
  }

  getMobileWebMessage(message, userType) {
    var botMessageObject = {}
    try {
      if(message.attachment) {
        let atc = message.attachment;
        let payload = atc.payload;
        if(payload) {
          if (payload.template_type === 'button') {
            let res =  tr.common.getButton(message, userType);
            return structuredContentWrapper(res)
          }
          if (payload.template_type === 'generic') {
            let res = tr.common.getStructuredTile(payload.elements);
            if(payload.elements && payload.elements.length > 1
              && AgentConfig.misc.tileDisplay == 'horizontal') {
              res = tr.common.getCarousel(payload.elements);
            }
            return structuredContentWrapper(res);
          }
          if(payload.template_type == 'quickreply') {
            let res = tr.common.getQuickReply(message, userType);
            return qrContentWrapper(res);
          }
        }
      } else {
        if(message.quick_replies) {
          let res =  tr.common.getQuickReply(message, userType);
          return qrContentWrapper(res);
        } else {
          if(tr.common.isLuisMessage(message)) {
            let luisArray = tr.common.getLUISMessage(message, userType);
            return luisContentWrapper(luisArray);
          } else {
            let msg = tr.common.fromTextMessage(message, userType);
            return textContentWrapper(msg);
          }
        }
      }
    } catch(e) {
      logger.error('[convertToLPMessage][exception]', e)
    }
    return {};
  }
}

module.exports = MessageConverter
