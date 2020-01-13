const logger = require('./BotCentralLogging');
const server = require('http').createServer();
const rq = require('./RedisQueue').getRedisQueue();
const io = require('socket.io');
const consumerId = "chuchuchu";
const botId = "b938651c1029d934b3d1d7da186070aae2550a5e";

rq.listenForBotResponseQueue((err, msg) => {
  if(!err) {
    logger.info("botRes", msg);
  } else {
    logger.error(err);
  }
})

server.listen(3500);
var listener = io.listen(server);
listener.sockets.on('connection', function(socket){
    socket.on('message', function(data){
        logger.info(data);
        rq.initializeUserQueue(consumerId);
        rq.sendToUserMessageQueue(data);
    });
});



let getSampleJSON = (msg) => {
  return {
    "object": "page",
    "entry": [
      {
        "id": "bd2b84ab-8e20-429b-a7fa-0a0acc798253-0",
        "messaging": [
          {
            "conversationId": "bd2b84ab-8e20-429b-a7fa-0a0acc798253",
            "sender": {
              "id": consumerId
            },
            "recipient": {
              "id": botId
            },
            "source": "lp_web",
            "message": {
              "mid": "mid.1560382818686:bd2b84ab-8e20-429b-a7fa-0a0acc798253-0",
              "text": msg
            }
          }
        ]
      }
    ]
  }
}
