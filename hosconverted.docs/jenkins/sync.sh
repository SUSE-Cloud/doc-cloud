#!/bin/bash -e
#
# This script selects a ports and updates the web sites
#

echo 'running documentation/jenkins/sync.sh'
SERVERS_DIR=$(pwd)/servers
mkdir -p ${SERVERS_DIR} || true
cd "${SERVERS_DIR}"

#
# Next available port
#
AVAIL_FILE=".avail"
echo "4001 4002 4003 4004 4005 4006 4007 4008 4009 4010 4011 4012 4013 4014 4015 4016 4017 4018 4019 4020 4021 4022 4023 4024" >${AVAIL_FILE}
available_remove() {
   sed -i -e "s/${1}//g" ${AVAIL_FILE}
}

#
# Loop through the current port files and see what is available
#
for file in */port
do
  if [ -f "${file}" ]
  then
    PORT=$(cat "${file}")
    available_remove "${PORT}"
  fi
done
AVAILABLE=$(cat ${AVAIL_FILE})

#
# Assign ports to anyone in need
#
USER=jenkins
HOST=15.184.32.138
DEST=/var/www/
DOCS=/var/www/docs
DIR="$(basename $1)"
cd "${SERVERS_DIR}/${DIR}"
if [ -f port ]
then
  PORT=$(cat port)
  echo "**** ${DIR} active ${PORT} ****"
else
  echo "**** ${DIR} active needs port ****"
  read PORT ROL <<<"$AVAILABLE"
  AVAILABLE=${ROL}
  echo ${PORT} >port
fi
cd _site
rsync --del -av . ${USER}@${HOST}:${DOCS}/${PORT}

#
# Start the main index
#
INDEX="${SERVERS_DIR}/index.html"
echo "<title>Docs QA Server</title>" >${INDEX}
echo "<h1>Docs QA Server</h1>" >>${INDEX}
cd "${SERVERS_DIR}"
for DIR
in *
do
  if [ -f "${DIR}/port" ]
  then
    PORT=$(cat "${DIR}/port")
    echo "**** ${DIR} active ${PORT} ****"
    echo "<li><a href='http://${HOST}:${PORT}/'>${DIR}</a>" >>${INDEX}
  fi
done
rcp ${INDEX} ${USER}@${HOST}:${DEST}

echo '***********************************************'
echo "http://${HOST}/"
echo '***********************************************'
exit 0
