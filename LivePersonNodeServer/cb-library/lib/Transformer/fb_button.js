const {
  createButton
} = require('./common');

const getFacebookButton = (message) => {
  let msgPayload = message.attachment.payload
  let msgContent = msgPayload.text;
  let button_array = [
    {
      type : 'vertical',
      elements: [{
        "type": "text",
        "tag": "title",
        "text": msgContent,
        "tooltip" : msgContent
      }]
    }
  ]
  if(msgPayload && msgPayload.buttons) {
    msgPayload.buttons.forEach(b => {
      button_array[0].elements.push(createButton(b));
    });
  }
  
  let retObj = {
    type: "vertical",
    tag: "button",
    elements: button_array
  };
  if(msgPayload.questionmetadata)
    retObj.metadata= msgPayload.questionmetadata;
  return retObj;
}

module.exports = {
  getFacebookButton
}
