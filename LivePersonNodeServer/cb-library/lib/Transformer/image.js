const getImage = (message) => {
  return {
    "type": "image",
    "url": message.attachment.payload.url,
    "click" : {
      actions: [{
        type : 'link',
        uri : message.attachment.payload.url
      }]
    },
    "rtl" : true
  }
}

module.exports = {
  getImage
}
