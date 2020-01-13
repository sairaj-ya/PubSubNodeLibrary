#!/bin/bash
CONNECTOR_WD=/opt/LivePersonNodeServer;

sudo cp -rf LPMessengerSDKBot/ $CONNECTOR_WD/LPMessengerSDKBot/;
sudo cp -rf LPAgentChatSDKBot/ $CONNECTOR_WD/LPAgentChatSDKBot/;
sudo cp -rf DeploymentAPI/ $CONNECTOR_WD/DeploymentAPI/;
