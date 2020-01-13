const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getGRBMCard = (tiles, display) => {
  let retObj = {
    'type': display,
    'tag' : 'generic',
    'elements' : []
  }

  tiles.forEach(tile => {
    let element_arr = [];
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
      tile.buttons.forEach(b=>{
        element_arr.push(createButton(b));
      });
    }
    retObj['elements'].push({
      type : 'vertical',
      elements: element_arr
    })
  });
  return retObj;
}

module.exports = {
  getGRBMCard
}
