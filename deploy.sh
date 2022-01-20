-#!/bin/sh
 sudo npm ci
 sudo npm run build
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/.next/ /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/node_modules/ /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/next.config.js /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/package.json /home/koh_fabian/runNextTmp
 cd /home/koh_fabian/runNextTmp
 pkill "npm run start"
 pkill node
 nohup npm run start &> next.out &
 exit      
EOF
