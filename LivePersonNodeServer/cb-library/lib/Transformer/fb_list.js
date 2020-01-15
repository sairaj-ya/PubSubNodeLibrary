const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getFacebookList = (tiles) => {
  let retObj = {
    'type': 'vertical',
    'tag' : 'list',
    'elements' : []
  }

  let element_arr = [];
  tiles.forEach(tile => {
    let tile_arr = [];
    if(tile['image_url']) {
      tile_arr.push(createImage(tile));
    }

    let text_portion = {
      type : 'vertical',
      elements : []
    }
    if(tile['title'] && tile['title'] != '[none]') {
      let title_obj = createTitle(tile);
      // title_obj['style'] = { 'bold' : true };
      text_portion.elements.push(title_obj)
    }

    if(tile['subtitle'] && tile['subtitle'] != '[none]') {
      text_portion.elements.push(createSubTitle(tile))
    }

    if(tile.buttons) {
      tile.buttons.forEach(b=>{
        text_portion.elements.push(createButton(b));
      });
    }

    tile_arr.push(text_portion);



    element_arr.push({
      type : 'horizontal',
      elements : tile_arr
    })
  });
  retObj['elements'] = [{
    type : 'vertical',
    elements: element_arr
  }];
  return retObj;
}

module.exports = {
  getFacebookList
}
