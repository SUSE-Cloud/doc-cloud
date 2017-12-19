#!/bin/sh

echo " "
echo  "###Greg's changes ###############################################################################################"

git log --since="7 days" --author="Greg" --name-only --format="%n%n===%s==="| grep -v Greg |grep -v "Merge branch" | sed ':a;N;$!ba;s/=\n/= /g'

  
echo " "
echo "### Jerry's changes ###############################################################################################"

git log --since="7 days" --author="Jerry" --name-only --format="%n%n===%s==="| grep -v Jerry |grep -v "Merge branch" | sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Geraldine's changes ###############################################################################################"

git log --since="7 days" --author="Geraldine" --name-only --format="%n%n===%s==="| grep -v Geraldine | grep -v "Merge branch" |sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Amanda's changes ###############################################################################################"

git log --since="7 days" --author="manda" --name-only --format="%n%n===%s==="| grep -v manda | grep -v "Merge branch" | sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Michael's changes ###############################################################################################"

git log --since="7 days" --author="ichael" --name-only --format="%n%n===%s==="| grep -v ichael| grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Nancy's changes ###############################################################################################"

git log --since="7 days" --author="ancy" --name-only --format="%n%n===%s==="| grep -v ancy | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Jayme's changes ###############################################################################################"

git log --since="7 days" --author="ayme" --name-only --format="%n%n===%s==="| grep -v ayme | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Binamra's changes ###############################################################################################"

git log --since="7 days" --author="inamra" --name-only --format="%n%n===%s==="| grep -v inamra | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Lou's changes ###############################################################################################"

git log --since="7 days" --author="omm" --name-only --format="%n%n===%s==="| grep -v omm | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'



echo " "
echo "### Paul's changes ###############################################################################################"

git log --since="7 days" --author="aul" --name-only --format="%n%n===%s==="| grep -v aul | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'

echo " "
echo "### Joel's changes ###############################################################################################"

git log --since="7 days" --author="oel" --name-only --format="%n%n===%s==="| grep -v oel | grep -v "Merge branch" |  sed ':a;N;$!ba;s/=\n/= /g'
