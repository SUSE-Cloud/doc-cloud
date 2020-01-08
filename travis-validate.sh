#!/bin/bash

set -x

echo "TRAVIS_PULL_REQUEST=$TRAVIS_PULL_REQUEST" >> env.list
echo "TRAVIS_BRANCH=$TRAVIS_BRANCH" >> env.list
echo "SOURCE_BRANCH=$SOURCE_BRANCH" >> env.list
echo "TRAVIS_REPO_SLUG=$TRAVIS_REPO_SLUG" >> env.list
echo "LIST_PACKAGES=$LIST_PACKAGES" >> env.list
echo "PUBLISH_PRODUCTS=\"$PUBLISH_PRODUCTS\"" >> env.list
echo "ENCRYPTED_PRIVKEY_SECRET=$ENCRYPTED_PRIVKEY_SECRET" >> env.list
echo "TRAVIS_COMMIT=$TRAVIS_COMMIT" >> env.list

if [[ ! -f travis.sh ]]; then
  wget https://raw.githubusercontent.com/openSUSE/doc-ci/develop/travis/travis.sh
fi

docker run --rm -it \
  --volume ${PWD}:/usr/src/app \
  --workdir /usr/src/app \
  susedoc/ci:openSUSE-42.3 \
  /bin/bash -c '/bin/bash travis.sh'
