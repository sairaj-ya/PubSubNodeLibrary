const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const getGRBMButton = (payload, display) => {
  let retObj = {
    'type': display,
    'tag' : 'generic',
    'elements' : []
  }
  if(payload.questionmetadata)
    retObj.metadata= payload.questionmetadata;
    
  let element_arr = [];
  if(payload['text'] && payload['text'] != '[none]') {
    let title_obj = createTitle({'title' : payload['text']});
    // title_obj['style'] = { 'bold' : true };
    element_arr.push(title_obj)
  }
  payload.buttons.forEach(btn => {
    element_arr.push(createButton(btn));
  });
  retObj['elements'].push({
    type : 'vertical',
    elements: element_arr
  })
  return retObj;
}

module.exports = {
  getGRBMButton
}
