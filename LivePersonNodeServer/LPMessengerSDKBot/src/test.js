const path = require('path');
const fs = require('fs');
const request = require('request');

const dest = path.resolve(__dirname, 'tempFile231.JPEG');
const url = `https://qa-objectstorage.dev.lprnd.net/v1/AUTH_async-images/le86402388/152a83517530646d14940cf4473025aea48fea2e7c571c7d82bc1f9be2c7be07_uuid_ec375f7b-40fe-4321-82af-7702a1627c17_10-09-2019_20-51-06-776.JPEG?temp_url_sig=e33d28662296c67af9ebd6f55abd8d0efa7158f3&temp_url_expires=1568163077`;
console.log('download started', url);
    const file = fs.createWriteStream(dest);
    const sendReq = request.get(url);
    console.log(JSON.stringify(sendReq));
    sendReq.on('response', (response) => {
      console.log(response.body);
      if (response.statusCode !== 200) {
        console.log('Response status was ' + response.statusCode);
      }
      console.log('download going on...');
      sendReq.pipe(file);
    });
    // close() is async, call cb after close completes
    file.on('finish', () => file.close((e, res) => {
      console.log(e);
    })
    );

    // check for request errors
    sendReq.on('error', (err) => {
      console.log('error', err);
      fs.unlink(dest);
      return callback(err.message);
    });

    file.on('error', (err) => { // Handle errors
      fs.unlink(dest, (err) => {
        if (err)
          console.log('Error while deleting the following file: ' + dest);
        else
          console.log('Deleted the following file: ' + dest);
      }); // Delete the file async. (But we don't check the result)
      return callback(err.message);
    });

// const file = path.resolve(__dirname,'lp-logo1.jpeg');
//   const url = `https://qa-objectstorage.dev.lprnd.net/v1/AUTH_async-images/le86402388/le86402388.3627726210_uuid_2aba93b8-f03f-402d-8d67-217b3c7d20d8_09-09-2019_20-31-13-296.JPEG?temp_url_sig=74c77c382bf5a98d66575212b84017a359670c42&temp_url_expires=1568075593`;
//     console.log(url);
//     fs.createReadStream(file).pipe(request.put(url, (err, response) => {
//       if (err) {
//         console.log('Error uploading file', err);
//       } else {
//         console.log('Successfully uploaded file', response.body);
//       }
//     }));