// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

//
//    Class CMCAliasFile
//

function CMCAliasFile( xmlFile, helpSystem, OnLoadFunc )
{
	// Private member variables

	var mRootNode	= null;
	var mHelpSystem	= helpSystem;
	var mNameMap	= null;
	var mIDMap		= null;

	// Public properties

	// Constructor

	(function()
	{
	})();

	// Public member functions

	this.Load = function (OnCompleteFunc)
	{
	    function OnLoad(xmlDoc)
	    {
            if (xmlDoc)
	            mRootNode = xmlDoc.documentElement;

	        OnCompleteFunc();
	    }

	    CMCXmlParser.GetXmlDoc(xmlFile, true, OnLoad, null);
	};
	
	this.GetIDs	= function()
	{
		var ids	= new Array();
		
		AssureInitializedMap();

		mIDMap.ForEach( function( key, value )
		{
			ids[ids.length] = key;
			
			return true;
		} );
		
		return ids;
	};
	
	this.GetNames	= function()
	{
		var names	= new Array();
		
		AssureInitializedMap();

		mNameMap.ForEach( function( key, value )
		{
			names[names.length] = key;
			
			return true;
		} );
		
		return names;
	};

	this.LookupID	= function( id )
	{
		var found	= false;
		var topic	= null;
		var skin	= null;

		if ( id )
		{
			if ( typeof( id ) == "string" && id.indexOf( "." ) != -1 )
			{
				var pipePos	= id.indexOf( "|" );

				if ( pipePos != -1 )
				{
					topic = id.substring( 0, pipePos );
					skin = id.substring( pipePos + 1 );
				}
				else
				{
					topic = id;
				}

                found = true;
			}
			else
			{
				var mapInfo	= GetFromMap( id );
				
				if ( mapInfo != null )
				{
					found = true;
					topic = mapInfo.Topic;
					skin = mapInfo.Skin;
				}
			}
		}
		else
		{
			found = true;
		}

		if ( !skin )
		{
		    if (mRootNode)
			{
			    skin = mRootNode.getAttribute("DefaultSkinName");
			}
		}
		
		if ( topic )
		{
			topic = mHelpSystem.ContentFolder + topic;
		}
		
		return { Found: found, Topic: topic, Skin: skin };
	};

	// Private member functions
	
	function GetFromMap( id )
	{
		var mapInfo	= null;
		
		AssureInitializedMap();

		if ( mNameMap != null )
		{
			if ( typeof( id ) == "string" )
			{
				mapInfo = mNameMap.GetItem( id );
				
				if ( mapInfo == null )
				{
					mapInfo = mIDMap.GetItem( id );
				}
			}
			else if ( typeof( id ) == "number" )
			{
				mapInfo = mIDMap.GetItem( id.toString() );
			}
		}

		return mapInfo;
	}
	
	function AssureInitializedMap()
	{
		if ( mNameMap == null )
		{
		    if (mRootNode)
			{
				mNameMap = new CMCDictionary();
				mIDMap = new CMCDictionary();

				var maps = mRootNode.getElementsByTagName("Map");

				for ( var i = 0; i < maps.length; i++ )
				{
					var topic	= maps[i].getAttribute( "Link" );
					var skin	= maps[i].getAttribute( "Skin" );
					
					if ( skin )
					{
						skin = skin.substring( "Skin".length, skin.indexOf( "/" ) );
					}
					
					var currMapInfo	= { Topic: topic, Skin: skin };
					
					var name	= maps[i].getAttribute( "Name" );
					
					if ( name != null )
					{
						mNameMap.Add( name, currMapInfo );
					}
					
					var resolvedId	= maps[i].getAttribute( "ResolvedId" );
					
					if ( resolvedId != null )
					{
						mIDMap.Add( resolvedId, currMapInfo );
					}
				}
			}
		}
	}
}

//
//    End class CMCAliasFile
//

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */
