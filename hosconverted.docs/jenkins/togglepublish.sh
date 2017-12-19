#!/bin/bash -i

SHOULDBE="<!--PUBLISHED-->"
WRONG="<!--UNDER REVISION-->"
FILELIST=`echo "$@"`


for i in `echo "$FILELIST"`
do
 
s=`grep "$SHOULDBE" $i`
w=`grep "$WRONG" $i`
	
	if [ "$s" != "" ] 
		then
			echo $i already has a $SHOULDBE comment, no change.
		else 
			if [ "$w" != "" ]  
				then 
					echo $i has a $WRONG comment, changing to $SHOULDBE.
					sed -i "s/$WRONG/$SHOULDBE/" $i
				else 
				HEADERCHECK=`head $i | grep "\-\-\-"`
				if [ "$HEADERCHECK" == "" ] 
				then
					clear
					echo "ERROR!"
					echo "The file $i appears to be missing the header.  Please add it"
					echo "and retun this script. Markdown files must have a header that"
					echo "looks something like this:"
					echo ""
					echo "---"
					echo "layout: default"
					echo "title: \"HP Helion OpenStack&#174; FAQ\""
					echo "permalink: /helion/openstack/faq/"
					echo "product: commercial"
					echo ""
					echo "---"
					echo ""
					echo "The opening and closing '---' lines are required."
					echo ""
					echo "Exiting. No files were added, committed or pushed." 
					exit
				fi
				
				echo $i has no comment.  Adding $SHOULDBE.
				
				line=`grep -n "\-\-\-" $i | sed -n 2p | sed 's/:.*//'`
				line=$((line+1))
				 
				sed -i "$line i $SHOULDBE" $i
				
			 
			fi
	fi	
done