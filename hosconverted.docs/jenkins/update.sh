#!/bin/bash -e
#
# This script generates updates the active branches
#
echo 'running documentation/jenkins/update.sh'
rm -f ${SERVERS_DIR}/*/active
git branch -r | while read BRANCH ROL
do
  ./jenkins/source.sh "${BRANCH}"
done
exit 0
