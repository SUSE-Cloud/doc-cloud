#!/bin/bash
set -x
for file in $(find . -name "*.xml"); do
  echo "$file...";
  sed -i -r -e 's/\.dita(["#])/.xml\1/g' "$file";
done
#
