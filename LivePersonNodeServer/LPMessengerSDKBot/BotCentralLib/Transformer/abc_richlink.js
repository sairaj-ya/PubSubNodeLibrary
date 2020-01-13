const {
  createTitle,
  createSubTitle,
  createButton,
  createImage
} = require('./common');

const isRichLink = (tiles) => {
  if(tiles.length == 1) {
    let tile = tiles[0];
    if(tile.title == 'BLANK_MESSAGE'
    && tile.subtitle == 'BLANK_MESSAGE'
    && tile.buttons && tile.buttons.length == 1
  ) {
      return true;
    }
  }
  return false;
}


const getRichLink = (richLink) => {
  let richLinkType = richLink.type == 'VIDEO' ? 'video' : 'image';

  let retObj = {
    'type': 'vertical',
    'tag' : 'richLink',
    'elements' : [
      {
        "type" : richLinkType,
        "url" : richLink.url
      },
      {
        "type": "button",
        "title": richLink.title,
        "click": {
          "actions": [
            {
              "type": "link",
              "uri": richLink.itemUrl
            }
          ]
        }
      }
    ]
  }
  return retObj;
}

module.exports = {
  isRichLink,
  getRichLink
}
