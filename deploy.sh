-#!/bin/sh
 sudo pkill "npm run start"
 sudo pkill node
 sudo npm install next@canary
 sudo npm ci
 sudo npm run build
 sudo rm -rf /home/koh_fabian/runNextTmp/.next
 sudo rm -rf /home/koh_fabian/runNextTmp/node_modules
 sudo rm /home/koh_fabian/runNextTmp/next.config.js
 sudo rm /home/koh_fabian/runNextTmp/package.json
 sudo cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/.next/ /home/koh_fabian/runNextTmp
 sudo cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/node_modules/ /home/koh_fabian/runNextTmp
 sudo cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/next.config.js /home/koh_fabian/runNextTmp
 sudo cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/package.json /home/koh_fabian/runNextTmp
 cd /home/koh_fabian/runNextTmp
 sudo nohup npm run start &> next.out &
