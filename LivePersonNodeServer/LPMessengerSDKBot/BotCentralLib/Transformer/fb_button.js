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
  return {
    type: "vertical",
    tag: "button",
    elements: button_array
  };
}

module.exports = {
  getFacebookButton
}
