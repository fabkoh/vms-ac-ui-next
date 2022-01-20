-#!/bin/sh
 npm ci
 npm run build
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/.next/ /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/node_modules/ /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/next.config.js /home/koh_fabian/runNextTmp
 cp -r /var/lib/jenkins/workspace/vms-ac-ui-next/package.json /home/koh_fabian/runNextTmp
 npm run start
 exit      
EOF
