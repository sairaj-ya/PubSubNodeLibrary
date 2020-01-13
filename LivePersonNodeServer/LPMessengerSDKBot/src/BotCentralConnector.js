// const Agent = require('./../lib/AgentSDK');
const { Agent } = require('node-agent-sdk');
const request = require('request');
const ip = require('ip');
const async = require('async');
const AgentConfig = require('../config/AgentConfig');
const logger = require('../BotCentralLib/BotCentralLogging');
const BCAgent = require('../BotCentralLib/BotCentralWebSocket');

const api = require('../BotCentralLib/APIs');
const messagingUtil = require('./LPMessagingUtil');
const em = require('./ExternalMessageListener');
const evUtil = require('./eventHelper');
const rq = require('../BotCentralLib/RedisQueue').getRedisQueue();
const ms = require('../BotCentralLib/ConversationDataStore').getConversationDataStore();

const hc = require('../BotCentralLib/HTTP/httpConnector').getHTTPConnector();
const NodeMonitor = require('./NodeMonitor');

const LOG_HEADER = (funcName,meta) => {
  if(!meta) {
    return funcName;
  }
  return `[${funcName}][dialogId:${meta['dialogId']}][consumerId:${meta['consumerId']}]`;
}

const bc = new BCAgent();

class LPAgent extends Agent {
  constructor(AgentConfig) {
    super(AgentConfig);
    logger.info('BotCentral Agent conf:',AgentConfig);
    this.role = AgentConfig.role ? AgentConfig.role : 'ASSIGNED_AGENT';

    this.startUpFlag = true;
    this.startUpTimer = setTimeout(()=> {
      this.startUpFlag = false;
    }, AgentConfig.timersConfig.STARTUP_WAIT_TIMER);
    this.queuedMessages = {};
    this.queuedMessagesTimer = {};
    this.greetingsTimerArr = {};
    this.fallbackEscalation = {};
    this.messageIdMap = [];
    this.receivedUserMessage = {}
    this.init();
  }

  init() {
    this.on('connected', msg => {
      logger.info('[onConnect][connected]' + ' Bot Agent Id: ' + this.userId, msg);
      this.setAgentState({availability: "ONLINE"});
      let subObj = { 'convState': ['OPEN'] };
      // for manager role we listen to everything, otherwise we only listen to agent conv
      if(this.role != 'MANAGER') { subObj.agentIds = [this.agentId]; }
      this.subscribeExConversations(subObj, (e, resp) => logger.info('bot is online', AgentConfig.id || ''));
      this.subscribeRoutingTasks({});
      rq.setLPSocketStatus('connected');
      ms.setAgentId(this.userId);
    });

    this.on('error', err => {
      rq.setLPSocketStatus('error');
      logger.error('[onError]', err);
    });

    this.on('closed', data => {
      //rq.setLPSocketStatus('error');
      logger.info(`[onClose]`,data);
    });
    this.onRingAccepted();
    this.onUserConnected();
    this.onContentEvent();

    this.registerBCCallbacks();
  }

  registerBCCallbacks() {
    /**
     * Register callbacks for Botcentral websocket
     */
    bc.setOnMessageCallback(this.sendMessageToLP.bind(this));
    bc.setOnEscalationCallback(this.onEscalation.bind(this));
    bc.setOnTypingOnCallback(this.onTypingEvent.bind(this));
    bc.setOnTypingOffCallback(this.onTypingEvent.bind(this));
    bc.setOnEndConversation(this.onEndConversation.bind(this));
    bc.setOnCloseDialog(this.onCloseDialog.bind(this));
  }

  setAgentStatus(data) {
    const { status } = data;
    this.setAgentState({availability: status}, (e,res) => {
      if(e) { logger.error(e) } else { logger.info(res) }
    });
  }

  startFallbackEscalationTimer(dialogId) {
    if(dialogId && AgentConfig.misc.fallbackSkillId) {
      this.clearFallbackEscalationTimer(dialogId);
      this.fallbackEscalation[dialogId] = setTimeout(()=>{
        const escalateEventObj = evUtil.getEscalateEvent(dialogId, AgentConfig.misc.fallbackSkillId);
        const meta = ms.getMetaObjectFromDialogId(dialogId);
        this.updateConversationField( escalateEventObj, (e, resp) => {
          if(e) {
            logger.error(LOG_HEADER('onFallbackEscalation',meta),e);
          } else {
            logger.info(LOG_HEADER('onFallbackEscalation',meta), resp);
            api.notifyFallbackEscalation(meta['dialogId'], meta['consumerId']);
          }
        });
      }, AgentConfig.misc.fallbackEscalationTime);
    }
  }

  clearFallbackEscalationTimer(dialogId) {
    if(dialogId && this.fallbackEscalation[dialogId]) {
      clearTimeout(this.fallbackEscalation[dialogId]);
    }
  }

  sendMessageToLP(res) {
    let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
    if(!meta) { return; }
    let { dialogId, userType } = meta;
    this.clearFallbackEscalationTimer(dialogId);
    var lpObj = bc.convertMessage(res.message, userType);
    this.sendTransformedMessage(dialogId, lpObj, meta['consumerId']);
  }

  sendTransformedMessage(dialogId, lpObj, consumerId) {
    if(lpObj) {
      let {
        type, content, message, quickReplies, meta
      } = lpObj;

      if(type == 'luis') {
        this._sendLuisData(dialogId, content);
        return;
      }
      let eventObj = evUtil.getEvent(dialogId, lpObj);
      ms.addBCMessage(consumerId, lpObj);
      if(eventObj) {
        if(type == 'abc' || type == 'applePay') {
          this.publishEvent(eventObj, null, meta, (e, res) => {
            if(e) {
              logger.info(`[publishABC][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}][LP_logger.error]`, JSON.stringify(eventObj), meta, e);
            } else {
              logger.info(`[publishABC][type: ${type}][dialogId: ${dialogId}]`,JSON.stringify(eventObj), meta, res);
            }
          });
        } else {
          this.publishEvent(eventObj, (e, res) => {
            if(e) {
              logger.info(`[publishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}][LP_logger.error]`, JSON.stringify(eventObj), e);
            } else {
              logger.info(`[publishEvent][type: ${type}][dialogId: ${dialogId}][consumerId: ${consumerId}]`, JSON.stringify(eventObj), res);
            }
          });
        }
      }
    }
  }

  _sendLuisData(dialogId, content) {
    // for luis message, we need to take special care
    for(let i =0; i< content.length; i++) {
      setTimeout((obj)=>{
        if(obj.type == 'text') {
          let ev = evUtil.getPlainTextEvent(dialogId, obj.payload);
          // LOG(`[publishEvent][type: luis][dialogId: ${dialogId}]`, ev);
          this.publishEvent(ev, (e, res) => {
            if(e) { logger.error(`[publishEvent][type: luis][dialogId: ${dialogId}]`, e); }
          });
        }
        if(obj.type == 'rich') {
          let ev = evUtil.getRichContentEvent(dialogId, obj.payload);
          this.publishEvent(ev, (e, res) => {
            if(e) { logger.error(`[publishEvent][type: luis][dialogId: ${dialogId}]`, e); }
          });
        }
      }, 500, content[i]);
    }
  }

  getUserProfileInfo(dialogId, consumerId, callback) {
    console.log('agent Id', this.agentId);
    if(this.role == 'MANAGER') { consumerId = consumerId.split(':::')[1]; }
    try {
      this.getUserProfile(consumerId,  (e, res) => {
        if(e) {
          logger.error(`[getUserProfileInfo][consumerId:${consumerId}]`,e)
          callback(e);
        } else {
          if(res) {
            ms.updateKey(dialogId, 'lpUserInfoList', res);
            // special case for google grbm
            for(var i = 0; i < res.length; i++) {
                let item = res[i];
                if(item['type'] == 'ctmrinfo' && item['info'] && item['info']['companyBranch'] == 'grbmIncoming') {
                  ms.updateKey(dialogId, 'userType', 'grbmIncoming');
                }
            }
          }
          callback();
        }
      })
    } catch(err) {
      callback(err);
    }
  }

