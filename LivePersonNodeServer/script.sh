#!/bin/bash


# CONNECTOR_WD=/liveperson/code/
CONNECTOR_WD=/opt/
echo "Install pm2";
npm install -g pm2;
pm2 install pm2-logrotate;

echo "Started DeploymentAPI installation";
cd $CONNECTOR_WD/LivePersonNodeServer/DeploymentAPI;
npm install;
pm2 start ecosystem.config.js
echo "Finished starting DeploymentAPI";

echo "Started LPMessengerSDK installation";
cd $CONNECTOR_WD/LivePersonNodeServer/LPMessengerSDKBot;
npm install;
echo "Finished setting up LPMessengerSDK";

echo "Started LPAgentChatSDK installation";
cd $CONNECTOR_WD/LivePersonNodeServer/LPAgentChatSDKBot;
npm install;
echo "Finished setting up LPAgentChatSDK";

echo "Started SDE-Server installation";
cd $CONNECTOR_WD/LivePersonNodeServer/sde-server;
npm install;
echo "Finished setting up SDE-server";


echo "Started CAO SDK installation";
cd $CONNECTOR_WD/LivePersonNodeServer/cao-sdk/node-strophe;
npm install;
cd $CONNECTOR_WD/LivePersonNodeServer/cao-sdk/;
npm install;
npm run build;
echo "Finished setting up cao sdk";
