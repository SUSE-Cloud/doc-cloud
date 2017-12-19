#!/bin/bash


for i in  `find . -name "*.md" -o -name "*.yml"`

do 

	if [[ -n $(grep -l "UNDER REVISION" $i) ]] 
		then
		
		if [[ -n $(grep -L "publish.*false" $i) ]] 
            then 		
			 
			echo "Changing UNDER REVISION to PUBLISHED in $i"
			sed -i 's:<!--UNDER REVISION-->:<!--PUBLISHED-->:'  $i
		fi
	fi

done

 