  onUserConnected(cb) {
    // Notification on changes in the open consversation list
    this.on('cqm.ExConversationChangeNotification', notificationBody => {
      notificationBody.changes.forEach(change => {
        let dialogId = change.result.convId;
        let stepUpOccured = false;
        if (change.type === 'UPSERT' && (!ms.containDialogId(dialogId) || this.isStepUp(change))) {

          if(this.isStepUp(change)) {
            stepUpOccured = true;
          }
          logger.info(`[onUserConnected][dialogId: ${dialogId}]`, change);
          // let skillId = change.result.conversationDetails.skillId;
          if(this.role == 'MANAGER' && !messagingUtil.getRole(change.result.conversationDetails, this.agentId)) {
            this.joinConversation(change.result.convId, this.role);
          }
          // new conversation for me
          ms.addToMetaStore(dialogId, {});
          const consumerId = change.result.conversationDetails.participants.filter(p => p.role === "CONSUMER")[0].id;
          if (consumerId) {
            this.setConversationDetails(dialogId, change.result.conversationDetails);
            change.result.conversationDetails.participants.forEach(p => {
              if (p.role === 'CONSUMER') {
                let userId = p.id;
                if(this.role == 'MANAGER') { userId = "MANAGER:::"+userId; }
                ms.addUserToDialogPair(userId, dialogId);
                ms.updateKey(dialogId, 'consumerId', userId);
                logger.info(`[onUserConnected][ACCEPTED][dialogId:${dialogId}][consumerId::${userId}]`);
                rq.addMessageToRedis(`CONSUMERINFO::${userId}`, JSON.stringify({
                  'appName' : AgentConfig.appName,
                  'consumerId' : userId,
                  'dialogId' : dialogId,
                  'hostname' : ip.address()
                }));

                if(AgentConfig.misc.botcentralConnectionType == "REDIS") {
                  rq.initializeUserQueue(userId);
                }

                // get user info if it's a new user
                if(!ms.getByKey(dialogId, 'lpUserInfoList')) {
                  async.parallel([
                    callback => {
                      this.getUserProfileInfo(dialogId, userId, (err)=> {
                        if(err) {
                          logger.error(`[onUserConnected][getUserProfileInfo]`, err)
                          callback(err);
                        } else if(this.startUpFlag == false) {
                          this.setGreetingsTimer(dialogId, stepUpOccured);
                          callback(null);
                        }
                      });
                    },
                    callback => {
                      this.csdsClient.getAll((err, domains) => {
                        if(err) { callback(err); return };
                        const url = `https://${domains.msgHist}/messaging_history/api/account/${AgentConfig.accountId}/conversations/search`;
                        messagingUtil.getPreviousSkill(url, dialogId, (err, previousSkillId) => {
                          if(err) {
                            callback(err)
                          } else {
                            let chatInfo = ms.getByKey(dialogId, 'lpChatInfo');
                            if(chatInfo) {
                              chatInfo['previousSkillId'] = previousSkillId;
                              ms.updateKey(dialogId, 'lpChatInfo', chatInfo);
                            }
                            callback(null);
                          }
                        })
                      })
                    }],
                    (err, results) => {
                      if(err) {
                        logger.error(err);
                      }
                    }
                  )
                }
              }
            });
            this.subscribeMessagingEvents({dialogId: dialogId});
          }
        } else if (change.type === 'DELETE') {
          logger.info(`[onUserConnected][DELETE][dialogId:${dialogId}]`);
          // conversation was closed or transferred
          ms.removeFromMetaStore(dialogId);
        }
      });
    });
  }

