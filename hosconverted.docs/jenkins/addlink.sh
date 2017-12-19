#!/bin/bash -li



for i in `find . -name "1\.0*"` 
do

newversion=`echo $i | sed 's/1\.0/1\.1/'`

if [[ -e $newversion ]]
then
 
oldversion=$i
newpermalink=`grep "^permalink:"  $newversion | sed 's:permalink.* /::' `


 #echo $newpermalink

oldpermalink=`grep "^permalink:"  $oldversion | sed 's:permalink.* /::' `
#echo $oldpermalink
 echo ""
 
#	Insert the 1.1 permalink into the 1.0 file as a link right after the title.

	#find the title line number

 
	insertinOLDversion=`awk '/^#[^#]/ {print FNR}' $oldversion | head -1`
	insertinOLDversion=$(($insertinOLDversion+1))
	
 
	insertinNEWversion=`awk '/^#[^#]/ {print FNR}' $newversion  | head -1`
	insertinNEWversion=$(($insertinNEWversion+1))

 
	sed -i "${insertinOLDversion} i \[See version 1.1 of this page\]\(\/${newpermalink}\)" $oldversion 
 echo "Added link to $oldpermalink in the file $newversion"
#	Insert the 1.0 permalink into the 1.1 file as a link right after the title.

sed -i "${insertinNEWversion} i \[See version 1.0 of this page\]\(\/${oldpermalink}\)" $newversion 
 echo "Added link to $newpermalink in the file $oldversion"
	 

else
x=2 
#echo no 1.1 file found for $i
fi

 


	
	done
