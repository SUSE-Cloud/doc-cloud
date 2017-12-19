#!/bin/bash -li

for i in `find . -name "*.md"`

do

sed -i 's:^\[See version 1\.0 of this page\]:\[See the HPE Helion OpenStack 1.0 version of this page\]:' $i
sed -i 's:^\[See version 1\.1 of this page\]:\[See the HPE Helion OpenStack 1.1 version of this page\]:' $i

done