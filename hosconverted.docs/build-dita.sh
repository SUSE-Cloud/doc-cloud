#!/bin/bash
# Random dita build stuff

if [[ ! -f $1 ]]; then
  echo "Does input file exist?"
  exit 1
fi

dita -i $1 -f html5

sed -ir 's/<a href/<a target="content" href/g' out/index.html

cat <<EOHTML >out/frameset.html
<!DOCTYPE html>
<html style="height: 100%; width: 100%; margin:0;">
<head>
<title>The 50% navigation solution</title>
</head>
<body style="height: 100%; width: 100%; margin:0;">
 <iframe style="width: 25%;height: 100%; float:left; border: 0" src="index.html" name="nav"></iframe>
 <iframe style="width: calc(75% - 3px);height: 100%; float:left; border: 0; border-left: 1px solid #EEE" name="content" src="index.html"></iframe>
</body>
EOHTML

echo ""
echo ""
echo "final HTML output at: $(pwd)/out/frameset.html"
