#!/bin/bash

# add following to crontab -e
# PATH=/sbin:/bin:/usr/sbin:/usr/bin:/usr/local/bin
# SHELL=/bin/bash

# @reboot /opt/LivePersonNodeServer/on_reboot.sh

pm2="$(which pm2)";

cd /opt/LivePersonNodeServer/DeploymentAPI;
$pm2 start /opt/LivePersonNodeServer/DeploymentAPI/ecosystem.config.js;

