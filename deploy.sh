-#!/bin/sh
 sudo pkill "npm run start"
 sudo pkill node
 sudo npm ci
 sudo npm run build
 rm -rf /home/koh_fabian/runNextTmp/.next
 rm -rf /home/koh_fabian/runNextTmp/node_modules
 sudo mv /var/lib/jenkins/workspace/vms-ac-ui-next/.next/ /home/koh_fabian/runNextTmp
 sudo mv /var/lib/jenkins/workspace/vms-ac-ui-next/node_modules/ /home/koh_fabian/runNextTmp
 sudo mv /var/lib/jenkins/workspace/vms-ac-ui-next/next.config.js /home/koh_fabian/runNextTmp
 sudo mv /var/lib/jenkins/workspace/vms-ac-ui-next/package.json /home/koh_fabian/runNextTmp
 cd /home/koh_fabian/runNextTmp
 sudo nohup npm run start &> next.out &
