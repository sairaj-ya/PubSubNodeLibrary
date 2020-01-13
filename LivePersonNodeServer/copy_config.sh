#!/bin/bash
CONNECTOR_WD=/opt/LivePersonNodeServer

# cd $CONNECTOR_WD;
echo "setting SELECTED_REGION as $1";
cp -rf config.js config_temp.js;
sed -i -e "s/SELECTED_REGION/$1/" config_temp.js;
cp config_temp.js DeploymentAPI/config.js;
cp config_temp.js LPAgentChatSDKBot/BotCentralLib/config.js;
cp config_temp.js LPMessengerSDKBot/config/HostConfig.js;
cp config_temp.js sde-server/config.js
rm config_temp.js;
rm config_temp.js-e;
echo "finished setting up config.js";
