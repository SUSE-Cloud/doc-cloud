#!/bin/bash -e

 
for i in `find -name "*.md"`
do
 #echo $i
Hend=""
	cp $i.orig $i 
	#echo $i
	Hend=`awk '/^product:/ {print FNR}' $i`
	 #echo "found $Hend"
 
 
	if [ -n "$Hend" ]
	then
	#echo 1
		root=`grep permalink $i | sed '1,6 s|permalink: ||' | sed 's|/[^/]*|/..|g'  | sed 's|^/||'| sed 's|\.\.$||' | sed 's|^\.\./|root: "\.\./|' |sed 's|\.\./$|\.\./"|'`
#echo 2		
		#echo "$root"
		 echo "1 $i"
		#echo 3
		 sed   "/^permalink/a ${root} " $i > tmp
		  
		 echo "2 $i"
		 sed    's|](/|]({{ page.root }}|g'  tmp >  $i
		 
		echo "3 $i"
	else
		echo "$i has no header"
	fi
	echo done 
done

 