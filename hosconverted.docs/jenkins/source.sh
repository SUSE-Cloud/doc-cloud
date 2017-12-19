#!/bin/bash -e
#
# This script prepares the source for a branch
#

echo 'running documentation/jenkins/source.sh'
export TERM=xterm-256color
source "$HOME/.rvm/scripts/rvm"
rvm use ruby-1.9.2-p320@docs
CD=$(pwd)

SERVERS_DIR=$(pwd)/servers
mkdir -p ${SERVERS_DIR} 2>/dev/null || true
for BRAN
in "$1"
do
  BRANCH=$(echo ${BRAN} | sed -s 's,origin/,,')
  if [ "${BRANCH}" == "HEAD" ]
  then
    BRANCH="master"
  fi
  echo "##### ${BRANCH} #####"
  if [ "${BRANCH}" == "master" ]
  then
    echo "No update for ${BRANCH}"
    continue
  fi
  
  cd ${SERVERS_DIR}
  DIR=${SERVERS_DIR}/$(echo ${BRANCH} | sed -e 's,/,_,g')
  echo "###### ${DIR} docs.hpcloud.com repo ######"
  if [ ! -d ${DIR} ]
  then
    rm -rf docs.hpcloud.com
    git clone git@git.hpcloud.net:DevExDocs/docs.hpcloud.com.git
    mv docs.hpcloud.com "${DIR}"
    cd "${DIR}"
    git checkout master
    git pull origin master
    mkdir -p content
  else
    cd "${DIR}"
    git checkout -f master >/dev/null 2>/dev/null
    git pull origin master >/dev/null
  fi
  cd "${DIR}/content"
  rm -rf documentation
  git clone git@git.hpcloud.net:DevExDocs/documentation.git
  cd documentation
  git checkout -b "${BRANCH}" "origin/${BRANCH}"
  git pull
  cp -f _config.yml "${DIR}/_config.yml"
  cd "${DIR}/content"
  rm -rf apihome
  git clone git@git.hpcloud.net:DevExDocs/apihome.git
  cd apihome
  git checkout develop
  git pull origin develop
  cd "${DIR}"
  sed -i -e "s,Sign Up Now,${BRANCH}," _layouts/default.html
  sed -i -e "s,Sign Up Now,${BRANCH}," _layouts/page.html
  ./jenkins/build.sh
  git checkout _layouts/default.html
  git checkout _layouts/page.html
  cd ${SERVERS_DIR}
  touch "${DIR}/active"
  cd "$CD"
  ./jenkins/sync.sh "$DIR"
done
  
exit 0
