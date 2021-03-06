const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getGRBMQuickReply = (message) => {
  let retObj = {
    'text' : message['text'] ? message['text'] : '',
    'quickReply' : null
  }

  let qrObj = {
    'type' : 'quickReplies',
    'itemsPerRow' : 8,
    'replies' : []
  }
  if(message.quick_replies && message.quick_replies.length > 0) {
    message.quick_replies.forEach(item => {
      let obj = {
        'type' : 'button',
        'title' : item['title'],
        'tooltip' : item['title'],
        'click' : {
          'actions': [
            { 'type' : 'publishText', 'text': item['title']}
          ]
        }
      }
      qrObj['replies'].push(obj);
    })
    retObj['quickReply'] = qrObj;
  }

  return retObj;
}

module.exports = {
  getGRBMQuickReply
}
