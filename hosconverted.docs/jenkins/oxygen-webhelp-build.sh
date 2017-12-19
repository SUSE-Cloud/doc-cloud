#!/bin/sh
 
export XEP_HOME=/usr/local/RenderX/XEP


echo "Setting environment variables…"

# this assumes you've already exported XEP_HOME (if you're using XEP)

# ugly parent directory hacks to avoid breaking other build stuff:
export DITA_HOME="`pwd`/tools/DITA-OT"
export DITAC_HOME="`pwd`/tools/ditac/ditac-2_4_0"
export DOC_HOME="`pwd`"
export PRODUCT_DIR="./products"
export ANT_HOME="$DITA_HOME/tools/ant"
echo DITA_HOME IS $DITA_HOME
echo DOC_HOME is $DOC_HOME
echo PRODUCT_DIR is $PRODUCT_DIR
echo ANT_HOME is $ANT_HOME

CUR_PWD="`pwd`"

# Get the absolute path of DITAOT's home directory
cd "$DITA_HOME"
DITA_DIR="`pwd`"
echo DITA_DIR is $DITA_DIR
cd "$CUR_PWD"

# Make sure ant binary is executable
if [ -f "$DITA_DIR"/tools/ant/bin/ant ] && [ ! -x "$DITA_DIR"/tools/ant/bin/ant ]; then
echo "*** chmoding ant binary so it's executable ***"
chmod +x "$DITA_DIR"/tools/ant/bin/ant
fi

echo "*** Setting ant environment variables ***"
export ANT_OPTS="-Xmx512m $ANT_OPTS"
export ANT_OPTS="$ANT_OPTS -Djavax.xml.transform.TransformerFactory=net.sf.saxon.TransformerFactoryImpl"
#export ANT_HOME="$DITA_DIR"/tools/ant
#export DOC_VERSION_NUMBER=$(sed -n '/shortversionnumber">/ s/[^<]*<p><ph[^>]*>\([^<]*\).*/\1/p' ./shared/conrefs.dita)
#echo "  DOC VERSION NUMBER: " $DOC_VERSION_NUMBER

echo "*** Adding project-specific version of ant to path ***"
export PATH="$DITA_DIR"/tools/ant/bin:"$PATH"
echo " DITA ANT PATH is " $DITA_DIR "+/tools/ant/bin"

 
NEW_CLASSPATH="$DITA_DIR/lib/dost.jar"
NEW_CLASSPATH="$DITA_DIR/lib:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/commons-codec-1.4.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/resolver.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/icu4j.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/xercesImpl.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/xml-apis.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/saxon/saxon9.jar:$NEW_CLASSPATH"
NEW_CLASSPATH="$DITA_DIR/lib/saxon/saxon9-dom.jar:$NEW_CLASSPATH"
if test -n "$CLASSPATH"; then
  export CLASSPATH="$NEW_CLASSPATH":"$CLASSPATH"
else
  export CLASSPATH="$NEW_CLASSPATH"
fi


#check to see if classpath already exists - if so, append our new values
if test -n "$CLASSPATH"
then
export CLASSPATH="$NEW_CLASSPATH":"$CLASSPATH"
else
export CLASSPATH="$NEW_CLASSPATH"
fi

 


#DITA_HOME="./"

 
echo $DITA_HOME

# Oxygen Webhelp plugin
# Copyright (c) 1998-2014 Syncro Soft SRL, Romania.  All rights reserved.
# Licensed under the terms stated in the license file EULA_Webhelp.txt 
# available in the base directory of this Oxygen Webhelp plugin.


# The path of the Java Virtual Machine install directory
# JVM_INSTALL_DIR=/System/Library/Frameworks/JavaVM.framework/Versions/CurrentJDK/Home

# The path of the DITA Open Toolkit install directory
DITA_OT_INSTALL_DIR="./tools/DITA-OT/"

echo DITA_OT_INSTALL_DIR
echo $DITA_OT_INSTALL_DIR



# The path of the Saxon 9.1.0.8 install directory  
SAXON_9_DIR=./tools/saxonb9-1-0-8j

# One of the following three values: 
#      webhelp
#      webhelp-feedback
#      webhelp-mobile
TRANSTYPE=webhelp

# The path of the directory of the input DITA map file
# DITA_MAP_BASE_DIR=/home/test/oxygen-webhelp/OxygenXMLEditor/samples/dita/flowers
#DITA_MAP_BASE_DIR="./"
DITA_MAP_BASE_DIR=`pwd`

echo DITA_MAP_BASE_DIR
echo $DITA_MAP_BASE_DIR

# The name of the input DITA map file
DITAMAP_FILE=docs.hpcloud.com.ditamap

# The name of the DITAVAL input filter file 
DITAVAL_FILE=my_ditaval.ditaval

# The path of the directory of the DITAVAL input filter file
DITAVAL_DIR=/usr/local/OxygenXMLDeveloper16/samples/dita


"java"\
 -Xmx512m\
 -classpath\
 "$DITA_OT_INSTALL_DIR/tools/ant/lib/ant-launcher.jar"\
 "-Dant.home=$DITA_OT_INSTALL_DIR/tools/ant" org.apache.tools.ant.launch.Launcher\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/xercesImpl.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/xml-apis.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/xml-apis-ext.jar"\
 -lib "$DITA_OT_INSTALL_DIR"\
 -lib "$DITA_OT_INSTALL_DIR/lib"\
 -lib "$SAXON_9_DIR/saxon9.jar"\
 -lib "$SAXON_9_DIR/saxon9-dom.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/license.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/log4j.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/resolver.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/ant-contrib-1.0b3.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/lucene-analyzers-common-4.0.0.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/lucene-core-4.0.0.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/xhtml-indexer.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.highlight/lib/xslthl-2.1.0.jar"\
 -lib "$DITA_OT_INSTALL_DIR/plugins/com.oxygenxml.webhelp/lib/webhelpXsltExtensions.jar"\
 -f "$DITA_OT_INSTALL_DIR/build.xml"\
 "-Dtranstype=$TRANSTYPE"\
 "-Dbasedir=$DITA_MAP_BASE_DIR"\
 "-Doutput.dir=$DITA_MAP_BASE_DIR/out/$TRANSTYPE"\
 "-Ddita.temp.dir=$DITA_MAP_BASE_DIR/temp/$TRANSTYPE"\
 "-Dargs.hide.parent.link=no"\
 "-Dargs.filter=$DITAVAL_DIR/$DITAVAL_FILE"\
 "-Ddita.input.valfile=$DITAVAL_DIR/$DITAVAL_FILE"\
 "-Ddita.dir=$DITA_OT_INSTALL_DIR"\
 "-Dargs.xhtml.classattr=yes"\
 "-Dargs.input=$DITA_MAP_BASE_DIR/$DITAMAP_FILE"\
 "-DbaseJVMArgLine=-Xmx384m"
 
 
 
  
 



