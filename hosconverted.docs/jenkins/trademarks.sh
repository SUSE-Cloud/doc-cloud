for i in `find . -name "*.dita"`
do

#sed -i 's|<tm tmtype="reg">\([A-Za-z ]*\)</tm>|\1|g' $i
#sed -i 's|<tm tmtype="tm">\([A-Za-z ]*\)</tm>|\1|g' $i




#sed -i 's|<tm tmtype="reg">\(OpenStack\)</tm>|\1|g' $i
#sed -i 's|<tm tmtype="reg">\(Helion OpenStack\)</tm>|\1|g' $i
#sed -i 's|<tm tmtype="reg">\(HP Helion OpenStack\)</tm>|\1|g' $i


#sed -i 's|OpenStack(R)|OpenStack|g' $i





sed -i '0,/OpenStack/{s/OpenStack/\<tm tmtype=\"reg\"\>OpenStack\<\/tm\>/}' $i
#sed -i '0,/Eucalyptus/{s/Eucalyptus/\<tm tmtype=\"reg\"\>Eucalyptus\<\/tm\>/}' $i 
#sed -i '0,/Intel/{s/Intel/\<tm tmtype=\"reg\"\>Intel\<\/tm\>/}' $i 
#sed -i '0,/Linux/{s/Linux/\<tm tmtype=\"reg\"\>Linux\<\/tm\>/}' $i 
#sed -i '0,/Mac OS X/{s/Mac OS X/\<tm tmtype=\"reg\"\>Mac OS X\<\/tm\>/}' $i 
#sed -i '0,/Windows/{s/Windows/\<tm tmtype=\"reg\"\>Windows\<\/tm\>/}' $i 
#sed -i '0,/Xeon/{s/Xeon/\<tm tmtype=\"reg\"\>Xeon\<\/tm\>/}' $i 
#sed -i '0,/vSphere/{s/vSphere/\<tm tmtype=\"reg\"\>vSphere\<\/tm\>/}' $i
#sed -i '0,/Cloud Foundry/{s/Cloud Foundry/\<tm tmtype=\"tm\"\>Cloud Foundry\<\/tm\>/}' $i

done
