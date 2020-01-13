#!/bin/bash

set -x -u

pip install gitlint
wget https://raw.githubusercontent.com/openSUSE/doc-ci/develop/gitlint/gitlint.ini
wget https://raw.githubusercontent.com/openSUSE/doc-ci/develop/gitlint/extra-gitlint-rules.py
gitlint --commits master..HEAD -C gitlint.ini
