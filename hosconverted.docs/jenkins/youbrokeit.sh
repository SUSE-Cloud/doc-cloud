#!/bin/bash -li


echo 'running documentation/jenkins/check.sh'
#Get the most recent version of the master branch  
 env | grep GIT
 git checkout $GIT_BRANCH
 git pull

 



#Delete any tempfiles left over from the last run and write introduction
rm checktmp > /dev/null 2>&1  
rm permalinklist1.txt  > /dev/null 2>&1  
rm filepermalink1.txt > /dev/null 2>&1  
rm tmp > /dev/null 2>&1  

echo " "
echo " "
echo  "Checking the $GIT_BRANCH branch for structural errors that can cause a failure for the entire build or for individual files. "
echo  ""


  


for i in `find . -path ./redirects -prune -o -name "*.md" | grep -v "/redirects"`
	do
		if [[ -z $(head  -50 $i | grep "published: false") ]];
		then
 
 
sed ':a;N;$!ba;s/\n/ /g' $i   | sed 's|-->|-->\n|g' | sed 's|<!--.*-->||g' | sed 's|](|\n](|g'  | grep "](/.*)" | sed 's/.*](//' | sed 's/).*//' | sed 's|#.*||' | grep -v "/api/" | grep -v "^/file/" | sed 's|\/$||' >> permalinklist1.txt




grep permalink $i | sed 's|.* /|/|' | sed 's|\/$||' >> filepermalink1.txt


fi
done


echo "/master-toc/" | sed 's|.* /|/|' | sed 's|\/$||' >> filepermalink1.txt
 

for i in `cat permalinklist1.txt | sed 's/ *//g'  | grep -v http | sort | uniq | sed 's:/$::' `
do 

	if [[ -z $(grep $i filepermalink1.txt ) ]];
	then
		echo  ""
		echo "==== Broken permalinks to documentation.git files ==="
		echo "The file will build, but the output will contain a broken link"

		echo "The permalink $i does not exist but is referenced in:"
		for a in `find . -name "*.md"`
		do
			if [[ -z $(head $a | grep "published: false") ]];
			then
				if [[ -n "$(sed ':a;N;$!ba;s/\n/ /g'  $a | sed 's|-->|-->\n|g' | sed 's|<!--.*-->||g' | grep  $i )" ]];
					then
						echo $a
						echo "Last committed by:"
						git log -1 $a | egrep "(Author|Date)"
						echo ""
						EXIT="1"
				fi
			fi	
		done
			echo ""
			
	fi
		 
done


#rm permalinklist.txt 
#rm filepermalink.txt
 
 
 
 
 
 
 
 
 
 
 


for i in `find . -name "*.md" | grep "\./devplatform/" | grep -v ALS-developer-trial-quick-start`
	do
	if [[ -n $(grep layout: $i | grep -v default-devplatform) ]];
	then
		echo " "
		echo "This devplatform file needs to use the default-devplatform layout:"
		echo $i
		 EXIT="1"
	fi


done


for i in `find . -name "*.md" | grep -v "\./devplatform/"`
	do
	if [[ -n $(grep layout: $i | grep  default-devplatform) ]];
	then
		echo " "
		echo "This file should not use the default-devplatform layout."
		echo $i
		 EXIT="1"
	fi


done


 
 
if [[ -n $(find . -name "* *") ]];
	then
	echo " "
	echo "===Spaces in filenames======================"
		find . -name "* *" 
		echo "Files with spaces in the filename can cause scripts, like this one, to fail."
		echo "Use git mv old name newname to rename the file, then push again."
		echo ""


		 EXIT="1"
	fi
 








for i in `find . -name "*.md"`; 
do  
if [[ -n $(head -10 $i | egrep  "(\-\-\-\-|^\-\-$)";) ]];
then
echo "==== Incorrect header divider ==="
echo "Header must begin and end with a three-dash line."
echo "The build will not fail, but the md file will not be included in the output."
echo $i
echo "Last checked in by:"
git log -1 $i | egrep "(Author|Date)"
echo ""
 EXIT="1"
fi


if [[ -n $(head -10 $i | egrep  "(layout:.*title:|title:.*permalink:|permalink:.*product: )";) ]];
then
echo "==== Incorrect header ==="
echo "The layout, title, permalink and product declarations must all be on seperate lines."
echo "The build will not fail, but the md file will not be included in the output."
echo $i
echo "Last checked in by:"
git log -1 $i | egrep "(Author|Date)"
echo ""
 EXIT="1"
fi


if [[ -n $(head -10 $i | grep title: |   grep -v ".*\".*\"" ;) ]];
then
echo "==== Title missing ending quotation mark ==="
echo "The title string must end with a quotation mark."
echo "The build will not fail, but the md file will not be included in the output."
echo $i
echo "Last checked in by:"
git log -1 $i | egrep "(Author|Date)"
echo ""
 EXIT="1"
fi


done 






 


for i in `find . -name "*.md" `
do 


	if [[ -n $(grep -L "\-\-PUBLISH" $i) ]]; 
	then
	if  [[ -n $(grep -L "\-\-UNDER REVISION" $i) ]]; 
	then
	
	echo ""
	echo "===Missing publish flag============================= "
	echo "When the publish file is missing, the file will be visible on http://15.184.32.138/"
	echo "But will not be copied to the master branch, and so will not be visible on "
	echo "http://docs.qa1-stackato.cx.hpcloud.net/ or http:/docs.hpcloud.com"
	echo $i
	echo "Last checked in by:"
	git log -1 $i | egrep "(Author|Date)"
	echo ""
	 EXIT="1"
	fi
	fi
 done 

for i in `find . -name "*.md"`
do 
	a=`head -1 $i`
	if   [ -z "$a" ];
	then
	echo " "
	echo "===Blank lines============================="
		echo "Blank lines at the top of file $i"
		echo "When the mdfile begins with a, the file will be visible on http://15.184.32.138/"
		echo "But will not be copied to the master branch, and so will not be visible on "
		echo "http://docs.qa1-stackato.cx.hpcloud.net/ or http:/docs.hpcloud.com"
		echo "Last checked in by:"
		git log -1 $i | egrep "(Author|Date)"
		 EXIT="1"
	fi
done   










 


OLDIFS=$IFS
#Set Internal Field Separator to % (to preserve white space at the beginning and end of badstrings)
IFS='%'




#Search yml files for HTML codes
cat ./jenkins/badYAMLstrings.txt |


while read BAD
do


  #Do a recursive grep for all yml files for the badstring and assign result to RESULT
     RESULT=`grep -r --include=\"*.yml\" --exclude-dir=jenkins "${BAD}" ./`




     #If RESULT is not empty, then write the bad string and the result to stout, and write 1 to the file checktmp
     if [ -z "$RESULT" ]
          then
          echo 
     else
          echo ""
          echo "===$BAD============================="
          echo "$RESULT"
          EXIT="1"
     fi


done  
 
echo "" 
 
 IFS=$OLDIFS


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
				  EXIT="1"
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
				EXIT="1"
			fi
		fi
	done	
	
done


fi
	echo "=================================================="
	echo " "


 #Cleanup
 rm tmp 
  
 
 
 
 




#Exit script with 1 if an error was found.  Otherwise exit with 0.
if [ -z "$EXIT" ]
     then
          exit 0
     else
          exit 1
fi
