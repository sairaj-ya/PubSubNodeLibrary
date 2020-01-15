const getLocation = (location) => {
  let {
    title, latitude,
    longitude, radius
  } = location;
  let rMsg = {};
  if(title) { rMsg['title'] = title };
  if(latitude) { rMsg['la'] = latitude };
  if(longitude) { rMsg['lo'] = longitude };
  if(radius) { rMsg['radius'] = radius};
  return rMsg;
}

const getImageDict = (images) => {
  let imageDict = {};
  if(!images) {
    return imageDict;
  }
  for(let i =0; i < images.length; i ++) {
    let item = images[i];
    imageDict[item['identifier']] = item['data'];
  }
  return imageDict;
}

const getReceivedMessage = (receivedMessage, imageDict) => {
  return _getMetaMessage(receivedMessage, imageDict);
}

const getReplyMessage = (replyMessage, imageDict) => {
  return _getMetaMessage(replyMessage, imageDict);
}

const _getMetaMessage = (message, imageDict) => {
  let {
    title, subTitle,
    style, imageIdentifier
  } = message;
  let rMsg = {};
  if(title) { rMsg['title'] = title };
  if(subTitle) { rMsg['subtitle'] = subTitle };
  if(imageIdentifier) {
    if(style) { rMsg['style'] = style };
    rMsg['imageURL'] = imageDict[imageIdentifier]
  };
  return rMsg;
}

module.exports = {
  getLocation,
  getImageDict,
  getReceivedMessage,
  getReplyMessage
}
