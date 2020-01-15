const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getFacebookCarousel = (tiles) => {
  let retObj = {
    'type' : 'carousel',
    'padding' : 10,
    'elements' : []
  }
  let element_arr = [];
  tiles.forEach(tile => {
    let tile_obj = {
      'type' : 'vertical',
      'tag' : 'generic',
      'elements' : []
    }
    let nested_element_obj = {
      "type" : 'vertical',
      "elements" : []
    }
    if(tile['image_url']) {
      nested_element_obj['elements'].push(createImage(tile))
    }

    if(tile['title'] && tile['title'] != '[none]') {
      nested_element_obj['elements'].push(createTitle(tile))
    }

    if(tile['subtitle'] && tile['subtitle'] != '[none]') {
      nested_element_obj['elements'].push(createSubTitle(tile))
    }
    if(tile['buttons']) {
      tile.buttons.forEach(b=>{
        nested_element_obj['elements'].push(createButton(b));
      })
    }
    tile_obj['elements'].push(nested_element_obj);
    element_arr.push(tile_obj);
  })
  retObj['elements'] = element_arr;
  return retObj;
}

module.exports = {
  getFacebookCarousel
}
