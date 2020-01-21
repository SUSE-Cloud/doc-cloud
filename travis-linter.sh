#!/bin/bash

set -x -u

git rev-list -h
git rev-list master | head -n5
git rev-list HEAD | head -n5
git rev-list master..HEAD
git branch

pip install gitlint
wget https://raw.githubusercontent.com/openSUSE/doc-ci/develop/gitlint/gitlint.ini
wget https://raw.githubusercontent.com/openSUSE/doc-ci/develop/gitlint/extra-gitlint-rules.py
gitlint --commits master..HEAD -C gitlint.ini
