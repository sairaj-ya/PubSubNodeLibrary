
const fromTextMessage = (message, userType) => {
  var msg = message.text.trim();
  if(userType == 'MobileAppContext') {
    msg = msg.replace(/<br\/>/g,'\n');
  }
  return msg
}

module.exports = {
  fromTextMessage
}
