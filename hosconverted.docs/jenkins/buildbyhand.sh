#!/bin/bash -e


export TERM=xterm-256color
source "$HOME/.rvm/scripts/rvm"
rvm use ruby-1.9.2-p320@docs

 
 echo '=git================================================================='
 git checkout -f master
 git pull origin master

 echo '=content============================================================='
 ./jenkins/documentation.sh development
 #./jenkins/documentation.sh rename-test

 cp -r ./content/documentation/publiccloud/apidocs/* ./content/api/



 echo '=build==============================================================='
 ./jenkins/clean.sh

 chmod 777 ./jenkins/makeTOC.sh
 ./jenkins/makeTOC.sh

 ./jenkins/build.sh
  
  echo "copy start"
  sudo rm -r /var/www/*
  sudo cp -r /home/jenkins/DevExBuild/workspace/docs-emergency-build/_site/* /var/www/

  echo "copy stop"
