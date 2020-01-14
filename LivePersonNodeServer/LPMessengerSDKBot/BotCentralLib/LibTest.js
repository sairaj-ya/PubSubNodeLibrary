
const cbPS = require('./CBPubSubService');

const pubSub = new cbPS();

pubSub.startCBConnection('dev', (err, isSuc)=>{
    if(err){
        console.log(`error while starting the cb`);
    }else{
        console.log(`successfully connected`);
        console.log(pubSub.cbConnectionStatus());
        pubSub.stopCBConnection((err, isSuc)=>{
            if(err){
                console.log(`error while stopping the cb`);
            }else{
                console.log(`successfully stopped`);
                console.log(pubSub.cbConnectionStatus());
            }
        });
    }
});