  onRingAccepted() {
    // Accept any routingTask (==ring)
    this.on('routing.RoutingTaskNotification', body => {
      try {
        body.changes.forEach(c => {
          if (c.type === "UPSERT") {
            c.result.ringsDetails.forEach(r => {

              if (r.ringState === 'WAITING') {
                logger.info(`[onRingAccepted][WAITING] :`, body);
                setTimeout(() => {
                  this.updateRingState({
                    "ringId": r.ringId,
                    "ringState": "ACCEPTED"
                  }, (e, resp) => {
                      if(e) {
                        logger.error('[onRingAccepted][WAITING]', e)
                      }
                  });
                }, AgentConfig.misc.ringAcceptWait);
              } else if(r.ringState == 'ACCEPTED') {
                let dialogId = c.result.conversationId;
                let userId = c.result.consumerId;
                logger.info(`[onRingAccepted][ACCEPTED][dialogId:${dialogId}][consumerId::${userId}]`);
              }
            });
          }
        });
      } catch(e) {
        logger.error(`[onRingAccepted][exception]`, e)
      }
    });
  }

  onContentEvent() {
    // Echo every unread consumer message and mark it as read
    this.on('ms.MessagingEventNotification', body => {
      const respond = {};
      body.changes.forEach(c => {
        // In the current version MessagingEventNotification are recived also without subscription
        // Will be fixed in the next api version. So we have to check if this notification is handled by us.
        if (ms.containDialogId(c.dialogId)) {
          // add to respond list all content event not by me
          if (c.event.type === 'ContentEvent' && c.originatorId !== this.agentId) {
            respond[`${body.dialogId}-${c.sequence}`] = {
              dialogId: body.dialogId,
              sequence: c.sequence,
              message: c.event.message,
              metadata : c.metadata,
              event: c.event,
              serverTimestamp: c.serverTimestamp,
              originatorMetadata : c.originatorMetadata,
              eventId : c.eventId,
              role: c.originatorMetadata.role,
              originatorId : c.originatorId,
              originatorClientProperties: c.originatorClientProperties
            };
          }
          // remove from respond list all the messages that were already read
          if (c.event.type === 'AcceptStatusEvent' && c.originatorId === this.agentId) {
            c.event.sequenceList.forEach(seq => {
              delete respond[`${body.dialogId}-${seq}`];
            });
          }
        }
      });


      let messageItem = null;
      let cvs = [];
      Object.keys(respond).forEach(key => {
        let contentEvent = respond[key];
        this.publishEvent({
          dialogId: contentEvent.dialogId,
          event: {
            type: "AcceptStatusEvent", status: "READ", sequenceList: [contentEvent.sequence]
          }
        });
        cvs.push(contentEvent);
      });

      cvs.sort((o1,o2) => {
        return o1 - o2
      })

      // cvs.forEach( o => console.log(o.role, o.sequence, o.event))

      for(let i = cvs.length - 1; i >= 0; i--) {
        let item = cvs[i];
        if(AgentConfig.misc.skipAgentMessage == false) {
          // assigned agent answered before the user, break out of loop
          if(item.message  && item.role == 'ASSIGNED_AGENT') {
            break;
          }
        }
        if(item.message  && item.role == 'CONSUMER') {
          // agent didn't answer before user's last message
          messageItem = item;
          break;
        }
      }

      if(messageItem) {
        const key = `${messageItem['dialogId']}-${messageItem['sequence']}`;
        if(this.messageIdMap.includes(key)) {
          logger.info(`ALREADY_SEEN_MESSAGE`, key);
          return;
        }
        this.messageIdMap.push(key);
        if(this.messageIdMap.length >= 500) {
            this.messageIdMap.shift();
        }

        if(AgentConfig.webhook.externalWebhookUrl) {
          hc.postToWebhook(messagingUtil.getHTTPMessage(messageItem));
          return;
        }
        
        if (messageItem.message.fileType != null) {
          this._generateUrlAndSend(messageItem);
        } else {
          this._sendToBC(messageItem);
        }
      }
    });
  }

