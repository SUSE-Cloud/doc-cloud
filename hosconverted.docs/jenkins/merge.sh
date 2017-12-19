#!/bin/bash
#
# This script merges master to all the branches
#

echo 'running documentation/jenkins/merge.sh'

git branch -r | grep -v origin/HEAD | grep -v origin/develop | grep -v origin/master |
while read BRANCH ROL
do
  BRANCH=$(echo ${BRANCH} | sed -s 's,origin/,,')
  echo "##### ${BRANCH} #####"
  git checkout -b "${BRANCH}" || git checkout -f "${BRANCH}"
  git reset HEAD || true
  git pull origin "${BRANCH}"
  git merge origin "${BRANCH}" || true
  git push origin "${BRANCH}" || true
done
exit 0
