
for i in `find . -name "*.dita"`;
do  
sed -i 's|<section id=\"\([^\"]*\)\"> <title>\([^><]*\)<\!--Removed anchor point \([A-Za-z-]*\)--|<section id="\3"> <title>\2<\!--Removed anchor point \3--|' $i 


sed -i 's|\(xref.*[^\"]\#[^\"]*\"\)|\1 type=\"section\" scope=\"external\" |' $i 
sed -i 's|scope=\"external\" *scope=\"external\"|scope=\"external\"|' $i 


done 
