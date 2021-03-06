const {
  createButton
} = require('./common');

const getButton = (message, userType) => {
  let msgPayload = message.attachment.payload
  let msgContent = msgPayload.text;
  let button_array = [
    {
      "type": "text",
      "text": msgContent,
      "tooltip" : msgContent,
      // "style": {
      //   "bold": true
      // }
    }
  ]
  if(msgPayload && msgPayload.buttons) {
    msgPayload.buttons.forEach(b => {
      button_array.push(createButton(b));
    });
  }
  return {
    type: "vertical",
    tag: "button",
    elements: button_array
  };
}

module.exports = {
  getButton
}
