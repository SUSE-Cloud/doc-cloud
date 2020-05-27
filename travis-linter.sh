#!/bin/bash

compare_to="master"
# Branch parameter from Travis, the branch we want to merge into
[[ -n "$TRAVIS_BRANCH" ]] && compare_to="$TRAVIS_BRANCH"


log() {
  # $1 - message
  format="\e[34m"
  reset='\e[0m'
  echo -e "$format${1}$reset"
}

travis_fold_ids=''
travis_fold() {
  # $1 - human-readable name for folded section; or '-' as section end marker
  type='start'
  humanname="$1"
  id="fold_"$(( ( RANDOM % 32000 ) + 1 ))
  if [[ "$1" == '-' ]]; then
    type='end'
    humanname=''
    id=$(echo "$travis_fold_ids" | cut -d' ' -f'1')
    travis_fold_ids=$(echo "$travis_fold_ids" | cut -d' ' -f'2-')
  else
    travis_fold_ids="$id $travis_fold_ids"
  fi
  [[ $type == 'start' ]] && echo ""
  echo -en "travis_fold:$type:$id\\r"
  log "$humanname"
}


travis_fold "Setting Up Tooling"

pip install gitlint
wget https://raw.githubusercontent.com/openSUSE/doc-ci/master/gitlint/gitlint.ini
wget https://raw.githubusercontent.com/openSUSE/doc-ci/master/gitlint/extra-gitlint-rules.py

travis_fold -


travis_fold "Checking out comparison branch $compare_to"

git checkout -b temp-pr_state_branch

git fetch origin $compare_to
git checkout -b temp-comparison_branch FETCH_HEAD

travis_fold -


gitlint --commits temp-comparison_branch..temp-pr_state_branch -C gitlint.ini
