#!/bin/bash

set -x

echo "TRAVIS_PULL_REQUEST=$TRAVIS_PULL_REQUEST" >> env.list
echo "TRAVIS_BRANCH=$TRAVIS_BRANCH" >> env.list
echo "TRAVIS_REPO_SLUG=$TRAVIS_REPO_SLUG" >> env.list
echo "ENCRYPTED_PRIVKEY_SECRET=$ENCRYPTED_PRIVKEY_SECRET" >> env.list
echo "TRAVIS_COMMIT=$TRAVIS_COMMIT" >> env.list
[[ ! -f travis.sh ]] && wget https://raw.githubusercontent.com/openSUSE/doc-ci/master/travis/travis.sh
docker run --rm -it \
  --volume ${PWD}:/usr/src/app \
  --workdir /usr/src/app \
  susedoc/ci:latest \
  /bin/bash -c '/bin/bash travis.sh'
