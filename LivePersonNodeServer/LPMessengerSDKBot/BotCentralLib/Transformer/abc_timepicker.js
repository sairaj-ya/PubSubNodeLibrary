const {
  getImageDict,
  getReceivedMessage,
  getReplyMessage,
  getLocation
} = require('./abcMeta')

const getTimepicker = (timePicker) => {
  let retObj = {};
  try {
    retObj['content'] = _getTimePickerElements(timePicker);
    retObj['meta'] = _getTimePickerMetaData(timePicker);
  } catch(e) {
    console.log('timePicker exception', e);
  }

  return retObj;
}

const _getTimePickerElements = (timePicker) => {
  let source = timePicker['event'];
  let {
    timezoneOffset, identifier,
    title, location,
    timeSlots, images,
    receivedMessage, replyMessage
  } = source;

  let baseObj = {
    "type": "vertical",
    "tag": "datePicker",
    "elements": []
  };
  let elements_arr = [];

  // push first object
  elements_arr.push({
    "type": "text",
    "text": receivedMessage['title'],
    "tag": "Title",
    "style": {
      "bold": true,
      "size": "large"
    }
  })

  let time_elements = {
    "type": "horizontal",
    "elements": []
  }

  let timeGroup = []


  /**
  1) loop through the sorted timeSlots
  2) group timeSlots by date
  3) for each new Date, add a text title for that date
  4) for each Date, add the list of times in a horizontal fashion
  */
  let sortedTimeSlots = timeSlots.sort((item1, item2) => {
    let d1 = item1['startTime'] ? new Date(item1['startTime']) : new Date();
    let d2 = item2['startTime'] ? new Date(item2['startTime']) : new Date();
    return d1 > d2 ? 1 : -1;
  });
  sortedTimeSlots.forEach((item)=> {
    let {
      identifier, startTime, duration
    } = item;
    let d = startTime ? new Date(startTime) : new Date();

    let date_str_no_year = d.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'});
    let iso_str = d.toISOString();
    // let date_str = d.toDateString();
    let time_str = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if(timeGroup.includes(date_str_no_year) == false) {
      // add the old time_elements if it has elements in it
      if(time_elements['elements'].length > 0) {
        elements_arr.push(time_elements);
      }

      // create new group, aka add new text row;
      elements_arr.push({
        "type": "text",
        "text": date_str_no_year
      })

      // reset time_elements
      time_elements = {
        "type": "horizontal",
        "elements": []
      }
      timeGroup.push(date_str_no_year);
    }

    let btn = {
      "type": "button",
      "title": time_str,
      "click": {
        "metadata": [
          {
            "type": "ExternalId",
            "id": identifier
          },
          {
            "type": "BusinessEvent",
            "timing": {
              "startTime": iso_str,
              "duration": duration
            }
          }
        ],
        "actions": [
          {
            "type": "publishText",
            "text": `${title}: ${date_str_no_year} ${time_str}`
          }
        ]
      }
    }
    time_elements['elements'].push(btn);
  })
  if(time_elements['elements'].length > 0) {
    elements_arr.push(time_elements);
  }
  baseObj['elements'] = elements_arr
  console.log('timePickerElements:', JSON.stringify(baseObj))

  return baseObj
}

const _getTimePickerMetaData = (timePicker) => {
  let source = timePicker['event'];
  let {
    timezoneOffset, identifier,
    title, location,
    timeSlots, images,
    receivedMessage, replyMessage
  } = source;

  let imagesDict = getImageDict(images);
  let metaObj = [];
  // location, timezone, title for BusinessEvent Object
  let businessEventObj = {
    "type": "BusinessEvent"
  };
  if(title) { businessEventObj['title'] = title; }

  // source timezone
  if(timezoneOffset != null) {
    businessEventObj['timing'] = {
      "presentedTimezoneOffset" : timezoneOffset
    }
  }
  // source location
  if(location) {
    businessEventObj['location'] = getLocation(location);
  }

  // received/reply Message for BusinessChatMessage Object
  let businessChatMessage = {
    "type": "BusinessChatMessage"
  }
  if(receivedMessage) {
    businessChatMessage['receivedMessage'] = getReceivedMessage(receivedMessage, imagesDict);
  }

  if(replyMessage) {
    businessChatMessage['replyMessage'] = getReplyMessage(receivedMessage, imagesDict);
  }

  metaObj.push(businessEventObj);
  metaObj.push(businessChatMessage);
  console.log('timePickerMeta:', JSON.stringify(metaObj))
  return metaObj;
}

module.exports = {
  getTimepicker
}