  _generateUrlAndSend(messageItem){
    this.csdsClient.getAll((err, val) => {
      if (err) {
        logger.info(`Error while getting all the csds clients, ${JSON.stringify(err)}`);
        messageItem.message = this._buildEmptyMessageObject();
        this._sendFileToBC(messageItem);
      }else{
        const domain = "https://" + val.swift;
        this.generateDownloadURL(messageItem.message.relativePath, (e, res) => {
          if (e && e.code === 500) {
            logger.error(`Error while generating the download URL, ${JSON.stringify(e)}`);
            messageItem.message = this._buildEmptyMessageObject();
            this._sendFileToBC(messageItem);
          }else{
            logger.info(`File Type MessageItem before building the file message: ${JSON.stringify(messageItem.message)}`);
            try{
              let message = {};
              message.caption = messageItem.message.caption==null || messageItem.message.caption.trim()==''? '__EMPTYTEXT__': messageItem.message.caption;
              message.fileType = messageItem.message.fileType;
              message.status = AgentConfig.fileStatus.inProg;
              message.fileOperation = AgentConfig.fileOperation.swift_to_brand;
              message.swiftInfo = {};
              message.swiftInfo.domain = domain;
              message.swiftInfo.relativePath = messageItem.message.relativePath;
              message.swiftInfo.tempSign = res.queryParams.temp_url_sig;
              message.swiftInfo.tempExpiry = res.queryParams.temp_url_expires;
              messageItem.message = message;
              logger.info(`File Type MessageItem After building the file message: ${JSON.stringify(messageItem.message)}`);
              this._sendFileToBC(messageItem);
            }catch(e) {
              logger.error(`Error while building the message Object, ${JSON.stringify(e)}`);
              messageItem.message = this._buildEmptyMessageObject();
              this._sendFileToBC(messageItem);
            }
          }
        });
      }
    });
  }

  _buildEmptyMessageObject(){
    let message = {};
    message.caption = '__EMPTYTEXT__';
    message.fileType = '';
    message.status = '';
    message.fileOperation = '';
    message.swiftInfo = {};
    message.swiftInfo.domain = '';
    message.swiftInfo.relativePath = '';
    message.swiftInfo.tempSign = '';
    message.swiftInfo.tempExpiry = '';
    return message;
  }

  _sendFileToBC(lastItem) {
    let { originatorId, dialogId, message } = lastItem;
    ms.addLPMessage(originatorId, lastItem);
    this.receivedUserMessage[dialogId] = true;
    if (this.greetingsTimerArr[dialogId]) {
      clearTimeout(this.greetingsTimerArr[dialogId]);
      delete this.greetingsTimerArr[dialogId];
    }
    let meta = ms.getMetaObjectFromDialogId(dialogId);
    if (!meta) {
      return;
    }
    let consumerId = meta['consumerId'];
    meta['mid'] = `${dialogId}-${lastItem.sequence}`;
    bc.sendMessage(message, meta);
  }

  generateDownloadURL(path, callback) {
    this.generateURLForDownloadFile({
        relativePath: path
    }, (e, res) => {
        callback(e, res);
    });
  }

  _sendToBC(lastItem) {
    let { originatorId, dialogId, message } = lastItem;
    ms.addLPMessage(originatorId, lastItem);
    this.receivedUserMessage[dialogId] = true;
    if(this.greetingsTimerArr[dialogId]) {
      clearTimeout(this.greetingsTimerArr[dialogId]);
      delete this.greetingsTimerArr[dialogId];
    }

    if(typeof message === 'string' || message instanceof String) {
      if(message == '__APPLEPAY_SUCCESS__'
      || message == '__APPLEPAY_FAILURE__'
      || message == AgentConfig.defaultMsg.defaultStepupMessage) {
        // user entered __APPLEPAY_SUCCESS__ or system keyword, ignore...
        return;
      }
      if(lastItem.metadata) {
        let meta = lastItem.metadata.filter((item)=> item.type === 'ConnectorPaymentResponse');
        if(meta.length === 1) {
          message = '__APPLEPAY_SUCCESS__';
          if(meta[0].status === false) {
              message = '__APPLEPAY_FAILURE__';
          }
        }
      }
      logger.info(`[contentEvent][dialogId:${dialogId}][consumerId:${originatorId}]: Message: ${message==undefined || message==null || message.trim()==''? '':message.substring(0, Math.min(AgentConfig.maskedMessageLength, message.length))}`);  //: ${message}`) /* Commented to align with security constraints */
      this._processAndSendMessage(dialogId, message, lastItem.sequence);
    } else {
      bc.sendImageMsg(ms.getMetaObjectFromDialogId(dialogId));
    }
  }

