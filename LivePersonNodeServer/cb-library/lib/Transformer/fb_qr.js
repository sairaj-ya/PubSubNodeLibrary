const getFacebookQuickReply = (message) => {
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
      if(item.answermetadata)
        obj.metadata = item.answermetadata;

      // payload for Facebook Context
      let p = item.payload.split('<messageName>');
      obj.click =  {
        actions: [{
          type: 'publishText',
          text : p[p.length - 1]
        }]
      }
      qrObj['replies'].push(obj);
    })
    retObj['quickReply'] = qrObj;
  }
  if(message.questionmetadata)
    retObj.metadata= message.questionmetadata;

  return retObj;
}
module.exports = { getFacebookQuickReply }
