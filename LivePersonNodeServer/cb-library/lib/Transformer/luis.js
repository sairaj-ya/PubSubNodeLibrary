const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');


const _normalizeMessage = (message) => {
  var msg = message.text.trim();
  if(msg[msg.length-1] == '.') {
    msg = msg.substring(0, msg.length - 1)
  }
  return msg;
}

const isLuisMessage = (message) => {
  // if the message is a json string, then it's a LUIS message
  try {
    if(typeof JSON.parse(_normalizeMessage(message)) == 'object') {
      return true;
    }
    return false;
  } catch(e) {
    return false;
  }
}


const getLUISMessage = (message, userType) => {
  let objArr = JSON.parse(_normalizeMessage(message));
  let msgArray = [];
  for(let i = 0; i < objArr.length; i++) {
    let obj = objArr[i];
    console.log('[fromLUISMessage]',i,obj)

    let messageText = obj['text'];
    let attachments = obj['attachments'];
    if(!messageText && !attachments) {
      continue;
    }
    if(!attachments || attachments.length == 0)
    {
      if(messageText.length > 0) {
        msgArray.push({
          'type' : 'text',
          'payload' : messageText
        })
      }
    } else if(userType == 'SMSContext') {
        let smsBtnObj = {
          'type' : 'text',
          'payload' : attachments[0].content.text + '\n'
        }
        messageTitleArray.forEach(item=> {
          smsBtnObj['payload'] += ('-'+ item + '\n')
        })
        msgArray.push(smsBtnObj)
    } else if(attachments && attachments.length > 0) {
      if(isStructuredTile(attachments)) {
        let retObj = {
          'type': 'vertical',
          'tag' : 'generic',
          'elements' : []
        }
        let structTiles = getLuisStructuredTiles(attachments, userType);
        retObj['elements'] = structTiles;
        console.log('structTiles:',structTiles)
        msgArray.push({
          type: 'rich',
          payload: retObj
        });
      } else {
        let button_array = getLuisButtonTiles(attachments, userType)
        msgArray.push({
          type: 'rich',
          'payload' : {
            'type': "vertical",
            'tag' : "button",
            'elements': [{
              'type' : "vertical",
              'elements' : button_array
            }]
          }
        })
      }
    }
  }
  console.log('msgArray', msgArray);
  return msgArray;
}

const isStructuredTile = (attachments) => {
  let msgContent = attachments[0].content;
  return !!msgContent['images'];
}

const getLuisStructuredTiles = (attachments, userType) => {
  let element_arr = []
  console.log('attachments',attachments)
  for(var i = 0; i < attachments.length; i++) {
    var item = attachments[i];
    let tile = item['content'];
    console.log('content', tile)
    if(tile['images'] && tile['images'].length > 0 && tile['images'][0]['url']) {
      element_arr.push({
        'type' : 'image',
        'url' : tile['images'][0]['url']
      });
    }
    if(tile['title'] && tile['title'] != '[none]') {
      element_arr.push( {
        "type": "text",
        "tag" : "title",
        "text" : tile['title']
      })
    }

    if(tile['subtitle'] && tile['subtitle'] != '[none]') {
      element_arr.push({
        "type": "text",
        "tag" : "subtitle",
        "text" : tile['subtitle']
      })
    }

    if(tile.buttons) {
      var tile_button_elements = _getLuisButtons(tile.buttons, userType);
      element_arr.push(tile_button_elements);
    }
  }
  return element_arr;
}
const getLuisButtonTiles = (attachments, userType) => {
  let msgPayload = attachments[0];
  let msgContent = msgPayload.content;
  let button_array = [
    {
      "type": "text",
      "text": msgContent.text ? msgContent.text : msgContent.title,
    }
  ]
  let messageTitleArray = []
  if(msgContent && msgContent.buttons && msgContent.buttons.length > 0) {
    let btns = _getLuisButtons(msgContent.buttons);
    for(var i = 0; i< btns.length; i++) {
      button_array.push(btns[i])
    }
  }
  return button_array
}

const _getLuisButtons = (buttons, userType) => {
  let button_array = []
  buttons.forEach(b => {
    let title = b.title;
    if(userType == 'FacebookContext' && b.title.length >= 20) {
      title = b.title.substring(0,17) + '...'
    }
    var btn = {
      type: 'button',
      title: title,
      click: {}
    }
    if (b.type === 'imBack' || b.type == 'postBack') {
      btn.click =  {
        actions: [{
          type: 'publishText',
          text : b.value
        }]
      }
    }
    button_array.push(btn);
  });
  return button_array;
}

module.exports = {
  isLuisMessage,
  getLUISMessage
}
