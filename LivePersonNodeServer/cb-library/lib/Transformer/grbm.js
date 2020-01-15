const getGRBMStructuredTile = (tiles) => {
  let retObj = {
    'type': 'vertical',
    'elements' : []
  }
  let element_arr = []

  tiles.forEach(tile => {
    if(tile['image_url']) {
      let img_obj = {
        "type": "image",
        "url": tile['image_url']
      }
      element_arr.push(img_obj)
    }
    if(tile['title'] && tile['title'] != '[none]') {
      let title_obj = {
        "type": "text",
        "text" : tile['title'],
        "style": {
          "bold": true
        }
      }
      element_arr.push(title_obj)
    }

    if(tile['subtitle'] && tile['subtitle'] != '[none]') {
      let subtitle_obj = {
        "type": "text",
        "text" : tile['subtitle'],
      }
      element_arr.push(subtitle_obj)
    }

    if(tile.buttons) {
      tile.buttons.forEach(b=>{
        var btn = {
          type: 'button',
          title: b.title,
          tag: "button",
          click: {}
        }
        if (b.type === 'postback') {
          btn.click =  {
            actions: [{
              type: 'publishText',
              text : b.title
            }]
          }
        } else if (b.type === 'phone_number') {
          // do nothing to change
        } else if (b.type === 'web_url') {
          // btn.metaData.url = b.url;
          btn.click = {
            actions: [{
              type: "link",
              uri: b.url,
  name: b.title
            }]
          }
        }
        element_arr.push(btn)
      })
    }
  });
  retObj['elements'] = element_arr;
  return retObj;
}

module.exports = {
  getGRBMStructuredTile
}
