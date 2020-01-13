const {
  getCarousel
} = require('./carousel');

const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getStructuredTile = (tiles) => {
  let retObj = {
    'type': 'vertical',
    'tag' : 'generic',
    'elements' : []
  }
  let element_arr = []

  tiles.forEach(tile => {
    if(tile['image_url']) {
      element_arr.push(createImage(tile));
    }
    if(tile['title'] && tile['title'] != '[none]') {
      let title_obj = createTitle(tile);
      // title_obj['style'] = { 'bold' : true };
      element_arr.push(title_obj)
    }

    if(tile['subtitle'] && tile['subtitle'] != '[none]') {
      element_arr.push(createSubTitle(tile))
    }

    if(tile.buttons) {
      var tile_button_elements = []
      tile.buttons.forEach(b=>{
        tile_button_elements.push(createButton(b));
      })
      element_arr.push({
        type: "vertical",
        tag: "button",
        elements: tile_button_elements
      })
    }
  });
  retObj['elements'] = element_arr;
  return retObj;
}

module.exports = {
  getStructuredTile
}
