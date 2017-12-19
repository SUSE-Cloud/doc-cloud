#!/bin/bash


for i in  `find . -name "*.md" -o -name "*.yml"`

do 

	if [[ -n $(grep -l "PUBLISHED" $i) ]] 
		then
		
		if [[ -n $(grep -L "publish.*false" $i) ]] 
            then 		
			 
			echo "Changing PUBLISHED to UNDER REVISION in $i"
			sed -i 's:<!--PUBLISHED-->:<!--UNDER REVISION-->:'  $i
		fi
	fi

done

 