  _processAndSendMessage(dialogId, message, sequence) {
    let meta = ms.getMetaObjectFromDialogId(dialogId);
    if(!meta) {return;}
    let consumerId = meta['consumerId'];
    meta['mid'] = `${dialogId}-${sequence}`;
    let reg = /\(\d{1}\/\d{1}\)/
    let vm = this;

    // message is not segmented by the cell provider, jsut send as-is
    if(!message.match(reg)) {
       if(consumerId in this.queuedMessages) {
           this.queuedMessages[consumerId].push(message);
       } else {
           this.queuedMessages[consumerId] = [message];
       }

       if(consumerId in this.queuedMessagesTimer) { clearTimeout(this.queuedMessagesTimer[consumerId]) }

       this.queuedMessagesTimer[consumerId] = setTimeout(function(message, meta) {
         let consumerId = meta['consumerId'];
         delete vm.queuedMessages[consumerId];
         delete vm.queuedMessagesTimer[consumerId];
         vm.startFallbackEscalationTimer(dialogId);
         bc.sendMessage(message.join(' '), meta)
       }, AgentConfig.misc.messageDelay, this.queuedMessages[consumerId], meta);

    } else {
      // message is segmented by the cell provider, need special conditioning
      let parsedMsg = message.slice(message.match(reg).index+5);
      if(consumerId in this.queuedMessages) {
          this.queuedMessages[consumerId].push(parsedMsg);
      } else {
          this.queuedMessages[consumerId] = [parsedMsg];
      }
      let sequence = message.match(reg)[0].replace('(','').replace(')','').split('/');

      let forwardMsg = this.queuedMessages[consumerId];
      if(consumerId in this.queuedMessagesTimer) { clearTimeout(this.queuedMessagesTimer[consumerId]) }

      if(parseInt(sequence[0]) == parseInt(sequence[1])) {
         delete this.queuedMessages[consumerId];
         delete this.queuedMessagesTimer[consumerId];
         logger.info('[queuedMessages][forwardMsg]', forwardMsg);
         vm.startFallbackEscalationTimer(dialogId);
         bc.sendMessage(forwardMsg.join(' '), meta);
      } else {
         this.queuedMessagesTimer[consumerId] = setTimeout(function(message, meta) {
           let consumerId = meta['consumerId'];
           delete vm.queuedMessages[consumerId];
           delete vm.queuedMessagesTimer[consumerId];
           logger.info('[queuedMessages][chunkedMessage]', message);
           vm.startFallbackEscalationTimer(dialogId);
           bc.sendMessage(forwardMsg.join(' '), meta)
         }, 5000, forwardMsg, meta);
      }
    }
  }

  isStepUp(c) {
    let dialogId = c.result.convId;
    if(!ms.containDialogId(dialogId)) {
      return false;
    }
    const newConsumerId = c.result.conversationDetails.participants.filter(p => p.role === "CONSUMER")[0].id;
    let metaObj = ms.getMetaObjectFromDialogId(dialogId);
    let newMeta = metaObj['consumerId'].split(":::");
    if (metaObj['consumerId'] == newConsumerId || (newMeta.length>1 && newMeta[1] === newConsumerId)) {
      return false;
    }
    return true;
  }

  setConversationDetails(dialogId, convDetails) {
    if(convDetails && convDetails.context) {
      let contextType = convDetails.context.type;
      if(convDetails.context.name && (convDetails.context.name == "RCS Business Messaging" || convDetails.context.name.toLowerCase().includes("rcs"))) {
        contextType = 'grbmIncoming';
      }
      ms.updateKey(dialogId, 'userType', contextType);
      let chatInfo = ms.getByKey(dialogId, 'lpChatInfo');
      if(!chatInfo) {
        chatInfo = messagingUtil.getChatInfo(convDetails);
        ms.updateKey(dialogId, 'lpChatInfo', chatInfo);
      }
      if(this.transport && this.transport.configuration && this.transport.configuration.token) {
        chatInfo['BearerToken'] = this.transport.configuration.token;
        ms.updateKey(dialogId, 'lpChatInfo', chatInfo);
      }
    }
  }

