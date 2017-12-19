#!/bin/bash -li

for i in `find . -path ./.git -prune -o -type f`
do
	
 SINCE="2 November 2014"
	
 
		 
		 	if [[ -z $(git log --since="$SINCE" $i) ]];
		 then
		  echo ""  > /dev/null 2>&1 
		 else
		 
		 echo $i `git log --pretty=format:"%an%x09%cd%x09%f%" --since="$SINCE" $i | sed -e $'s/%/\\\n/g'`
		  
		 fi
	
done