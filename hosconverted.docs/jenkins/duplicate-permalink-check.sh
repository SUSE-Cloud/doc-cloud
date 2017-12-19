#!/bin/bash


#cleanup the tmp file in case the script got stopped before cleaning it up last time.
mv tmp tmp.old > /dev/null 2>&1

env | grep GIT

echo  $GIT_BRANCH

  
git checkout -f "${GIT_BRANCH}"
git pull origin "${GIT_BRANCH}"
 


echo " "
echo "=================================================="
echo "Checking for duplicate permalinks in $GIT_BRANCH..."

#Find all the md files and assign to an array:
names=($(find . -name "*.md"))  

# for every file name entry in the array:
for (( c=0; c<${#names[*]}; c++ )) 
do	
#echo "Name = ${names[c]}"
	# get the permalink and assign the permalink array with the coresponding index
	permalink[c]=`grep permalink  ${names[c]} | sed 's|permalink: ||' | sed 's|^ ||' | sed $'s/\r//'  ` 
	
	# write the permalink to a temp file that we can check later
	echo ${permalink[c]} >> tmp
#	echo "Permalink = ${permalink[c]} "
done
#cat tmp
cat tmp |  sort | uniq -D | uniq | sed '/^$/d'
#Check the temp file to see if there are any duplicate permalinks?
sort tmp | uniq -D | uniq | sed '/^$/d' |    

#If there are any duplicate permalinks then do the following:
while read DUPLICATE
do
 
	# for every entry in the array:
	for (( c=0; c<${#names[*]}; c++ ))
		do
			 #Check to see which permalink array entries match the duplicate string
			 if [[  "${permalink[c]}" == "$DUPLICATE"  ]]
			 then
				#Write a notification message with the name array entry with the corresponding index.
				echo " "
			 	echo "The file ${names[c]} contains a duplicated permalink: ${permalink[c]} "
				git log -1 ${names[c]} | grep Author | sed 's/Author/In development branch, last committed by/'
				exitcondition=1
			 fi
		done	
done
	echo "=================================================="
	echo " "
	
if [[ "$GIT_BRANCH" != "origin/master" ]]
then
preposition="or"
git checkout origin/master
git pull
echo " "
	echo "=================================================="
echo "Checking for duplicate permalinks in $GIT_BRANCH and master"
#Find all the md files and assign to helion array:
names2=($(find . -name "*.md"))  

#echo "${names2[*]}"


# for every file name entry in the helion array:
for (( c=0; c<${#names2[*]}; c++ )) 
do	
	# get the permalink and assign the permalink array with the coresponding index
	permalink2[c]=`grep permalink  ${names2[c]} | sed 's|permalink: ||' | sed 's|^ ||' | sed $'s/\r//'  ` 
	#echo "${permalink2[c]}, ${names2[c]}"
	
	#check to see if each permalink is found in the master list.
	for (( i=0; i<${#names[*]}; i++ ))
	do
		#does the helion permalink match the master permalink
		#echo " 2c = ${permalink2[c]}  i = ${permalink[i]}"
			
		if [[  "${permalink2[c]}" == "${permalink[i]}" && "${permalink2[c]}" != "" ]]
		then
			if [[  "${names2[c]}" != "${names[i]}"  ]]
			#echo "${names2[10]}"
			#echo  "name $c = ${names2[c]} name $i = ${names[i]}"
			 
			then
				echo ""
				echo "The following files use the same permalink (${permalink2[c]}):" 
				echo "   ${names2[c]} in the master branch"
				echo "   ${names[i]} in the ${GIT_BRANCH} branch"
				git log -1 ${names[i]} | grep Author | sed 's/Author/File last committed by/'
				
				git log -1 --branches=${GIT_BRANCH} ${names[i]} | grep Author | sed 's/Author/In development branch, file last committed by/'
				git log -1 --branches=master ${names2[c]} | grep Author | sed 's/Author/In master branch, file last committed by/'
				
				echo "This will cause an error when you merge ${GIT_BRANCH} branch to master."
				echo "You should probably modify the permalink in ${GIT_BRANCH} branch."
				
				echo ""
				exitcondition=1
			fi
		fi
	done	
	
done

fi
	echo "=================================================="
	echo " "

 #Cleanup
 rm tmp 
 
#Exit appropriately
if [  -z "$exitcondition"  ]
then
	echo No duplicate permalinks found in master $preposition $GIT_MASTER

	exit 0
 else
    echo Duplicate permalinks found, see above

	exit 1
fi



