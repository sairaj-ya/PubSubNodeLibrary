const getGRBMImage = (message) => {
  let retObj = {
    "type":"vertical",
    "tag":"generic",
    "elements":[
      {
        "type":"vertical",
        "elements":[
          {
            "type":"image",
            "url": message.attachment.payload.url
          }]
      }
    ]
  }

  return retObj;
}

module.exports = {
  getGRBMImage
}
