#!/bin/bash
#
#   
#

 


BRANCH=development
echo "$BRANCH"
 
if [ "$BRANCH" == "" ]
then
echo "no branch provided, exiting."
exit 1
fi

#Checkout the branch to merge to master.

echo 1
git fetch --all
git reset --hard origin/master

echo 2
git branch --set-upstream  ${BRANCH} origin/${BRANCH}
git branch --set-upstream  master origin/master
 
echo 3
git checkout -f master
git pull origin

echo 4
git checkout -f ${BRANCH}
git pull origin 
   
echo 5
#Search to ensure that every md file contains one of the publish flag comments strings . 
#(If any file does not contain a comment string, report the names of the missing files and exit with an error message.)

 
s=" "
MDFILES_NOT_DESIGNATED=""
for i in `find . -name "*.md" `
do 

	if [[ -n $(grep -L "\-\-UNDER REVISION" $i) ]] && [[ -n $(grep -L "\-\-PUBLISH" $i) ]]; 
	then
	MDFILES_NOT_DESIGNATED=$MDFILES_NOT_DESIGNATED$s`echo $i`
	fi
 done

if [ "$MDFILES_NOT_DESIGNATED" != "" ]
then
echo "==========================================================================="
echo "The following files in the $BRANCH branch are missing a PUBLISH or UNDER REVISION comment"
echo " "
echo "$MDFILES_NOT_DESIGNATED"
echo " "
echo "Add or correct the comment in these files and run this script again."
#git checkout master
	exit 1
fi


#Search to ensure that every yml file contains one of the comments strings above. 
#(If any file does not contain a comment string, report the names of the missing files and exit with an error message.)

 
YMLFILES_NOT_DESIGNATED=""
for i in `find . -name "*.yml" `
do 

	if [[ -n $(grep -L "#PUBLISH" $i) ]] && [[ -n $(grep -L "#UNDER REVISION" $i) ]]; 
 
	then
		 
	YMLFILES_NOT_DESIGNATED=$YMLFILES_NOT_DESIGNATED$s`echo $i`
	fi
 
 
done
 
if [ "$YMLFILES_NOT_DESIGNATED" != "" ]
then
echo "==========================================================================="
echo "The following files in the $BRANCH branch are missing a PUBLISH or UNDER REVISION comment"
echo " "
echo "$YMLFILES_NOT_DESIGNATED"
echo " "
echo "Add or correct the comment in these files and run this script again."
#git checkout master
	exit 1
fi



#Search for and record the names of all the files that contain the comment: <!—PUBLISH-->

 
MDFILES_TO_PUBLISH=""
for i in `find . -name "*.md" `
do 
MDFILES_TO_PUBLISH=$MDFILES_TO_PUBLISH$s`egrep -l "\-\-PUBLISH" $i`; 
 
done

YMLFILES_TO_PUBLISH=""
for i in `find . -name "*.yml" `
do 
YMLFILES_TO_PUBLISH=$YMLFILES_TO_PUBLISH$s`egrep -l "#PUBLISH" $i`; 
 
done

 
NON_MDFILES_TO_PUBLISH=`find . -type f -not -path "*.git*" -not -name "*.md"`

 
ALL_FILES=${MDFILES_TO_PUBLISH}_list_${NON_MDFILES_TO_PUBLISH}_list_${YMLFILES_TO_PUBLISH}

 
 

 
#Checkout the master branch
git checkout master

#For each file in the list of files to publish, execute the command: 
echo "=================================="
for i in  $ALL_FILES
do
 
	if [[ -n $(git diff master $BRANCH -- $i) ]]; 
	then
echo "merging $i"
git checkout origin/${BRANCH} -- $i

fi
done


#Add the files.
git add .

#Commit the files.
git commit -m "Merging <!--PUBLISHED--> files from $BRANCH to master" .

git push

git checkout $CURRENT_BRANCH
