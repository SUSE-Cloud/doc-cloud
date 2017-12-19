#!/bin/bash -li


for i in `find . -path ./redirects -prune -o -name "*.md"`

do

	if [[ -n $(head -50 $i | grep -E '(^#[^#]|^ *#[^#])' | grep "HP Helion" | grep -v "Public Cloud") ]]; then

		if [[ -n $(grep  "published: false" $i) ]]; then
		   echo "Skipping $i"
		else
			echo " " 
			newname=`echo $i | sed -r 's:(.*)/:\1/1.1:g'`
			#echo "Rename: $i"
			#echo "To:     $newname"
			git mv $i $newname
			sed -i  's/\(^#[^#]*HP Helion\)/\1 1.1/' $newname
		fi
	else
		    echo " " 
			echo "Skipping $i"
	fi
 
done

echo "changing permalinks... "

for a in `find . -path ./redirects -prune -o -name "*.md"`



do
	sed -i 's:](/helion/:](/helion1.1/:g'  $a
	sed -i 's|permalink: /helion/|permalink: /helion1.1/|g' $a
	sed -i 's:href="/helion/:href="/helion1.1/:g'  $a
	sed -i 's:docs.hpcloud.com/helion/:docs.hpcloud.com/helion1.1/:g'  $a

done