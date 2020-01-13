# Node Connector Server  

### Content
- Messenger SDK  
- Chat SDK  
- Deployment Server  


## Environment Setup  

### Install NVM (https://github.com/creationix/nvm)
Follow the instructions and install nvm, along with the specified node version. Verify correct node version by running `node -v` and `npm --version`  
`CURRENT NODE VERSION: v9.11.04`
- `wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash`
- `nvm ls-remote`  
- `nvm install v9.11.2`  



### Install PM2(http://pm2.keymetrics.io/)  
PM2 is a process manager that will be used to perform all CRUD operations on the nodes. After installing the nvm and node, run `npm install -g pm2`, then after installing pm2, start the God Daemon by running `pm2 start`.  

## Initialize the services  
To initialize the services:  
- Navigate to **DeploymentAPI** folder, run `npm install`  
- Navigate to **LPAgentChatSDKBot** folder, run `npm install`  
- Navigate to **LPMessengerSDKBot** folder, run `npm install`  

After all installations are complete, go to **DeploymentAPI** folder and run `pm2 start ecosystem.config.js`. Verify that the DeploymentAPI is up and running by running the command `pm2 list`, the DeploymentAPI should in the process list.  


## Debugging  
**TODO**  


Main commands:   
Start the God Daemon: `pm2 start`  
View all running nodes: `pm2 list`  
Start a node: `pm2 start <id>`  
Stop a node: `pm2 stop <id>`  
Re-start a node: `pm2 reload <id>`  
View the logs: `pm2 logs <id>`  
Other: `pm2 help`  