  setGreetingsTimer(dialogId, stepUpOccured) {
    this.greetingsTimerArr[dialogId] = setTimeout(()=> {
      let meta = ms.getMetaObjectFromDialogId(dialogId);
      if(stepUpOccured) {
        bc.sendMessage(AgentConfig.defaultMsg.defaultStepupMessage, meta);
      } else {
        if(AgentConfig.misc.disableGreetings == false
          && !this.receivedUserMessage[dialogId]) {
          bc.sendMessage(AgentConfig.defaultMsg.defaultGreetingMessage, meta);
        }
      }
    }, 3000);
  }

  joinConversation (conversationId, role, announce) {
      if (!/^(READER|MANAGER|ASSIGNED_AGENT)$/.test(role)) {return false}
      this.updateConversationField(
        evUtil.getParticipantChangeEvent(conversationId, 'ADD', role), (e, resp) => {
          if (e) { logger.error(`[joinConversation][dialogId:${conversationId}] ${JSON.stringify(e)}`) }
      });
  };

  onTypingEvent(res) {
    let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
    if(!meta) { return; }
    let state = '';
    if(res.sender_action == 'typing_on')  { state = 'COMPOSING' }
    else if(res.sender_action == 'typing_off') { state = 'PAUSE' }
    else { return; }
    this.publishEvent(evUtil.getTypingEvent(meta['dialogId'], state));
  }

  onEndConversation(res) {
    let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
    if(!meta) {return;}
    this.clearFallbackEscalationTimer(meta['dialogId']);
    this.updateConversationField(evUtil.getEndConvEvent(meta['dialogId']), (e,res) => {
      if(e) {
        logger.error(LOG_HEADER('onEndConversation',meta), e);
      } else {
        logger.info(LOG_HEADER('onEndConversation',meta), res);
        bc.sendResetMsg(meta);
      }
    });
  }

  onCloseDialog(res) {
    let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
    if(!meta) {return;}
    this.clearFallbackEscalationTimer(meta['dialogId']);
    let reason = 'random reason';
    let closeDialogObj = evUtil.getCloseDialogEvent(meta['dialogId'], reason)
    this.updateConversationField(closeDialogObj, (e,res) => {
      if(e) {
        logger.error(LOG_HEADER('onCloseDialog', meta), e, JSON.stringify(closeDialogObj), res)
      } else {
        logger.info(LOG_HEADER('onCloseDialog', meta), res);
        bc.sendResetMsg(meta);
      }
    });
  }

  onEscalation(res) {
    let meta = ms.getMetaObjectFromConsumerId(res.recipient.id);
    if(!meta) { return; }
    this.clearFallbackEscalationTimer(meta['dialogId']);
    let { agentSkillId, agentSkillName, agentId } = res;
    setTimeout(() => {
      try {
        const escalateEventObj = evUtil.getEscalateEvent(meta['dialogId'], agentSkillId, agentId);
        console.log('escalateEventObj', escalateEventObj);
        this.updateConversationField(escalateEventObj, (e, resp) => {
          delete this.receivedUserMessage[meta['dialogId']];
          if(e) {
            logger.error(LOG_HEADER('onEscalation', meta), e);
            // we don't send this for 400 errors since it means something is wrong
            // from the client side.
            if(!e["code"] || e["code"] != 401 ) {
              bc.sendEscalationFailMsg();
              api.notifyEscalationFail(meta['dialogId'], meta['consumerId']);
            }
          } else {
            logger.info(LOG_HEADER('onEscalation', meta), resp);
            bc.sendResetMsg(meta);
            api.notifyEscalation(meta['dialogId'], meta['consumerId']);
          }
        });
      } catch(e) {
        logger.error(LOG_HEADER('onEscalation', meta), e);
      }
    }, 500);
  }
}

const lpAgent = new LPAgent(AgentConfig);
const nodeMonitor = new NodeMonitor(lpAgent);
em.initProcessListeners(lpAgent);
