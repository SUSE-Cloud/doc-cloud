#!/bin/bash

VERSION_TO_PUBLISH="$1"
DEFAULT_VERSION="$2"

if [[ -z $(ls /var/www/html/euca-incoming/$VERSION_TO_PUBLISH) ]]
then
	echo ">>The version entered to publish ($VERSION_TO_PUBLISH) does not exist. Versions available for publication are:"

	ls /var/www/html/euca-incoming/

	echo ">>Exiting"

	exit 1;

else
	echo "$VERSION_TO_PUBLISH exists in euca-incoming.  Continuing..."

fi

echo ">>User wants to publish $VERSION_TO_PUBLISH, and set the default version to $DEFAULT_VERSION"

#checkout the bundle to publish and pull the latest changes
git checkout bundle-2015-may
git pull

# get the current euca redirect
CURRENT_REDIRECT=`grep "\^eucalyptus/?" ./ServerArtifacts/htaccess.with.rewrite.rules  | sed 's|.*eucalyptus/||' | sed 's|/.*||'`

echo ">>The current redirect is $CURRENT_REDIRECT"


if [  $DEFAULT_VERSION == "NO_CHANGE" ]
then #If the user does not request a change to the default version:     

         echo ">>NO_CHANGE selected:  The default version will remain set to $CURRENT_REDIRECT ."    
         
else #If the user wants to change the default version

    if [ $VERSION_TO_PUBLISH !=  $DEFAULT_VERSION ]
	then #If the version to set to default is NOT the version being published, make sure that it is already on the server
		TEST=`ssh ubuntu@15.126.215.92 "ls /var/www/html/eucaProd/$DEFAULT_VERSION"`
        
        echo ">>The version to be set to default ($DEFAULT_VERSION) exists on the server"


		if [ -z "$TEST" ];
		then #If the default version IS NOT on the server, inform the user and exit.
   			echo ">>ERROR: You selected $DEFAULT_VERSION to be the default version, but you are not publishing it now, and it does not already exist on the server."
            exit 1;
    	
        
   		 else #If the default version IS on the server, inform the user and continue
        	echo ">>Setting $DEFAULT_VERSION as the default version."
            
   		 fi
  	else #If the default version IS being published, inform the user it wil be set and continue
 		 echo ">>Setting $DEFAULT_VERSION as the default version."
         

	fi
    
    
    echo "###DEFAULT_VERSION = $DEFAULT_VERSION"

 
  

	if [[ -z $(grep "RewriteRule ^eucalyptus/?*$DEFAULT_VERSION" ./ServerArtifacts/htaccess.with.rewrite.rules) ]]; 
	then #If the version to be set to default is not already set

    	if [[ $(grep "\^eucalyptus/?" ./ServerArtifacts/htaccess.with.rewrite.rules) ]]
    	then #if any redirect exists, change it to the new default
    
    		echo ">> Changing the default version from $CURRENT_REDIRECT to $DEFAULT_VERSION"
			sed -i "s|^RewriteRule ^eucalyptus/?\$.*|RewriteRule ^eucalyptus/?$  /eucalyptus/${DEFAULT_VERSION}/ [NE,R=301,L]|" ServerArtifacts/htaccess.with.rewrite.rules 
   
    
    	else #if the no redirect exists, add the redirect.
    
    		echo ">>No default version is set, setting $DEFAULT_VERSION as the default."
    		echo "RewriteRule ^eucalyptus/?$	/eucalyptus/$DEFAULT_VERSION [NE,R=301,L]" >> ServerArtifacts/htaccess.with.rewrite.rules
   
   		fi
    	#commit and push the changed file
		git add ServerArtifacts/htaccess.with.rewrite.rules
		git commit -m "Changed eucalpytus default rewrite"
		git push

	else #If the version to be set to default is already the default, do nothing.
		echo ">>The default version is already set to $DEFAULT_VERSION.  No change."
	
	fi
fi

