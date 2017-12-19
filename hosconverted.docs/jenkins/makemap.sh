
echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<!DOCTYPE map PUBLIC \"-//OASIS//DTD DITA Map//EN\" \"map.dtd\">
<map xml:lang=\"en\">
	<title>HP Converged Cloud</title>
	<topicmeta>
		<copyright>
			<copyryear year=\"2015\"/>
			<copyrholder>HP Converged Cloud</copyrholder>
		</copyright>
		<prodinfo>
			<prodname>HP Converged Cloud</prodname>
			<vrmlist>
				<vrm version=\"4.1.0\"/>
			</vrmlist>
		</prodinfo>
	</topicmeta>" > docs.hpcloud.com.ditamap
	
#rm /c/tmp.txt	
for i in `find . -name "*.dita"`
do

    title=""
    echo $i
	file=`echo "<topicref href=\"" $i"\"/>" | sed 's| \.\/||g'` 
	permalink=`grep permalink $i | head -1 | sed 's|</p>||'`
 
	 title=`grep "<title>" $i | head -1 | sed 's|\(HP Helion OpenStack.*Carrier Grade (Alpha)\): \([^<]*\)|"\2 -- \1 111"|' | grep 111 | sed 's|111||'`
	 
	 if [ "$title"=="" ]
	 then
	 title=`grep "<title>" $i | head -1 | sed 's|\(HP Helion OpenStack.*1.[120]\): \([^<]*\)|"\2 -- \1 111"|' | grep 111 | sed 's|111||'`
	 fi
	 
	 if [ "$title"=="" ]
	 then
	 title=`grep "<title>" $i | head -1 | sed 's|\(HP Helion OpenStack.*1.[120]: Metering Service (Ceilometer)\): \([^<]*\)|"\2 -- \1 111"|' | grep 111 | sed 's|111||'`
	 fi
	 
	 if [ "$title"=="" ]
	 then
	 title=`grep "<title>" $i | head -1 | sed 's|\(HP Helion 1.[120] Development Platform\): \([^<]*\)|"\2 -- \1 111"|' | grep 111 | sed 's|111||'`
	 fi
 
	echo "$permalink $file $title" >>  /c/tmp.txt
	
	# <topicref href="devplatform/helion/admin/server/1.1aok.dita" locktitle="yes" navtitle="test"/>
done

  sed -i 's|<title>|<topichead navtitle=|g'  /c/tmp.txt
  sed -i 's|</title>|/>|g'  /c/tmp.txt
    sed -i 's|/> <topichead | locktitle="yes" |g' /c/tmp.txt
	 
	 
	 
	#cat /c/tmp.txt   >> docs.hpcloud.com.ditamap
	 cat /c/tmp.txt | sort  >> docs.hpcloud.com.ditamap
	 rm /c/tmp.txt
 
 


 
echo "</map>" >> docs.hpcloud.com.ditamap
sed -i 's|{.*}|xx|g' docs.hpcloud.com.ditamap

echo " test "
