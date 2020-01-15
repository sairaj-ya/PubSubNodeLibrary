const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getListPicker = (listPicker) => {
  let sections = listPicker['sections'] || [];
  let images = listPicker['images'];
  let receivedMessage = listPicker['receivedMessage'];
  let replyMessage = listPicker['replyMessage'];
  let multiSelect = sections.forEach((item) => item['multipleSelection']);
  // add subtitle field only if subTitle exists, then delete subTitle
  if(receivedMessage['subTitle']){
    receivedMessage['subtitle'] = receivedMessage['subTitle'];
  }
  delete receivedMessage['subTitle']

  // add subtitle field only if subTitle exists, then delete subTitle
  if(replyMessage['subTitle']) {
    replyMessage['subtitle'] = replyMessage['subTitle'];
  }
  delete replyMessage['subTitle']

  // create map from image identifiers from identifier to url
  let imageMap = {}
  images.forEach((item)=>{
    imageMap[item['identifier']] = item['data']
  })
  if(receivedMessage['imageIdentifier']) {
    if(imageMap[receivedMessage['imageIdentifier']]) {
      receivedMessage['imageURL'] = imageMap[receivedMessage['imageIdentifier']]
    }
    delete receivedMessage['imageIdentifier'];
  }
  if(multiSelect && multiSelect.length > 0 && multiSelect[0]) {
    receivedMessage['multipleSelection'] = true
  }

  if(replyMessage['imageIdentifier']) {
    if(imageMap[replyMessage['imageIdentifier']]) {
      replyMessage['imageURL'] = imageMap[replyMessage['imageIdentifier']]
    }
    delete replyMessage['imageIdentifier'];
  }
  let secondarySubtitle = null;
  let tertiarySubtitle = null
  if(receivedMessage['secondarySubtitle']) {
    secondarySubtitle = receivedMessage['secondarySubtitle'];
    delete receivedMessage['subtitle'];
  }
  if(replyMessage['secondarySubtitle']) {
    tertiarySubtitle = replyMessage['tertiarySubtitle'];
    delete replyMessage['subtitle'];
  }

  let meta = []
  // listpicker root item
  let retObj = {
    'type': 'vertical',
    'tag' : 'list',
    // 'externalPlatformVersion' : '1.0',
    'elements' : []
  }
  let total_elem_arr = []
  for(var i = 0; i< sections.length; i++) {
    let sec = sections[i]
    // sections.forEach((sec)=> {
    let element_arr = [{
      'type' : 'text',
      'text' : sec['title'],
      'tooltip' : sec['title']
    }]
    let metaObj = {
      'type' : 'BusinessChatMessage',
      'multipleSelection' : sec['multipleSelection'],
      'receivedMessage' : Object.assign({}, receivedMessage),
      'replyMessage' : Object.assign({}, replyMessage)
    }
    // if(secondarySubtitle) { metaObj['secondarySubtitle'] = secondarySubtitle; }
    // if(tertiarySubtitle) { metaObj['tertiarySubtitle'] = tertiarySubtitle; }
    meta.push(metaObj);
    // create the listpicker items
    let tiles = sec['items']
    tiles.forEach((tile) => {
      let tile_obj = {
        type : 'horizontal',
        elements: []
      }
      if(tile['imageIdentifier'] && imageMap[tile['imageIdentifier']]) {
        let img_obj = {
          "type": "image",
          "url": imageMap[tile['imageIdentifier']]
        }
        tile_obj.elements.push(img_obj)
      }
      let textObj = {
        type: 'vertical',
        elements : []
      }
      if(tile['title'] && tile['title'] != '[none]') {
        let title_obj = createTitle(tile);
        title_obj['style'] = {
          "bold": true,
          "size": "large"
        };
        textObj.elements.push(title_obj);
      }

      if(tile['subtitle']) {
        textObj.elements.push(createSubTitle(tile));
      }
      tile_obj.elements.push(textObj);
      element_arr.push(tile_obj);
    })
    total_elem_arr.push({'type':'vertical', 'elements': element_arr});
  }
  retObj['elements']= total_elem_arr;
  return {
    'content' : retObj,
    'meta' : meta
  };
}

module.exports = {
  getListPicker
}
