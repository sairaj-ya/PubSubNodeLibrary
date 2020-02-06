let isAccessible = true;
if(process.env.enableAccessibility) {
  isAccessible = process.env.enableAccessibility === "true" ? true : false;
}

console.log(`isAccessible:${isAccessible}`)

const createButton = (b) => {
  var btn = {
    type: 'button',
    title: b.title,
    tooltip: b.title,
    click: {}
  }
  if(b.metadata)
    btn.metadata = b.metadata;
  if (b.type === 'postback') {
    let p = b.payload.split('<messageName>')
    btn.click =  {
      actions: [{
        type: 'publishText',
        text : p[p.length - 1] //.split('<messageName>').join('...')
      }]
    }
  } else if (b.type === 'phone_number') {
    // do nothing to change
  } else if (b.type === 'web_url') {
    btn.click = {
      actions: [{
        type: "link",
        "target": b.target ? b.target : undefined,
        name : b.title,
        uri: b.url
      }]
    }
  }
  return btn;
}

const createTitle = (tile) => {
  let obj = {
    "type": "text",
    "tag" : "title",
    "text" : tile['title']
  }
  if(isAccessible) {
    obj['tooltip'] = tile['title'].substring(0,256);
  }
  return obj;
}

const createSubTitle = (tile) => {
  let obj = {
    "type": "text",
    "tag" : "subtitle",
    "text" : tile['subtitle']
  }
  if(isAccessible) {
    obj['tooltip'] = tile['subtitle'].substring(0,256);
  }
  return obj;
}

const createImage = (tile) => {
  return {
    'type' : 'image',
    'url' : tile['image_url']
  }
}

module.exports = {
  createImage,
  createTitle,
  createSubTitle,
  createButton
}
