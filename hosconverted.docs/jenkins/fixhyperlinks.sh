
permalink=" " 
id=" "
echo test
for i in `find . -name "*.dita"` 
do 
#echo " " 
#echo $i

cat $i | tr '\n' '\f'  > oneline
cat oneline | sed -e 's|<section>..<title>..<!-- id="\([^\"]*\)" -->|<section id="\1"> <title>|g' | tr '\f' '\n' > $i

#sed -i 'N;s/<title>\n/<title> /g'  $i 
#sed -i ':a;N;$!ba;s/<title>\n/<title>\t/g'  $i 

#sed -i  's|<title> <!\-\- |<title |g' $i
#sed -i  's|<title><!\-\- |<title |g' $i

 
#sed -i 'N;s|<title>\n<!-- id=\"|<title id=\"|g'  $i

#sed -i 's|\(<title id[^>]*\) \-\->|\1>|g'  $i

sed -i 's|!registeredtrademarksymbol!|(R)|g'  $i
sed -i 's|!copyrightsymbol!|(C)|g'  $i
	
	
	

	permalink=`grep permalink $i |sed 's|.* /|/|' | sed 's|/-->.*|/|' | sed 's/-->.*//'`
	id=`echo $permalink | sed 's|/|_|g' | sed 's|^_||' | sed 's|_$||' |sed 's|\.|_|g'`

	#echo "permalink $permalink"
	#echo "id        $id"
	
	
	level=`echo $i | sed 's|\/|\n|g' | wc -l`

	#sed -i "s|id=\"topic.*\"|id=\"$id\"|" $i 

	#sed -i 's|link href\=|xref href\=|g' $i
	#sed -i 's|xref href\="http|link href\="http|g' $i
	sed -i 's|format="html"||g' $i
	sed -i 's|scope="external"|scope="external" format="html"|g' $i
	 
	echo $level
	
 
	if [ $level = "1" ]; then
	echo $i
	echo "ERROR1"
	fi

	if [ $level = "2" ]; then
	echo $i
	mediaPath="ERROR2/"
	fi
	
	if [ $level = "3" ]; then
	echo $i
	mediaPath="media/"
	docPath="../"
	fi
	
	if [ $level = "4" ]; then
	echo $i
	mediaPath="../media/"
	docPath="../../"
	fi	
		
	if [ $level = "5" ]; then
	echo $i
	mediaPath="../../media/"
	docPath="../../../"
	fi
			
	if [ $level = "6" ]; then
	echo $i
	mediaPath="../../../media/"
	docPath="../../../../"
	fi
				
	if [ $level = "7" ]; then
	echo $i
	mediaPath="../../../../media/"
	docPath="../../../../../"
	fi
				
	if [ $level = "8" ]; then
	echo $i
	mediaPath="../../../../../media/"
	docPath="../../../../../../"
	fi
				
	if [ $level = "9" ]; then
	echo $i
	mediaPath="../../../../../../media/"
	docPath="../../../../../../../"
	fi
				
	if [ $level = "10" ]; then
	echo $i
	mediaPath="../../../../../../../media/"
	docPath="../../../../../../../../"
	fi

echo $mediaPath	


 
 
sed -i 's|/content/documentation/media/|/media/|g' $i 
sed -i "s|image href=\"/.*media/|image href=\"../$mediaPath|g" $i 	
sed -i "s|href=\"\./\(.*\)\.dita|href=\"$docPath\1\.dita|g" $i
sed -i  '/<related-links>/,/<\/related-links>/d' $i
sed -i 's|format=\"html\" *format=\"pdf\"|format=\"pdf\"|' $i 	
sed -i 's|.dita\/\"|.dita\"|g' $i 
sed -i 's|™|(TM)|g' $i 
sed -i 's|®|(R)|g' $i 
sed -i 's|xref *href=\"javascript:window.open|xref format=\"html\" href=\"javascript:window.open|g' $i
sed -i 's|<xref href=\"#|<xref type=\"section\" href=\"#|g' $i
sed -i 's|\(mailto[^"]*"\)|\1 format="html"|g' $i
sed -i 's|\.dita\/\" format|.dita" format|g' $i

done

sed -i 's|\.\./||g' master-toc.dita

COUNTER=0
         while [  $COUNTER -lt 10 ]; do
             find . -type d -empty -exec rmdir {} \; || true
             let COUNTER=COUNTER+1 
         done

 
 
