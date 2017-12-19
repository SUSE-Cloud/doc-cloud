// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.2.2.0</version>
////////////////////////////////////////////////////////////////////////////////

var gRuntimeFileType = FMCGetAttribute( document.documentElement, "MadCap:RuntimeFileType" );

var gLoaded						= false;
var gReadyFuncs					= new Array();
var gOnloadFuncs				= new Array();
var gOnunloadFuncs				= new Array();
var gPreviousOnloadFunction		= window.onload;
var gPreviousOnunloadFunction	= window.onunload;
var gReady						= false;
var REGISTER_CALLBACK_INTERVAL = 100;
var WAIT_FOR_PANE_ACTIVE_INTERVAL = 100;

if ( gPreviousOnunloadFunction != null )
{
	gOnunloadFuncs.push( gPreviousOnunloadFunction );
}

window.onload = function()
{
    if (document.location.href.Contains("frame=stream"))
        return;

	for ( var i = 0, length = gReadyFuncs.length; i < length; i++ )
	{
		gReadyFuncs[i]();
	}

	if (gPreviousOnloadFunction != null)
	{
		gPreviousOnloadFunction();
	}
	
	gReady = true;
	
	MCGlobals.Init();
	
	FMCRegisterCallback( "MCGlobals", MCEventType.OnInit, OnMCGlobalsInit, null );
};

window.onunload = function()
{
	for ( var i = 0, length = gOnunloadFuncs.length; i < length; i++ )
	{
		gOnunloadFuncs[i]();
	}
};

function OnMCGlobalsInit( args )
{
	for ( var i = 0, length = gOnloadFuncs.length; i < length; i++ )
	{
		gOnloadFuncs[i]();
	}
	
	gLoaded = true;
}

//
//    Helper functions
//

function FMCIsWebHelp() 
{
    var bool = false;
    var targetType = FMCGetAttribute(document.documentElement, "MadCap:TargetType");

    if (targetType == null) {
        return bool;
    }
	
	return targetType.Contains( "WebHelp" );
}

function FMCIsWebHelpAIR()
{
	return document.location.href.StartsWith( "app:/" );
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCIsHtmlHelp()
{
    var bool = false;
    var targetType = FMCGetAttribute(document.documentElement, "MadCap:TargetType");

    if (targetType == null) {
        return bool;
    }

	return targetType == "HtmlHelp";
}

function FMCIsDotNetHelp()
{
    var bool = false;
    var targetType = FMCGetAttribute(document.documentElement, "MadCap:TargetType");

    if (targetType == null) {
        return bool;
    }
	
	return targetType == "DotNetHelp";
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCIsEclipseHelp() {
    var bool = false;
    var targetType = FMCGetAttribute(document.documentElement, "MadCap:TargetType");

    if (targetType == null) {
        return bool;
    }

    return targetType.Contains("EclipseHelp");
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

function FMCIsTopicPopup( win ) {
    if (window.name.indexOf("-html5") != 0 || window.name == "pulse")
        return false;

    //    if (FMCIsHtmlHelp())
    //        return window.name.StartsWith("MCPopup_");

    //    return CMCUrl.QueryMap.GetItem("IsTopicPopup") == "true";

    /*
    - IE 7 reports window.name as "" even when the parent frame sets its name.
    - CHM doesn't allow setting the query string in the topic popup URL.
    - Chrome doesn't allow frames to access parent.name, however, it does allow access to parent.frames[<name>] if you know the name of the frame.
    In the situation of a topic popup, that means the parent frame must have a child frame with the name "MCPopup_0" (the number gets incremented for
    every topic popup but there must be at least one).
    */
    return parent.frames["MCPopup_0"] != null;
}

function FMCIsLiveHelpEnabled()
{
    return FMCGetAttribute(document.documentElement, "MadCap:LiveHelpServer") != null;
}

function FMCInPreviewMode()
{
	return MCGlobals.InPreviewMode;
}

function FMCIsSkinPreviewMode()
{
    return FMCGetAttribute(document.documentElement, "MadCap:SkinPreviewMode") || false;
}

function FMCGetSkin(OnCompleteFunc)
{
	var xmlDoc = null;
	var path = null;

	if ( MCGlobals.InPreviewMode )
	{
		path = "Skin/";
	}
	else
	{
		path = FMCGetSkinFolderAbsolute();
	}

	CMCXmlParser.GetXmlDoc(path + "Skin.xml", true, function (xmlDoc)
	{
	    OnCompleteFunc(xmlDoc);
	}, null);
}

function FMCGetStylesheet(OnCompleteFunc)
{
	var stylesheetDoc = null;

	if ( MCGlobals.InPreviewMode )
	{
	    var previewFolder = FMCGetAttribute(document.documentElement, "MadCap:previewFolder");

	    if (previewFolder != null)
	    {
	        path = previewFolder + "Skin/";
	    }
	    else
	    {
	        path = "Skin/";
	    }
	}
	else
	{
		path = FMCGetSkinFolderAbsolute();
	}

    CMCXmlParser.GetXmlDoc(path + "Stylesheet.xml", true, OnCompleteFunc, null);
}

function FMCIsStandaloneTopic()
{
    return (FMCIsWebHelp() && MCGlobals.RootFrame == null) || FMCIsEclipseHelp();
}

function FMCIsIE55()
{
	return navigator.appVersion.indexOf( "MSIE 5.5" ) != -1;
}

function FMCIsSafari()
{
	return typeof( document.clientHeight ) != "undefined";
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCIsLocal()
{
    return document.location.protocol.StartsWith("file");
}

function FMCIsChrome()
{
    return Boolean(window.chrome);
}

function FMCIsChromeLocal()
{
    return FMCIsChrome() && FMCIsLocal();
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

var FMCIsArray = Array.isArray || function (obj)
{
    return Object.prototype.toString.call(obj) == Object.prototype.toString.call([]);
};

function FMCGetSkinFolder()
{
    return MCGlobals.RootFrameSkinFolder;
}

function FMCGetSkinFolderAbsolute()
{
    var skinFolder = MCGlobals.RootFrameRootFolder + MCGlobals.RootFrameSkinFolder;

	return skinFolder;
}

function FMCGetBodyHref()
{
	var bodyLocation = MCGlobals.BodyFrame.document.location;
	var bodyHref = bodyLocation.protocol + ((!FMCIsHtmlHelp() && !FMCIsWebHelpAIR()) ? "//" : "") + bodyLocation.host + bodyLocation.pathname + bodyLocation.hash;

	bodyHref = FMCEscapeHref( bodyHref );
	
	var bodyHrefUrl = new CMCUrl( bodyHref );

	return bodyHrefUrl;
}

function FMCGetHref( currLocation )
{
    var href = currLocation.protocol + ((!FMCIsHtmlHelp() && !FMCIsWebHelpAIR()) ? "//" : "") + currLocation.host + currLocation.pathname;

    if (FMCIsEclipseHelp()) {
        href = new CMCUrl(currLocation.href).AlternateEclipsePath();
    }

	href = FMCEscapeHref( href );

	return href;
}

function FMCEscapeHref( href )
{
	var newHref	= href.replace( /\\/g, "/" );
	newHref = newHref.replace( /%20/g, " " );
	newHref = newHref.replace( /;/g, "%3B" );	// For Safari

	return newHref;
}

function FMCGetRootFolder( currLocation )
{
	var href		= FMCGetHref( currLocation );
	var rootFolder = href.substring(0, href.lastIndexOf("/") + 1);

	if (FMCIsEclipseHelp()) {
	    var idStart = rootFolder.indexOf("/topic/",0) + "/topic/".length;
	    var idEnd = rootFolder.indexOf("/",idStart);
	    rootFolder = rootFolder.substring(0, idEnd+1);
	}

	return rootFolder;
}

function FMCGetPathnameFolder( currLocation )
{
	var pathname	= currLocation.pathname;

	// This is for when viewing over a network. IE needs the path to be like this.

	if ( currLocation.protocol.StartsWith( "file" ) )
	{
		if ( !String.IsNullOrEmpty( currLocation.host ) )
		{
			pathname = "/" + currLocation.host + currLocation.pathname;
		}
	}

	//

	pathname = pathname.replace( /\\/g, "/" );
	//pathname = pathname.replace( /%20/g, " " );
	pathname = pathname.replace( /;/g, "%3B" );	// For Safari
	pathname = pathname.substring( 0, pathname.lastIndexOf( "/" ) + 1 );

	return pathname;
}

function FMCGetRootFrame()
{
	var currWindow	= window;
	
	while ( currWindow )
	{
		if ( currWindow.name.Contains( "MCWebHelp" ) )
		{
			break;
		}
		else if ( currWindow == top )
		{
			currWindow = null;
			
			break;
		}
		
		currWindow = currWindow.parent;
	}
	
	return currWindow;
}

var gImages	= new Array();

function FMCPreloadImage( imgPath )
{
    if (!(FMCIsEclipseHelp() ||FMCIsWebHelp()) || (!FMCInPreviewMode() && !FMCGetAttributeBool(document.documentElement, "PreloadImages", false)))
	{
		return;
	}
	
	if ( imgPath == null )
	{
		return;
	}
	
	if ( imgPath.StartsWith( "url", false ) && imgPath.EndsWith( ")", false ) )
	{
		imgPath = FMCStripCssUrl( imgPath );
	}
	
	var index	= gImages.length;
	
    gImages[index] = new Image();
    gImages[index].src = imgPath;
}

function FMCTrim( str )
{
    return FMCLTrim( FMCRTrim( str ) );
}

function FMCLTrim( str )
{
    for ( var i = 0; i < str.length && str.charAt( i ) == " "; i++ );
    
    return str.substring( i, str.length );
}

function FMCRTrim( str )
{
    for ( var i = str.length - 1; i >= 0 && str.charAt( i ) == " "; i-- );
    
    return str.substring( 0, i + 1 );
}

function FMCContainsClassRoot( className )
{
    var ret = null;
    
    for ( var i = 1; i < arguments.length; i++ )
    {
        var classRoot = arguments[i];
        
        if ( className && (className == classRoot || className.indexOf( classRoot + "_" ) == 0) )
        {
            ret = classRoot;
            
            break;
        }
    }
    
    return ret;
}

function FMCGetChildNodeByTagName( node, tagName, index )
{
    var foundNode   = null;
    var numFound    = -1;
    
    for ( var currNode = node.firstChild; currNode != null; currNode = currNode.nextSibling )
    {
        if ( currNode.nodeName == tagName )
        {
            numFound++;
            
            if ( numFound == index )
            {
                foundNode = currNode;
                
                break;
            }
        }
    }
    
    return foundNode;
}

function FMCGetLastChildNodeByTagName( node, tagName )
{
	var foundNode = null;

	for ( var currNode = node.lastChild; currNode != null; currNode = currNode.previousSibling )
	{
		if ( currNode.nodeName == tagName )
		{  
			foundNode = currNode;

			break;
		}
	}

	return foundNode;
}

function FMCGetChildNodesByTagName( node, tagName )
{
    var nodes   = new Array();
    
    for ( var i = 0; i < node.childNodes.length; i++ )
    {
        if ( node.childNodes[i].nodeName == tagName )
        {
            nodes[nodes.length] = node.childNodes[i];
        }
    }
    
    return nodes;
}

function FMCGetChildNodeByAttribute( node, attributeName, attributeValue )
{
	var foundNode   = null;

	for ( var currNode = node.firstChild; currNode != null; currNode = currNode.nextSibling )
	{
		if ( currNode.getAttribute( attributeName ) == attributeValue )
		{
			foundNode = currNode;

			break;
		}
	}

	return foundNode;
}

function FMCGetChildIndex( node )
{
	var index = -1;

	for ( var currNode = node; currNode != null; currNode = currNode.previousSibling )
	{
		if ( currNode.nodeType == 1 )
		{
			index++;
		}
	}

	return index;
}

function FMCGetSiblingNodeByTagName( node, tagName )
{
	var foundNode = null;

	for ( var currNode = node.nextSibling; currNode != null; currNode = currNode.nextSibling )
	{
		if ( currNode.nodeName == tagName )
		{  
			foundNode = currNode;

			break;
		}
	}

	return foundNode;
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCStringToBool( stringValue )
{
    if (typeof (stringValue) == "boolean")
    {
        return stringValue;
    }

	var boolValue		= false;
	var stringValLower	= stringValue.toLowerCase();

	boolValue = stringValLower == "true" || stringValLower == "1" || stringValLower == "yes";

	return boolValue;
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCGetAttributeBool( node, attributeName, defaultValue )
{
	var boolValue	= defaultValue;
	var value		= FMCGetAttribute( node, attributeName );
	
	if ( value )
	{
		boolValue = FMCStringToBool( value );
	}
	
	return boolValue;
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCGetAttributeInt( node, attributeName, defaultValue )
{
	var intValue	= defaultValue;
	var value		= FMCGetAttribute( node, attributeName );
	
	if ( value != null )
	{
		intValue = parseInt( value );
	}
	
	return intValue;
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

function FMCGetAttributeStringList( node, attributeName, delimiter )
{
	var list	= null;
	var value	= FMCGetAttribute( node, attributeName );
	
	if ( value != null )
	{
		list = value.split( delimiter );
	}
	
	return list;
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCGetAttribute( node, attribute )
{
    var value   = null;
    
    if ( node.getAttribute( attribute ) != null )
    {
        value = node.getAttribute( attribute );
    }
    else if ( node.getAttribute( attribute.toLowerCase() ) != null )
    {
        value = node.getAttribute( attribute.toLowerCase() );
    }
    else
    {
		var namespaceIndex	= attribute.indexOf( ":" );
		
		if ( namespaceIndex != -1 )
		{
			value = node.getAttribute( attribute.substring( namespaceIndex + 1, attribute.length ) );
		}
    }
    
    if ( typeof( value ) == "string" && value == "" )
    {
		value = null;
    }
    
    return value;
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

function FMCGetMCAttribute( node, attribute )
{
	var value	= null;
	
    if ( node.getAttribute( attribute ) != null )
    {
        value = node.getAttribute( attribute );
    }
    else if ( node.getAttribute( attribute.substring( "MadCap:".length, attribute.length ) ) )
    {
        value = node.getAttribute( attribute.substring( "MadCap:".length, attribute.length ) );
    }
    
    return value;
}

function FMCRemoveMCAttribute( node, attribute )
{
	var value	= null;
	
    if ( node.getAttribute( attribute ) != null )
    {
        value = node.removeAttribute( attribute );
    }
    else if ( node.getAttribute( attribute.substring( "MadCap:".length, attribute.length ) ) )
    {
        value = node.removeAttribute( attribute.substring( "MadCap:".length, attribute.length ) );
    }
    
    return value;
}

function FMCGetClientWidth( winNode, includeScrollbars )
{
    var clientWidth = null;
    
    if ( typeof( winNode.innerWidth ) != "undefined" )
    {
        clientWidth = winNode.innerWidth;
        
        if ( !includeScrollbars && FMCGetScrollHeight( winNode ) > winNode.innerHeight )
        {
            clientWidth -= 19;
        }
    }
    else if ( FMCIsQuirksMode( winNode ) )
    {
        clientWidth = winNode.document.body.clientWidth;
    }
    else if ( winNode.document.documentElement )
    {
        clientWidth = winNode.document.documentElement.clientWidth;
    }
    
    return clientWidth;
}

function FMCGetClientHeight( winNode, includeScrollbars )
{
    var clientHeight    = null;
    
    if ( typeof( winNode.innerHeight ) != "undefined" )
    {
        clientHeight = winNode.innerHeight;
        
        if ( !includeScrollbars && FMCGetScrollWidth( winNode ) > winNode.innerWidth )
        {
            clientHeight -= 19;
        }
    }
    else if ( FMCIsQuirksMode( winNode ) )
    {
        clientHeight = winNode.document.body.clientHeight;
    }
    else if ( winNode.document.documentElement )
    {
        clientHeight = winNode.document.documentElement.clientHeight;
    }
    
    return clientHeight;
}

function FMCGetClientCenter( winNode )
{
	var centerX	= FMCGetScrollLeft( winNode ) + (FMCGetClientWidth( winNode, false ) / 2);
	var centerY	= FMCGetScrollTop( winNode ) + (FMCGetClientHeight( winNode, false ) / 2);
	
	return [centerX, centerY];
}

function FMCGetScrollHeight( winNode )
{
    var scrollHeight    = null;
    
    if ( winNode.document.scrollHeight )
    {
        scrollHeight = winNode.document.scrollHeight;
    }
    else if ( FMCIsQuirksMode( winNode ) )
    {
        scrollHeight = winNode.document.body.scrollHeight;
    }
    else if ( winNode.document.documentElement )
    {
        scrollHeight = winNode.document.documentElement.scrollHeight;
    }
    
    return scrollHeight;
}

function FMCGetScrollWidth( winNode )
{
    var scrollWidth = null;
    
    if ( winNode.document.scrollWidth )
    {
        scrollWidth = winNode.document.scrollWidth;
    }
    else if ( FMCIsQuirksMode( winNode ) )
    {
        scrollWidth = winNode.document.body.scrollWidth;
    }
    else if ( winNode.document.documentElement )
    {
        scrollWidth = winNode.document.documentElement.scrollWidth;
    }
    
    return scrollWidth;
}

function FMCGetScrollTop( winNode )
{
    var scrollTop   = null;
    
    if ( FMCIsQuirksMode( winNode ) )
    {
        scrollTop = winNode.document.body.scrollTop;
    }
    else
    {
        // IE/Firefox uses document.documentElement.scrollXX and WebKit uses document.documentElement.scrollXX. They'll each report the other value as 0.
        scrollTop = Math.max(winNode.document.documentElement.scrollTop, winNode.document.body.scrollTop);
    }
    
    return scrollTop;
}

function FMCSetScrollTop( winNode, value )
{
    winNode.scrollTo(FMCGetScrollLeft(winNode), value);
}

function FMCGetScrollLeft( winNode )
{
    var scrollLeft  = null;
    
    if ( FMCIsQuirksMode( winNode ) )
    {
        scrollLeft = winNode.document.body.scrollLeft;
    }
    else
    {
        // IE/Firefox uses document.documentElement.scrollXX and WebKit uses document.documentElement.scrollXX. They'll each report the other value as 0.
        scrollLeft = Math.max(winNode.document.documentElement.scrollLeft, winNode.document.body.scrollLeft);
    }
    
    return scrollLeft;
}

function FMCSetScrollLeft( winNode, value )
{
    winNode.scrollTo(value, FMCGetScrollTop(winNode));
}

function FMCGetClientX( winNode, e )
{
    var clientX;
    
    if ( typeof( e.pageX ) != "undefined" )
    {
        clientX = e.pageX - FMCGetScrollLeft( winNode );
    }
    else if ( typeof( e.clientX ) != "undefined" )
    {
        clientX = e.clientX;
    }
    
    return clientX;
}

function FMCGetClientY( winNode, e )
{
    var clientY;
    
    if ( typeof( e.pageY ) != "undefined" )
    {
        clientY = e.pageY - FMCGetScrollTop( winNode );
    }
    else if ( typeof( e.clientY ) != "undefined" )
    {
        clientY = e.clientY;
    }
    
    return clientY;
}

function FMCGetPageX( winNode, e )
{
    var pageX;
    
    if ( typeof( e.pageX ) != "undefined" )
    {
        pageX = e.pageX;
    }
    else if ( typeof( e.clientX ) != "undefined" )
    {
        pageX = e.clientX + FMCGetScrollLeft( winNode );
    }
    
    return pageX;
}

function FMCGetPageY( winNode, e )
{
    var pageY;
    
    if ( typeof( e.pageY ) != "undefined" )
    {
        pageY = e.pageY;
    }
    else if ( typeof( e.clientY ) != "undefined" )
    {
        pageY = e.clientY + FMCGetScrollTop( winNode );
    }
    
    return pageY;
}

function FMCGetMouseXRelativeTo( winNode, e, el )
{
	var mouseX	= FMCGetPageX( winNode, e, el );
	var elX		= FMCGetPosition( el )[1];
	var x		= mouseX - elX;

	return x;
}

function FMCGetMouseYRelativeTo( winNode, e, el )
{
	var mouseY	= FMCGetPageY( winNode, e, el );
	var elY		= FMCGetPosition( el )[0];
	var y		= mouseY - elY;

	return y;
}

function FMCGetPosition( node )
{
	var topPos	= 0;
	var leftPos	= 0;
	
	if ( node.offsetParent )
	{
		topPos = node.offsetTop;
		leftPos = node.offsetLeft;
		
		while ( node = node.offsetParent )
		{
			topPos += node.offsetTop;
			leftPos += node.offsetLeft;
		}
	}
	
	return [topPos, leftPos];
}

function FMCScrollToVisible( win, node )
{
	var offset			= 0;
    
    if ( typeof( window.innerWidth ) != "undefined" && !FMCIsSafari() )
    {
		offset = 19;
    }
    
    var scrollTop		= FMCGetScrollTop( win );
    var scrollBottom	= scrollTop + FMCGetClientHeight( win, false ) - offset;
    var scrollLeft		= FMCGetScrollLeft( win );
    var scrollRight		= scrollLeft + FMCGetClientWidth( win, false ) - offset;
    
    var nodePos			= FMCGetPosition( node );
    var nodeTop			= nodePos[0];
    var nodeLeft		= parseInt( node.style.textIndent ) + nodePos[1];
    var nodeHeight		= node.offsetHeight;
    var nodeWidth		= node.getElementsByTagName( "a" )[0].offsetWidth;
    
    if ( nodeTop < scrollTop )
    {
        FMCSetScrollTop( win, nodeTop );
    }
    else if ( nodeTop + nodeHeight > scrollBottom )
    {
        FMCSetScrollTop( win, Math.min( nodeTop, nodeTop + nodeHeight - FMCGetClientHeight( win, false ) + offset ) );
    }
    
    if ( nodeLeft < scrollLeft )
    {
        FMCSetScrollLeft( win, nodeLeft );
    }
    else if ( nodeLeft + nodeWidth > scrollRight )
    {
		FMCSetScrollLeft( win, Math.min( nodeLeft, nodeLeft + nodeWidth - FMCGetClientWidth( win, false ) + offset ) );
    }
}

function FMCIsQuirksMode( winNode )
{
	return FMCIsIE55() || (winNode.document.compatMode && winNode.document.compatMode == "BackCompat");
}

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

function FMCGetComputedStyle( node, style )
{
    var value   = null;
    
    if ( node.currentStyle )
    {
        value = node.currentStyle[style];
    }
    else if ( document.defaultView && document.defaultView.getComputedStyle )
    {
		var computedStyle	= document.defaultView.getComputedStyle( node, null );
		
		if ( computedStyle )
		{
			value = computedStyle[style];
		}
    }
    
    return value;
}

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

function FMCConvertToPx( doc, str, dimension, defaultValue )
{
    if ( !str || str.charAt( 0 ) == "-" )
    {
        return defaultValue;
    }
    
    if ( str.charAt( str.length - 1 ) == "\%" )
    {
        switch (dimension)
        {
            case "Width":
                return parseInt( str ) * screen.width / 100;
                
                break;
            case "Height":
                return parseInt( str ) * screen.height / 100;
                
                break;
        }
    }
    else
    {
		if ( parseInt( str ).toString() == str )
		{
			str += "px";
		}
    }
    
    try
    {
        var div	= doc.createElement( "div" );
    }
    catch ( err )
    {
        return defaultValue;
    }
    
    doc.body.appendChild( div );
    
    var value	= defaultValue;
    
    try
    {
        div.style.width = str;
        
        if ( div.currentStyle )
		{
			value = div.offsetWidth;
		}
		else if ( document.defaultView && document.defaultView.getComputedStyle )
		{
			value = parseInt( FMCGetComputedStyle( div, "width" ) );
		}
    }
    catch ( err )
    {
    }
    
    doc.body.removeChild( div );
    
    return value;
}

function FMCGetControl( el )
{
	var value	= null;
	
	if ( el.type == "checkbox" )
	{
		value = el.checked;
	}
	else
	{
		value = el.value;
	}
	
	return value;
}

function FMCGetOpacity( el )
{
	var opacity	= -1;
	
	if ( el.filters )
	{
	    if (el.style.filter != "")
	    {
	        opacity = parseInt(el.style.filter.substring(17, el.style.filter.length - 2));
	    }
	}
	else if ( el.style.MozOpacity != null )
	{
		opacity = parseFloat( el.style.MozOpacity ) * 100;
	}
    else
    {
        opacity = parseFloat(el.style.opacity) * 100;
    }
	
	return opacity;
}

function FMCSetOpacity( el, opacityPercent )
{
	if ( el.filters )
	{
		// IE bug: If a text input field is contained within an element that has an opacity set and it contains too much text to fit inside it,
		// using the keyboard to move the cursor to scroll the text will result in the text not "refreshing" in the text input field.
		// The workaround is to set the opacity to "" in IE when it becomes 100. That way, the cursor issue will be fixed inside our dialogs
		// which fade in to 100% opacity when they're opened.
		
		if ( opacityPercent == 100 )
		{
			el.style.filter = "";
		}
		else
		{
			el.style.filter = "alpha( opacity = " + opacityPercent + " )";
		}
	}
	else if ( el.style.MozOpacity != null )
	{
		el.style.MozOpacity = opacityPercent / 100;
	}
    else
    {
        el.style.opacity = opacityPercent / 100;
    }
}

function FMCToggleDisplay( el )
{
	if ( el.style.display == "none" )
	{
		el.style.display = "";
	}
	else
	{
		el.style.display = "none";
	}
}

function FMCGetContainingIFrame( win )
{
	var allIFrames = win.parent.document.getElementsByTagName( "iframe" );
	
	for ( var i = 0, length = allIFrames.length; i < length; i++ )
	{
		var currIFrame = allIFrames[i];
		
		if ( FMCGetAttribute( currIFrame, "name" ) == win.name )
		{
			return currIFrame;
		}
	}
	
	return null;
}

function FMCIsChildNode( childNode, parentNode )
{
	var	doc	= parentNode.ownerDocument;
	
	if ( childNode == null )
	{
		return null;
	}
	
	for ( var currNode = childNode; ; currNode = currNode.parentNode )
	{
		if ( currNode == parentNode )
		{
			return true;
		}
		
		if ( currNode == doc.body )
		{
			return false;
		}
	}
}

function FMCIsInDom( el )
{
	var isInDom = false;
	
	// Accessing el.offsetParent when the element isn't in the DOM might throw an exception.
	
	try
	{
		isInDom = el.offsetParent != null;
	}
	catch ( ex )
	{
	}
	
	return isInDom;
}

function FMCStripCssUrl( url )
{
	if ( !url )
	{
		return null;
	}
	
	var regex	= /url\(\s*(['\"]?)([^'\"\s]*)\1\s*\)/;
	var match	= regex.exec( url );
	
	if ( match )
	{
		return match[2];
	}
	
	return url;
}

function FMCCreateCssUrl( path )
{
	return "url(\"" + path + "\")";
}

function FMCGetPropertyValue( propertyNode, defaultValue )
{
	var propValue	= defaultValue;
	var valueNode	= propertyNode.firstChild;
	
	if ( valueNode )
	{
		propValue = valueNode.nodeValue;
	}
	
	return propValue;
}

function FMCParseInt( str, defaultValue )
{
	var num	= parseInt( str );

	if ( num.toString() == "NaN" )
	{
		num = defaultValue;
	}
	
	return num;
}

function FMCConvertBorderToPx( doc, value )
{
	var newValue	= "";
	var valueParts	= value.split( " " );

	for ( var i = 0; i < valueParts.length; i++ )
	{
		var currPart	= valueParts[i];
		
		if ( i == 1 )
		{
			currPart = FMCConvertToPx( doc, currPart, null, currPart );
			
			if ( parseInt( currPart ).toString() == currPart )
			{
				currPart += "px";
			}
		}

		if ( !String.IsNullOrEmpty( currPart ) )
		{
			newValue += (((i > 0) ? " " : "") + currPart);
		}
	}
	
	return newValue;
}

function FMCUnhide( win, node )
{
    for ( var currNode = node.parentNode; currNode.nodeName != "BODY"; currNode = currNode.parentNode )
    {
        if ( currNode.style.display == "none" )
        {
            var classRoot   = FMCContainsClassRoot( currNode.className, "MCExpandingBody", "MCDropDownBody", "MCTextPopupBody" );
            
            if ( classRoot == "MCExpandingBody" )
            {
                win.FMCExpand( currNode.parentNode.getElementsByTagName("a")[0] );
            }
            else if ( classRoot == "MCDropDownBody" )
            {
                var dropDownBodyID  = currNode.id.substring( "MCDropDownBody".length + 1, currNode.id.length );
                var aNodes          = currNode.parentNode.getElementsByTagName( "a" );
                
                for ( var i = 0; i < aNodes.length; i++ )
                {
                    var aNode   = aNodes[i];
                    
                    if ( aNode.id.substring( "MCDropDownHotSpot".length + 1, aNode.id.length ) == dropDownBodyID )
                    {
                        win.FMCDropDown( aNode );
                    }
                }
            }
            else if ( FMCGetMCAttribute( currNode, "MadCap:targetName" ) )
            {
                var targetName      = FMCGetMCAttribute( currNode, "MadCap:targetName" );
                var togglerNodes    = FMCGetElementsByClassRoot( win.document.body, "MCToggler" );
                
                for ( var i = 0; i < togglerNodes.length; i++ )
                {
                    var targets = FMCGetMCAttribute( togglerNodes[i], "MadCap:targets" ).split( ";" );
                    var found   = false;
                    
                    for ( var j = 0; j < targets.length; j++ )
                    {
                        if ( targets[j] == targetName )
                        {
                            found = true;
                            
                            break;
                        }
                    }
                    
                    if ( !found )
                    {
                        continue;
                    }
                    
                    win.FMCToggler( togglerNodes[i] );
                    
                    break;
                }
            }
            else if ( classRoot == "MCTextPopupBody" )
            {
                continue;
            }
            else if (FMCHasClass(currNode, "MCWebHelpFramesetLink"))
            {
                continue;
            }
            else
            {
                currNode.style.display = "";
            }
        }
    }
}

function StartLoading( win, parentElement, loadingLabel, loadingAltText, fadeElement )
{
	if ( !win.MCLoadingCount )
	{
		win.MCLoadingCount = 0;
	}
	
	win.MCLoadingCount++;
	
	if ( win.MCLoadingCount > 1 )
	{
		return;
	}
	
	//
	
	if ( fadeElement )
	{
		// IE bug: This causes the tab outline not to show and also causes the TOC entry fonts to look bold.
		//	if ( fadeElement.filters )
		//	{
		//		fadeElement.style.filter = "alpha( opacity = 10 )";
		//	}
		/*else*/ if ( fadeElement.style.MozOpacity != null )
		{
			fadeElement.style.MozOpacity = "0.1";
		}
	}

	var span		= win.document.createElement( "span" );
	var img			= win.document.createElement( "img" );
	var midPointX	= FMCGetScrollLeft( win ) + FMCGetClientWidth( win, false ) / 2;
	var spacing		= 3;

	parentElement.appendChild( span );

	span.id = "LoadingText";
	span.appendChild( win.document.createTextNode( loadingLabel ) );
	span.style.fontFamily = "Tahoma, Sans-Serif";
	span.style.fontSize = "9px";
	span.style.fontWeight = "bold";
	span.style.position = "absolute";
	span.style.left = (midPointX - (span.offsetWidth / 2)) + "px";

	img.id = "LoadingImage";
	img.src = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Loading.gif";
	img.alt = loadingAltText;
	img.style.width = "70px";
	img.style.height = "13px";
	img.style.position = "absolute";
	img.style.left = (midPointX - (70/2)) + "px";

	var totalHeight	= span.offsetHeight + spacing + parseInt( img.style.height );
	var spanTop		= (FMCGetScrollTop( win ) + (FMCGetClientHeight( win, false ) - totalHeight)) / 2;

	span.style.top = spanTop + "px";
	img.style.top = spanTop + span.offsetHeight + spacing + "px";

	parentElement.appendChild( img );
}

function EndLoading( win, fadeElement )
{
	win.MCLoadingCount--;
	
	if ( win.MCLoadingCount > 0 )
	{
		return;
	}
	
	//
	
	var span	= win.document.getElementById( "LoadingText" );
	var img		= win.document.getElementById( "LoadingImage" );

	if (span != null && span.parentNode != null) {
	    span.parentNode.removeChild(span);
	}
	if (img != null && img.parentNode != null) {
	    img.parentNode.removeChild(img);
	}

	if ( fadeElement )
	{
		// IE bug: This causes the tab outline not to show and also causes the TOC entry fonts to look bold.
		//	if ( fadeElement.filters )
		//	{
		//		fadeElement.style.filter = "alpha( opacity = 100 )";
		//	}
		/*else*/ if ( fadeElement.style.MozOpacity != null )
		{
			fadeElement.style.MozOpacity = "1.0";
		}
	}
}

var MCEventType	= new Object();

MCEventType.OnLoad	= 0;
MCEventType.OnInit	= 1;
MCEventType.OnReady = 2;

function FMCRegisterCallback( frameName, eventType, CallbackFunc, callbackArgs )
{
	function FMCCheckMCGlobalsInitialized()
	{
		if ( MCGlobals.GetIsInitialized() )
		{
			CallbackFunc( callbackArgs );
		}
		else
		{
		    setTimeout(FMCCheckMCGlobalsInitialized, REGISTER_CALLBACK_INTERVAL);
		}
	}

	function FMCCheckRootReady()
	{
	    function OnGetReady(isReady)
	    {
	        if (isReady)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckRootReady, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.RootFrame, "gReady", null, function (data)
	    {
	        var isReady = FMCStringToBool(data[0]);

	        OnGetReady(isReady);
	    }, function ()
	    {
	        OnGetReady(MCGlobals.RootFrame.gReady);
	    });
	}

	function FMCCheckRootLoaded()
	{
	    function OnGetLoaded(isLoaded)
	    {
            if (isLoaded)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckRootLoaded, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.RootFrame, "gLoaded", null, function (data)
	    {
	        var isLoaded = FMCStringToBool(data[0]);

	        OnGetLoaded(isLoaded);
	    }, function ()
	    {
	        OnGetLoaded(MCGlobals.RootFrame.gLoaded);
	    });
	}

	function FMCCheckRootInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckRootInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.RootFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.RootFrame.gInit);
	    });
	}

	function FMCCheckTOCInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckTOCInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["toc"], "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.NavigationFrame.frames["toc"].gInit);
	    });
	}

	function FMCCheckSearchInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckSearchInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["search"], "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.NavigationFrame.frames["search"].gInit);
	    });
	}

	function FMCCheckBodyCommentsLoaded()
	{
	    function OnGetLoaded(isLoaded)
	    {
	        if (isLoaded)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckBodyCommentsLoaded, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.BodyCommentsFrame, "gLoaded", null, function (data)
	    {
	        var isLoaded = FMCStringToBool(data[0]);

	        OnGetLoaded(isLoaded);
	    }, function ()
	    {
	        OnGetLoaded(MCGlobals.BodyCommentsFrame.gLoaded);
	    });
	}

	function FMCCheckBodyCommentsInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckBodyCommentsInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.BodyCommentsFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.BodyCommentsFrame.gInit);
	    });
	}

	function FMCCheckToolbarInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckToolbarInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.ToolbarFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.ToolbarFrame.gInit);
	    });
	}

	function FMCCheckNavigationReady()
	{
	    function OnGetReady(isReady)
	    {
	        if (isReady)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckNavigationReady, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.NavigationFrame, "gReady", null, function (data)
	    {
	        var isReady = FMCStringToBool(data[0]);

	        OnGetReady(isReady);
	    }, function ()
	    {
	        OnGetReady(MCGlobals.NavigationFrame.gReady);
	    });
	}

	function FMCCheckNavigationLoaded()
	{
	    function OnGetLoaded(isLoaded)
	    {
	        if (isLoaded)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckNavigationLoaded, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.NavigationFrame, "gLoaded", null, function (data)
	    {
	        var isLoaded = FMCStringToBool(data[0]);

	        OnGetLoaded(isLoaded);
	    }, function ()
	    {
	        OnGetLoaded(MCGlobals.NavigationFrame.gLoaded);
	    });
	}

	function FMCCheckNavigationInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckNavigationInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.NavigationFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.NavigationFrame.gInit);
	    });
	}

    // This function no longer works for external topics but that's ok since the only callers of this function aren't affected by that.
	function FMCCheckBodyReady()
	{
	    function OnGetReady(isReady)
	    {
	        if (isReady)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckBodyReady, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.BodyFrame, "gReady", null, function (data)
	    {
	        var isReady = FMCStringToBool(data[0]);

	        OnGetReady(isReady);
	    }, function ()
	    {
	        OnGetReady(MCGlobals.BodyFrame.gReady);
	    });
	}

	function FMCCheckBodyLoaded()
	{
	    function OnGetLoaded(isLoaded)
	    {
	        if (isLoaded)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckBodyLoaded, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.BodyFrame, "gLoaded", null, function (data)
	    {
	        var isLoaded = FMCStringToBool(data[0]);

	        OnGetLoaded(isLoaded);
	    }, function ()
	    {
	        OnGetLoaded(MCGlobals.BodyFrame.gLoaded);
	    });
	}
	
	function FMCCheckBodyInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckBodyInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.BodyFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.BodyFrame.gInit);
	    });
	}

	function FMCCheckPersistenceInitialized()
	{
	    function OnGetInit(isInit)
	    {
	        if (isInit)
	        {
	            CallbackFunc(callbackArgs);
	        }
	        else
	        {
	            setTimeout(FMCCheckPersistenceInitialized, REGISTER_CALLBACK_INTERVAL);
	        }
	    }

	    FMCPostMessageRequest(MCGlobals.PersistenceFrame, "gInit", null, function (data)
	    {
	        var isInit = FMCStringToBool(data[0]);

	        OnGetInit(isInit);
	    }, function ()
	    {
	        OnGetInit(MCGlobals.PersistenceFrame.gInit);
	    });
	}
	
	var func	= null;
	
	if ( frameName == "TOC" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckTOCLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckTOCInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckTOCReady; }
	}
	else if ( frameName == "Toolbar" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckToolbarLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckToolbarInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckToolbarReady; }
	}
	else if ( frameName == "BodyComments" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckBodyCommentsLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckBodyCommentsInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckBodyCommentsReady; }
	}
	else if ( frameName == "Persistence" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckPersistenceLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckPersistenceInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckPersistenceReady; }
	}
	else if ( frameName == "Search" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckSearchLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckSearchInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckSearchReady; }
	}
	else if ( frameName == "MCGlobals" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckMCGlobalsLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckMCGlobalsInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckMCGlobalsReady; }
	}
	else if ( frameName == "Navigation" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckNavigationLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckNavigationInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckNavigationReady; }
	}
	else if ( frameName == "Body" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckBodyLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckBodyInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckBodyReady; }
	}
	else if ( frameName == "Root" )
	{
		if ( eventType == MCEventType.OnLoad ) { func = FMCCheckRootLoaded; }
		else if ( eventType == MCEventType.OnInit ) { func = FMCCheckRootInitialized; }
		else if ( eventType == MCEventType.OnReady ) { func = FMCCheckRootReady; }
	}

    window.setTimeout(func, REGISTER_CALLBACK_INTERVAL);
}

function FMCSortStringArray( stringArray )
{
	stringArray.sort( FMCCompareStrings );
}

function FMCCompareStrings( a, b )
{
	var ret;

	if ( a.toLowerCase() < b.toLowerCase() )
	{
		ret = -1;
	}
	else if ( a.toLowerCase() == b.toLowerCase() )
	{
		ret = 0;
	}
	else if ( a.toLowerCase() > b.toLowerCase() )
	{
		ret = 1;
	}

	return ret;
}

function FMCCreateLocalStorageKey(name)
{
    return MCGlobals.RootFolder + "|" + name;
}

function FMCIsNumeric(value)
{
    var regex = /^[0-9]+$/;
    return regex.test(value);
}

function FMCIsValidCookie(value) 
{
    var regex = /^[\w\u00A0 -.~:/?#\[\]@!$&'()*+,;=|%]*$/;
    return regex.test(value);
}

function FMCSetCookie(name, value, days)
{
    if (!FMCIsValidCookie(name))
        return;

    if (!FMCIsValidCookie(value))
        return;

    if (window.localStorage)
    {
        var key = FMCCreateLocalStorageKey(name);

        return window.localStorage.setItem(key, value);
    }

	if ( window.name != "bridge" )
	{
	    var cookieFrame = FMCIsDotNetHelp() ? MCGlobals.BodyCommentsFrame : MCGlobals.NavigationFrame;

	    if (window != cookieFrame)
	    {
	        cookieFrame.FMCSetCookie(name, value, days);

	        return;
	    }
	}
	
	value = encodeURI( value );
	
	var expires = "";

	if (days && FMCIsNumeric(days))
	{
	    var date = new Date();

	    date.setTime(date.getTime() + (1000 * 60 * 60 * 24 * days));

	    expires = "; expires=" + date.toGMTString();
	}

//	var rootFrame	= FMCGetRootFrame();
//	var navFrame	= rootFrame.frames["navigation"];
//	var path		= FMCGetPathnameFolder( navFrame.document.location );

//	navFrame.document.cookie = name + "=" + value + expires + ";" + " path=" + path + ";";

	var cookieString = name + "=" + value + expires + ";";
	
	document.cookie = cookieString;
}

function FMCReadCookie( name )
{
    if (window.localStorage)
    {
        var key = FMCCreateLocalStorageKey(name);

        return window.localStorage.getItem(key);
    }

	if ( window.name != "bridge" )
	{
	    var cookieFrame = FMCIsDotNetHelp() ? MCGlobals.BodyCommentsFrame : MCGlobals.NavigationFrame;

	    if (window != cookieFrame)
	    {
	        return cookieFrame.FMCReadCookie(name);
	    }
	}
	
	var value		= null;
	var nameEq		= name + "=";
//	var rootFrame	= FMCGetRootFrame();
//	var navFrame	= rootFrame.frames["navigation"];
//	var cookies		= navFrame.document.cookie.split( ";" );
	var cookies		= document.cookie.split( ";" );

	for ( var i = 0; i < cookies.length; i++ )
	{
		var cookie	= cookies[i];
	    
		cookie = FMCTrim( cookie );
	    
		if ( cookie.indexOf( nameEq ) == 0 )
		{
			value = cookie.substring( nameEq.length, cookie.length );
			value = decodeURI( value );
			
			break;
		}
	}

	return value;
}

function FMCRemoveCookie( name )
{
    if (window.localStorage)
    {
        return window.localStorage.removeItem(name);
    }

	FMCSetCookie( name, "", -1 );
}

function FMCLoadUserData( name )
{
	if ( FMCIsHtmlHelp() )
	{
		var persistFrame	= MCGlobals.PersistenceFrame;
		var persistDiv		= persistFrame.document.getElementById( "Persist" );
		
		persistDiv.load( "MCXMLStore" );
		
		var value	= persistDiv.getAttribute( name );
		
		return value;
	}
	else
	{
		return FMCReadCookie( name );
	}
}

function FMCSaveUserData( name, value )
{
	if ( FMCIsHtmlHelp() )
	{
		var persistFrame	= MCGlobals.PersistenceFrame;
		var persistDiv		= persistFrame.document.getElementById( "Persist" );
		
		persistDiv.setAttribute( name, value );
		persistDiv.save( "MCXMLStore" );
	}
	else
	{
		FMCSetCookie( name, value, 36500 );
	}
}

function FMCRemoveUserData( name )
{
	if ( FMCIsHtmlHelp() )
	{
		var persistFrame	= MCGlobals.PersistenceFrame;
		var persistDiv		= persistFrame.document.getElementById( "Persist" );
		
		persistDiv.removeAttribute( name );
		persistDiv.save( "MCXMLStore" );
	}
	else
	{
		FMCRemoveCookie( name );
	}
}

function FMCInsertOpacitySheet( winNode, color )
{
	if ( winNode.document.getElementById( "MCOpacitySheet" ) != null )
	{
		return;
	}
	
	var div		= winNode.document.createElement( "div" );
	var style	= div.style;
	
	div.id = "MCOpacitySheet";
	style.position = "absolute";
	style.top = FMCGetScrollTop( winNode ) + "px";
	style.left = FMCGetScrollLeft( winNode ) + "px";
	style.width = FMCGetClientWidth( winNode, false ) + "px";
	style.height = FMCGetClientHeight( winNode, false ) + "px";
	style.backgroundColor = color;
	style.zIndex = "100";
	
	winNode.document.body.appendChild( div );
	
	FMCSetOpacity( div, 75 );
}

function FMCRemoveOpacitySheet( winNode )
{
	var div	= winNode.document.getElementById( "MCOpacitySheet" );
	
	if ( !div )
	{
		return;
	}
	
	div.parentNode.removeChild( div );
}

function FMCSetupButtonFromStylesheet( tr, styleName, styleClassName, defaultOutPath, defaultOverPath, defaultSelectedPath, defaultWidth, defaultHeight, defaultTooltip, defaultLabel, OnClickHandler )
{
	var td					= document.createElement( "td" );
	var outImagePath		= CMCFlareStylesheet.LookupValue( styleName, styleClassName, "Icon", null );
	var overImagePath		= CMCFlareStylesheet.LookupValue( styleName, styleClassName, "HoverIcon", null );
	var selectedImagePath	= CMCFlareStylesheet.LookupValue( styleName, styleClassName, "PressedIcon", null );
	
	if ( outImagePath == null )
	{
		outImagePath = defaultOutPath;
	}
	else
	{
		outImagePath = FMCStripCssUrl( outImagePath );
		outImagePath = FMCGetSkinFolderAbsolute() + outImagePath;
	}
	
	if ( overImagePath == null )
	{
		overImagePath = defaultOverPath;
	}
	else
	{
		overImagePath = FMCStripCssUrl( overImagePath );
		overImagePath = FMCGetSkinFolderAbsolute() + overImagePath;
	}
	
	if ( selectedImagePath == null )
	{
		selectedImagePath = defaultSelectedPath;
	}
	else
	{
		selectedImagePath = FMCStripCssUrl( selectedImagePath );
		selectedImagePath = FMCGetSkinFolderAbsolute() + selectedImagePath;
	}

	tr.appendChild( td );
	
	var title	= CMCFlareStylesheet.LookupValue( styleName, styleClassName, "Tooltip", defaultTooltip );
	var label	= CMCFlareStylesheet.LookupValue( styleName, styleClassName, "Label", defaultLabel );
	var width	= CMCFlareStylesheet.GetResourceProperty( outImagePath, "Width", defaultWidth );
	var height	= CMCFlareStylesheet.GetResourceProperty( outImagePath, "Height", defaultHeight );
	
	MakeButton( td, title, outImagePath, overImagePath, selectedImagePath, width, height, label );
	td.getElementsByTagName("button")[0].onclick = OnClickHandler;
}

function FMCEscapeRegEx( str )
{
	return str.replace( /([*^$+?.()[\]{}|\\])/g, "\\$1" );
}

//
//    End helper functions
//

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

//
//    Class CMCXmlParser
//

function CMCXmlParser( args, LoadFunc, loadContextObj )
{
	// Private member variables and functions
	
	var mSelf		= this;
    this.mXmlDoc	= null;
    this.mXmlHttp	= null;
    this.mArgs		= args;
    this.mLoadFunc	= LoadFunc;
    this.mLoadContextObj = loadContextObj;

    this.OnreadystatechangeLocal = function ()
    {
        if (mSelf.mXmlDoc.readyState == 4)
        {
            mSelf.mXmlDoc.onreadystatechange = CMCXmlParser.Noop;

            var xmlDoc = null;

            if (mSelf.mXmlDoc.documentElement != null)
            {
                xmlDoc = mSelf.mXmlDoc;
            }

            if (mSelf.mLoadContextObj == null)
            {
                mSelf.mLoadFunc(xmlDoc, mSelf.mArgs);
            }
            else
            {
                mSelf.mLoadFunc.call(mSelf.mLoadContextObj, xmlDoc, mSelf.mArgs);
            }
        }
    };

    this.OnreadystatechangeRemote = function ()
    {
        if (mSelf.mXmlHttp.readyState == 4)
        {
            mSelf.mXmlHttp.onreadystatechange = CMCXmlParser.Noop;

            var xmlDoc = null;

            if (mSelf.mXmlHttp.responseXML != null && mSelf.mXmlHttp.responseXML.documentElement != null)
            {
                xmlDoc = mSelf.mXmlHttp.responseXML;
            }

            if (mSelf.mLoadContextObj == null)
            {
                mSelf.mLoadFunc(xmlDoc, mSelf.mArgs);
            }
            else
            {
                mSelf.mLoadFunc.call(mSelf.mLoadContextObj, xmlDoc, mSelf.mArgs);
            }
        }
    };
}

CMCXmlParser.prototype.LoadLocal = function (xmlFile, async)
{
    if (window.ActiveXObject)
    {
        this.mXmlDoc = CMCXmlParser.GetMicrosoftXmlDomObject();
        this.mXmlDoc.async = async;

        if (this.mLoadFunc)
        {
            this.mXmlDoc.onreadystatechange = this.OnreadystatechangeLocal;
        }

        try
        {
            if (!this.mXmlDoc.load(xmlFile))
            {
                this.mXmlDoc = null;
            }
        }
        catch (err)
        {
            this.mXmlDoc = null;
        }
    }
    else if (window.XMLHttpRequest)
    {
        this.LoadRemote(xmlFile, async); // window.XMLHttpRequest also works on local files
    }

    return this.mXmlDoc;
};

CMCXmlParser.prototype.LoadRemote	= function( xmlFile, async )
{
    if (window.ActiveXObject) {
        this.mXmlHttp = CMCXmlParser.GetMicrosoftXmlHttpObject();
    }
    else if ( window.XMLHttpRequest )
    {
        xmlFile = xmlFile.replace( /;/g, "%3B" );   // For Safari
        this.mXmlHttp = new XMLHttpRequest();
    }

    if (FMCIsEclipseHelp() && window.XDomainRequest) {
        this.mXmlHttp = new XDomainRequest();
    }
    
    if ( this.mLoadFunc )
    {
		this.mXmlHttp.onreadystatechange = this.OnreadystatechangeRemote;
    }
    
    try
    {
		this.mXmlHttp.open( "GET", xmlFile, async );
        this.mXmlHttp.send( null );
        
        if ( !async && (this.mXmlHttp.status == 0 || this.mXmlHttp.status == 200) )
        {
            this.mXmlDoc = this.mXmlHttp.responseXML;
		}
    }
    catch ( err )
    {
        this.mXmlHttp.abort();

        if (this.mLoadFunc)
        {
            if (this.mLoadContextObj == null)
            {
                this.mLoadFunc(null, this.mArgs);
            }
            else
            {
                this.mLoadFunc.call(this.mLoadContextObj, null, this.mArgs);
            }
        }
    }
    
    return this.mXmlDoc;
};

// Public member functions

CMCXmlParser.prototype.Load	= function( xmlFile, async )
{
	var xmlDoc			= null;
	var protocolType	= document.location.protocol;

	if (protocolType == "file:" || protocolType == "mk:" || protocolType == "ms-its:" || protocolType == "app:")
	{
		xmlDoc = this.LoadLocal( xmlFile, async );
	}
	else if ( protocolType == "http:" || protocolType == "https:" )
	{
		xmlDoc = this.LoadRemote( xmlFile, async );
	}
	
	return xmlDoc;
};

// Static properties

CMCXmlParser.MicrosoftXmlDomProgIDs = [ "Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument", "Microsoft.XMLDOM" ];
CMCXmlParser.MicrosoftXmlHttpProgIDs = [ "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP" ];
CMCXmlParser.MicrosoftXmlDomProgID = null;
CMCXmlParser.MicrosoftXmlHttpProgID = null;

// Static member functions

CMCXmlParser.Noop = function ()
{
};

CMCXmlParser.GetMicrosoftXmlDomObject = function()
{
	var obj = null;
	
	if ( CMCXmlParser.MicrosoftXmlDomProgID == null )
	{
		for ( var i = 0; i < CMCXmlParser.MicrosoftXmlDomProgIDs.length; i++ )
		{
			var progID = CMCXmlParser.MicrosoftXmlDomProgIDs[i];
			
			try
			{
				obj = new ActiveXObject( progID );
				
				CMCXmlParser.MicrosoftXmlDomProgID = progID;
				
				break;
			}
			catch ( ex )
			{
			}
		}
	}
	else
	{
		obj = new ActiveXObject( CMCXmlParser.MicrosoftXmlDomProgID );
	}
	
	return obj;
};

CMCXmlParser.GetMicrosoftXmlHttpObject = function()
{
	var obj = null;
	
	if ( CMCXmlParser.MicrosoftXmlHttpProgID == null )
	{
		for ( var i = 0; i < CMCXmlParser.MicrosoftXmlHttpProgIDs.length; i++ )
		{
			var progID = CMCXmlParser.MicrosoftXmlHttpProgIDs[i];
			
			try
			{
				obj = new ActiveXObject( progID );
				
				CMCXmlParser.MicrosoftXmlHttpProgID = progID;
				
				break;
			}
			catch ( ex )
			{
			}
		}
	}
	else
	{
		obj = new ActiveXObject( CMCXmlParser.MicrosoftXmlHttpProgID );
	}
	
	return obj;
};

CMCXmlParser._FilePathToXmlStringMap = new CMCDictionary();
CMCXmlParser._LoadingFilesPathMap = new CMCDictionary();
CMCXmlParser._LoadingFromQueue = false;

CMCXmlParser.GetXmlDoc = function (xmlFile, async, LoadFunc, args, loadContextObj) {
    function OnScriptLoaded() {
        LoadScript(true);
    }

    function OnScriptError() {
        LoadScript(false);
    }

    function LoadScript(success) {
        CMCXmlParser._LoadingFilesPathMap.Remove(jsFileUrl.FullPath);

        if (success) {
        var xmlString = CMCXmlParser._FilePathToXmlStringMap.GetItem(jsFileUrl.Name);
        CMCXmlParser._FilePathToXmlStringMap.Remove(jsFileUrl.FullPath);
        xmlDoc = CMCXmlParser.LoadXmlString(xmlString);
        }

        // Check if there are any more in the queue. Do this before calling the callback function since the callback function might invoke another call to this same function.
        CMCXmlParser._LoadingFilesPathMap.ForEach(function (key, value) {
            var loadingFileUrl = new CMCUrl(key);
            var loadInfo = value;

            if (loadingFileUrl.Name == fileName && loadingFileUrl.FullPath != jsFileUrl.FullPath) {
                CMCXmlParser._LoadingFilesPathMap.Remove(loadingFileUrl.FullPath);
                CMCXmlParser._LoadingFromQueue = true;
                CMCXmlParser.GetXmlDoc(loadingFileUrl.FullPath, loadInfo.async, loadInfo.LoadFunc, loadInfo.args, loadInfo.loadContextObj);

                return false;
            }

            return true;
        });

        // Call the callback function
        if (loadContextObj == null) {
            LoadFunc(xmlDoc, args);
        }
        else {
            LoadFunc.call(loadContextObj, xmlDoc, args);
        }
    }

    var xmlDoc = null;

    if (FMCIsLocal() && !FMCIsDotNetHelp() && !FMCIsHtmlHelp()) { // DotNetHelp and HtmlHelp do not generate js files
        var xmlFileUrl = new CMCUrl(xmlFile);
        var jsFileUrl = xmlFileUrl.ToExtension("js");
        var fileName = jsFileUrl.Name;

        CMCXmlParser._LoadingFilesPathMap.Add(jsFileUrl.FullPath, { async: async, LoadFunc: LoadFunc, args: args, loadContextObj: loadContextObj });

        var loadingFileWithSameName = false;

        CMCXmlParser._LoadingFilesPathMap.ForEach(function (key, value) {
            var loadingFileUrl = new CMCUrl(key);
            var loadInfo = value;

            if (loadingFileUrl.Name == fileName && loadingFileUrl.FullPath != jsFileUrl.FullPath) {
                loadingFileWithSameName = true;

                return false;
            }

            return true;
        });

        if (CMCXmlParser._LoadingFromQueue || !loadingFileWithSameName) {
            CMCXmlParser._LoadingFromQueue = false;

            //

            var scriptEl = document.createElement("script");
            scriptEl.src = jsFileUrl.FullPath;
            scriptEl.type = "text/javascript";

            if (scriptEl.addEventListener) {
                scriptEl.addEventListener("load", OnScriptLoaded, false);
                scriptEl.addEventListener("error", OnScriptError, false);
            }
            else if (scriptEl.readyState) {
                scriptEl.onreadystatechange = function () {
                    if (scriptEl.readyState == "loaded" || scriptEl.readyState == "complete") {
                        OnScriptLoaded();
                    }
                };
            }

            document.getElementsByTagName("head")[0].appendChild(scriptEl);
        }
    }
    else {
        var xmlParser = new CMCXmlParser(args, LoadFunc, loadContextObj);

        xmlDoc = xmlParser.Load(xmlFile, async);
    }

    return xmlDoc;
};

CMCXmlParser.LoadXmlString	= function( xmlString )
{
	var xmlDoc	= null;
	
	if ( window.ActiveXObject )
	{
		xmlDoc = CMCXmlParser.GetMicrosoftXmlDomObject();
		xmlDoc.async = false;
		xmlDoc.loadXML( xmlString );
	}
	else if ( DOMParser )
	{
		var parser	= new DOMParser();
		
		xmlDoc = parser.parseFromString( xmlString, "text/xml" );
	}
    
    return xmlDoc;
}

CMCXmlParser.CreateXmlDocument	= function( rootTagName )
{
	var rootXml	= "<" + rootTagName + " />";
	var xmlDoc	= CMCXmlParser.LoadXmlString( rootXml );
    
    return xmlDoc;
}

CMCXmlParser.GetOuterXml	= function( xmlDoc )
{
	var xml	= null;
	
	if ( window.ActiveXObject )
	{
		xml = xmlDoc.xml;
	}
	else if ( window.XMLSerializer )
	{
		var serializer  = new XMLSerializer();
		
		xml = serializer.serializeToString( xmlDoc );
	}
	
	return xml;
}

CMCXmlParser.CallWebService	= function( webServiceUrl, async, onCompleteFunc, onCompleteArgs )
{
	var xmlParser	= new CMCXmlParser( onCompleteArgs, onCompleteFunc, null );
	var xmlDoc		= xmlParser.LoadRemote( webServiceUrl, async );
    
    return xmlDoc;
}

//
//    End class CMCXmlParser
//

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

//
//    Class CMCFlareStylesheet
//

var CMCFlareStylesheet = new function () {
    // Private member variables

    var mRootNode = null;
    var mInitializedResources = false;
    var mResourceMap = null;

    // Private methods

    function InitializeResources() {
        mInitializedResources = true;
        mResourceMap = new CMCDictionary();

        var resourcesInfos = mRootNode.getElementsByTagName("ResourcesInfo");

        if (resourcesInfos.length > 0) {
            var resources = resourcesInfos[0].getElementsByTagName("Resource");

            for (var i = 0; i < resources.length; i++) {
                var resource = resources[i];
                var properties = new CMCDictionary();
                var name = resource.getAttribute("Name");

                if (!name) { continue; }

                for (var j = 0; j < resource.attributes.length; j++) {
                    var attribute = resource.attributes[j];

                    properties.Add(attribute.nodeName.toLowerCase(), attribute.nodeValue.toLowerCase());
                }

                mResourceMap.Add(name, properties);
            }
        }
    }

    // Public methods

    this.Init = function (OnCompleteFunc) {
        FMCGetStylesheet(function (xmlDoc) {
            if (xmlDoc != null)
                mRootNode = xmlDoc.documentElement;

            OnCompleteFunc();
        });
    };

    this.LookupValue = function (styleName, styleClassName, propertyName, defaultValue) {
        var value = defaultValue;

        if (mRootNode == null) {
            return value;
        }

        var styleNodes = mRootNode.getElementsByTagName("Style");
        var styleNodesLength = styleNodes.length;
        var styleNode = null;

        for (var i = 0; i < styleNodesLength; i++) {
            if (styleNodes[i].getAttribute("Name") == styleName) {
                styleNode = styleNodes[i];
                break;
            }
        }

        if (styleNode == null) {
            return value;
        }

        var styleClassNodes = styleNode.getElementsByTagName("StyleClass");
        var styleClassNode = null;

        for (var i = 0, styleClassNodesLength = styleClassNodes.length; i < styleClassNodesLength; i++) {
            if (styleClassNodes[i].getAttribute("Name") == styleClassName) {
                styleClassNode = styleClassNodes[i];
                break;
            }
        }

        if (styleClassNode == null) {
            return value;
        }

        var propertyNodes = styleClassNode.getElementsByTagName("Property");
        var propertyNode = null;

        for (var i = 0, propertyNodesLength = propertyNodes.length; i < propertyNodesLength; i++) {
            if (propertyNodes[i].getAttribute("Name") == propertyName) {
                propertyNode = propertyNodes[i];
                break;
            }
        }

        if (propertyNode == null) {
            return value;
        }

        value = propertyNode.firstChild.nodeValue;
        value = FMCTrim(value);

        return value;
    };

    this.LookupProperties = function (styleName, styleClassName) {
        var props = new Array();
        var styleNodes = mRootNode.getElementsByTagName("Style");
        var styleNodesLength = styleNodes.length;
        var styleNode = null;

        for (var i = 0; i < styleNodesLength; i++) {
            if (styleNodes[i].getAttribute("Name") == styleName) {
                styleNode = styleNodes[i];
                break;
            }
        }

        if (styleNode == null) {
            return props;
        }

        if (styleClassName == null) {
            var propertyNodes = styleNode.getElementsByTagName("Property");

            for (var i = 0, propertyNodesLength = propertyNodes.length; i < propertyNodesLength; i++) {
                var propertyNode = propertyNodes[i];
                var name = propertyNode.getAttribute("Name");
                var value = FMCGetPropertyValue(propertyNode, null);
                value = FMCTrim(value);

                props[props.length] = { Name: name, Value: value };
            }

            return props;
        }

        var styleClassNodes = styleNode.getElementsByTagName("StyleClass");
        var styleClassNode = null;

        for (var i = 0, styleClassNodesLength = styleClassNodes.length; i < styleClassNodesLength; i++) {
            if (styleClassNodes[i].getAttribute("Name") == styleClassName) {
                styleClassNode = styleClassNodes[i];
                break;
            }
        }

        if (styleClassNode == null) {
            return props;
        }

        var propertyNodes = styleClassNode.getElementsByTagName("Property");

        for (var i = 0, propertyNodesLength = propertyNodes.length; i < propertyNodesLength; i++) {
            var propertyNode = propertyNodes[i];
            var name = propertyNode.getAttribute("Name");
            var value = FMCGetPropertyValue(propertyNode, null);
            value = FMCTrim(value);

            props[props.length] = { Name: name, Value: value };
        }

        return props;
    };

    this.GetResourceProperty = function (name, property, defaultValue) {
        if (!mInitializedResources) {
            InitializeResources();
        }

        var properties = mResourceMap.GetItem(name);

        if (!properties) {
            return defaultValue;
        }

        var propValue = properties.GetItem(property.toLowerCase());

        if (!propValue) {
            return defaultValue;
        }

        return propValue;
    };

    this.SetImageFromStylesheet = function (img, styleName, styleClassName, propertyName, defaultValue, defaultWidth, defaultHeight) {
        var value = this.LookupValue(styleName, styleClassName, propertyName, null);
        var imgSrc = null;

        if (value == null) {
            value = defaultValue;
            imgSrc = value;
        }
        else {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);
            value = escape(value);
            imgSrc = FMCGetSkinFolderAbsolute() + value;
        }

        img.src = imgSrc;
        img.style.width = this.GetResourceProperty(value, "Width", defaultWidth) + "px";
        img.style.height = this.GetResourceProperty(value, "Height", defaultHeight) + "px";
    };
}

//
//    End class CMCFlareStylesheet
//

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

//
//    String helpers
//

String.IsNullOrEmpty = function( str )
{
	if ( str == null )
	{
		return true;
	}
	
	if ( str.length == 0 )
	{
		return true;
	}
	
	return false;
}

String.prototype.StartsWith = function( str, caseSensitive )
{
	if ( str == null )
	{
		return false;
	}
	
	if ( this.length < str.length )
	{
		return false;
	}
	
	var value1	= this;
	var value2	= str;
	
	if ( !caseSensitive )
	{
		value1 = value1.toLowerCase();
		value2 = value2.toLowerCase();
	}
	
	if ( value1.substring( 0, value2.length ) == value2 )
	{
		return true;
	}
	else
	{
		return false;
	}
}

String.prototype.EndsWith = function( str, caseSensitive )
{
	if ( str == null )
	{
		return false;
	}
	
	if ( this.length < str.length )
	{
		return false;
	}
	
	var value1	= this;
	var value2	= str;
	
	if ( !caseSensitive )
	{
		value1 = value1.toLowerCase();
		value2 = value2.toLowerCase();
	}
	
	if ( value1.substring( value1.length - value2.length ) == value2 )
	{
		return true;
	}
	else
	{
		return false;
	}
}

String.prototype.Contains = function( str, caseSensitive )
{
    var value1 = caseSensitive ? this : this.toLowerCase();

    if (FMCIsArray(str))
    {
        for (var i = 0, length = str.length; i < length; i++)
        {
            var value2 = caseSensitive ? str[i] : str[i].toLowerCase();

            if (value1.indexOf(value2) != -1)
                return true;
        }

        return false;
    }

    var value2 = caseSensitive ? str : str.toLowerCase();

    return value1.indexOf(value2) != -1;
}

String.prototype.Equals = function( str, caseSensitive )
{
	var value1	= this;
	var value2	= str;
	
	if ( !caseSensitive )
	{
		value1 = value1.toLowerCase();
		value2 = value2.toLowerCase();
	}
	
	return value1 == value2;
}

String.prototype.CountOf = function( str, caseSensitive )
{
	var count	= 0;
	var value1	= this;
	var value2	= str;
	
	if ( !caseSensitive )
	{
		value1 = value1.toLowerCase();
		value2 = value2.toLowerCase();
	}
	
	var lastIndex	= -1;
	
	while ( true )
	{
		lastIndex = this.indexOf( str, lastIndex + 1 );
		
		if ( lastIndex == -1 )
		{
			break;
		}
		
		count++;
	}
	
	return count;
}

String.prototype.Insert = function( startIndex, value )
{
	var newStr = null;
	
	if ( startIndex >= 0 )
	{
		newStr = this.substring( 0, startIndex );
	}
	else
	{
		newStr = this;
	}
	
	newStr += value;
	
	if ( startIndex >= 0 )
	{
		newStr += this.substring( startIndex );
	}
	
	return newStr;
}

String.prototype.Trim = function()
{
	return this.TrimLeft().TrimRight();
}

String.prototype.TrimLeft = function()
{
	var i = 0;

	for ( i = 0; i < this.length && this.charAt( i ) == " "; i++ );

	return this.substring( i, this.length );
}

String.prototype.TrimRight = function()
{
	var i = 0;

	for ( i = this.length - 1; i >= 0 && this.charAt( i ) == " "; i-- );

	return this.substring( 0, i + 1 );
}

//
//    End String helpers
//

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

//
//    Array helpers
//

Array.prototype.Contains = function( item )
{
	for ( var i = 0, length = this.length; i < length; i++ )
	{
		if ( this[i] == item )
		{
			return true;
		}
	}
	
	return false;
}

Array.prototype.Insert = function( item, index )
{
	if ( index < 0 || index > this.length )
	{
		throw "Index out of bounds.";
	}
	
	this.splice( index, 0, item );
}

Array.prototype.Remove = function( index )
{
	if ( index < 0 || index > this.length )
	{
		throw "Index out of bounds.";
	}

	this.splice( index, 1 );
}

Array.prototype.RemoveValue = function( value )
{
	for ( var i = this.length - 1; i >= 0; i-- )
	{
		if ( this[i] == value )
		{
			this.Remove( i );
		}
	}
}

//
//    End Array helpers
//

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

//
//    Class CMCDictionary
//

function CMCDictionary(ignoreCase)
{
    // Public properties
    
    this.mMap		    = new Object();
    this.mOverflows	    = new Array();
    this.mLength        = 0;
    this.mIgnoreCase    = ignoreCase == true;
}

CMCDictionary.prototype.GetLength	= function( key )
{
	return this.mLength;
};

CMCDictionary.prototype.ForEach	= function( func )
{
	var map	= this.mMap;
	
	for ( var key in map )
	{
		var value	= map[key];
		
		if ( !func( key, value ) )
		{
			return;
		}
	}
	
	var overflows	= this.mOverflows;
	
	for ( var i = 0, length = overflows.length; i < length; i++ )
	{
		var item	= overflows[i];
		
		if ( !func( item.Key, item.Value ) )
		{
			return;
		}
	}
};

CMCDictionary.prototype.GetItem	= function( key )
{
    if (this.mIgnoreCase)
        key = key.toLowerCase();

	var item	= null;
	
	if ( typeof( this.mMap[key] ) == "function" )
	{
		var index	= this.GetItemOverflowIndex( key );
		
		if ( index >= 0 )
		{
			item = this.mOverflows[index].Value;
		}
	}
	else
	{
		item = this.mMap[key];
		
		if ( typeof( item ) == "undefined" )
		{
			item = null;
		}
	}

    return item;
};

CMCDictionary.prototype.GetItemOverflowIndex	= function( key )
{
    if (this.mIgnoreCase)
        key = key.toLowerCase();

	var overflows	= this.mOverflows;
	
	for ( var i = 0, length = overflows.length; i < length; i++ )
	{
		if ( overflows[i].Key == key )
		{
			return i;
		}
	}
	
	return -1;
}

CMCDictionary.prototype.Remove	= function( key )
{
    if (this.mIgnoreCase)
        key = key.toLowerCase();

	if ( typeof( this.mMap[key] ) == "function" )
	{
		var index	= this.GetItemOverflowIndex( key );
		
		if ( index >= 0 )
		{
			this.mOverflows.splice( index, 1 )
			
			this.mLength--;
		}
	}
	else
	{
		if ( this.mMap[key] != "undefined" )
		{
			delete( this.mMap[key] );
			
			this.mLength--;
		}
	}
};

CMCDictionary.prototype.Add	= function( key, value )
{
    if (this.mIgnoreCase)
        key = key.toLowerCase();

	if ( typeof( this.mMap[key] ) == "function" )
	{
		var item	= this.GetItem( key );
		
		if ( item != null )
		{
			this.Remove( key );
		}
		
		this.mOverflows[this.mOverflows.length] = { Key: key, Value: value };
	}
	else
	{
		this.mMap[key] = value;
    }
    
    this.mLength++;
};

CMCDictionary.prototype.AddUnique	= function( key, value )
{
    if (this.mIgnoreCase)
        key = key.toLowerCase();

	var savedValue	= this.GetItem( key );
	
	if ( typeof( savedValue ) == "undefined" || !savedValue )
	{
		this.Add( key, value );
	}
};

//
//    End class CMCDictionary
//

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

/* -CatapultCompiler- -Begin- -Copy to CSH Javascript- */

//
//    Class CMCUrl
//

function CMCUrl( src )
{
	// Private member variables
	
	var mSelf	= this;
	
	// Public properties

	this.FullPath			= null;
	this.Path				= null;
	this.PlainPath			= null;
	this.Name				= null;
	this.Extension			= null;
	this.NameWithExtension	= null;
	this.Fragment			= null;
	this.Query				= null;
	this.IsAbsolute         = false;
	this.QueryMap           = new CMCDictionary(true);
	this.HashMap            = new CMCDictionary(true);

	// Constructor

	(function()
	{
		var fragment	= "";
		var query		= "";
		var fragmentPos	= src.indexOf( "#" );
		var queryPos	= src.indexOf( "?" );
		
		if ( fragmentPos != -1 )
		{
			if ( fragmentPos > queryPos )
			{
				fragment = src.substring( fragmentPos );
			}
			else
			{
				fragment = src.substring( fragmentPos, queryPos );
			}
		}
		
		if ( queryPos != -1 )
		{
			if ( queryPos > fragmentPos )
			{
				query = src.substring( queryPos );
			}
			else
			{
				query = src.substring( queryPos, fragmentPos );
			}
		}
		
		var pos			= Math.max( fragmentPos, queryPos );
		var plainPath	= src.substring( 0, pos == -1 ? src.length : pos );
		pos = plainPath.lastIndexOf( "/" );
		var path		= plainPath.substring( 0, pos + 1 );
		var nameWithExt	= plainPath.substring( pos + 1 );
		pos = nameWithExt.lastIndexOf( "." );
		var name		= nameWithExt.substring( 0, pos );
		var ext			= nameWithExt.substring( pos + 1 );
		
		var scheme		= "";
		pos = src.indexOf( ":" );
		
		if ( pos >= 0 )
		{
			scheme = src.substring( 0, pos );
		}
		
		mSelf.FullPath = src;
		mSelf.Path = path;
		mSelf.PlainPath = plainPath;
		mSelf.Name = name;
		mSelf.Extension = ext;
		mSelf.NameWithExtension = nameWithExt;
		mSelf.Scheme = scheme;
		mSelf.IsAbsolute = !String.IsNullOrEmpty( scheme );
		mSelf.Fragment = fragment;
		mSelf.Query = query;

		var search = mSelf.Query;

		if (!String.IsNullOrEmpty(search)) {
		    search = search.substring(1);
		    search = search.replace(/\+/g, " ");

		    Parse(search, "&", mSelf.QueryMap);
		}

		var hash = mSelf.Fragment;

		if (!String.IsNullOrEmpty(hash)) {
		    hash = hash.substring(1);

		    Parse(hash, "|", mSelf.HashMap);
		}

		function Parse(item, delimiter, map) {
		    var split = item.split(delimiter);

		    for (var i = 0, length = split.length; i < length; i++) {
		        var part = split[i];
		        var index = part.indexOf("=");
		        var key = null;
		        var value = null;

		        if (index >= 0) {
		            key = decodeURIComponent(part.substring(0, index));
		            value = decodeURIComponent(part.substring(index + 1));
		        }
		        else {
		            key = part;
		        }

		        map.Add(key, value);
		    }
		}
	})();
}

// Public static properties

CMCUrl.QueryMap	= new CMCDictionary(true);
CMCUrl.HashMap = new CMCDictionary(true);

CMCUrl.StripInvalidCharacters = function (url) {
    return url.replace(/(javascript:|data:|[<>])/gi, '');
};

(function()
{
	var search	= document.location.search;
	
	if ( !String.IsNullOrEmpty( search ) )
	{
		search = search.substring( 1 );
		Parse( search, "&", CMCUrl.QueryMap );
	}
	
	var hash	= document.location.hash;
	
	if ( !String.IsNullOrEmpty( hash ) )
	{
		hash = hash.substring( 1 );
		Parse( hash, "|", CMCUrl.HashMap );
	}
	
	function Parse( item, delimiter, map )
	{
		var split	= item.split( delimiter );
	
		for ( var i = 0, length = split.length; i < length; i++ )
		{
			var part	= split[i];
			var index	= part.indexOf( "=" );
			var key		= null;
			var value	= null;
			
			if ( index >= 0 )
			{
				key = decodeURIComponent( part.substring( 0, index ) );
				value = decodeURIComponent( part.substring( index + 1 ) );
			}
			else
			{
				key = part;
			}

			map.Add( key, value );
		}
	}
})();

//

CMCUrl.prototype.AddFile	= function( otherUrl )
{
	if ( typeof( otherUrl ) == "string" )
	{
		otherUrl = new CMCUrl( otherUrl );
	}
	
	if ( otherUrl.IsAbsolute )
	{
		return otherUrl;
	}
	
	var otherFullPath = otherUrl.FullPath;
	
	if ( otherFullPath.charAt( 0 ) == "/" )
	{
		var loc			= document.location;
		var pos			= loc.href.lastIndexOf( loc.pathname );
		var rootPath	= loc.href.substring( 0, pos );
		
		return new CMCUrl( rootPath + otherFullPath );
	}
	
	var fullPath = this.FullPath;
	
	if ( !fullPath.EndsWith( "/" ) )
	{
		fullPath = fullPath + "/";
	}
	
	return new CMCUrl( fullPath + otherFullPath );
};

CMCUrl.prototype.CombinePath	= function( otherUrl )
{
	if ( typeof( otherUrl ) == "string" )
	{
		otherUrl = new CMCUrl( otherUrl );
	}
	
	if ( otherUrl.IsAbsolute )
	{
		throw new CMCException( -1, "Cannot combine two absolute paths." );
	}
	
	var otherFullPath = otherUrl.FullPath;
	var fullPath = this.FullPath;
	var segments = otherUrl.FullPath.split( "/" );
	
	var curr = this.FullPath;
	var prefix = "";
	
	if ( this.Scheme == "mk" )
	{
		var pos = curr.indexOf( "::" );
		prefix = curr.substring( 0, pos + "::".length );
		curr = curr.substring( pos + "::".length );
	}
	
	for ( var i = 0, length = segments.length; i < length; i++ )
	{
		var seg = segments[i];
		
		if ( String.IsNullOrEmpty( seg ) )
		{
			continue;
		}
		
		if ( curr.length > 1 && curr.EndsWith( "/" ) )
		{
			curr = curr.substring( 0, curr.length - 1 );
		}
		
		if ( seg == "." )
		{
			curr += "/";
		}
		else if ( seg == ".." )
		{
			curr = curr.substring( 0, curr.lastIndexOf( "/" ) + 1 );
		}
		else
		{
			if ( !curr.EndsWith( "/" ) )
			{
				curr += "/";
			}
			
			curr += seg;
		}
	}
	
	curr = prefix + curr;
	
	return new CMCUrl( curr );
};

CMCUrl.prototype.ToQuery = function(query)
{
	var newPath = this.PlainPath + "?" + query + this.Fragment;

	return new CMCUrl(newPath);
};

CMCUrl.prototype.AlternateEclipsePath = function () {
    var query = this.Query.substring(1, this.Query.length - 1);
    var ret = this.PlainPath;
    if (query.indexOf("topic=") != -1) {
        ret = ret.substring(0, ret.indexOf("/help/") + "/help/".length);
        var param_sets = query.split("&");
        for (var i = 0; i < param_sets.length; i++) {
            var key_val = param_sets[i].split("=");
            var key = key_val[0];
            var val = key_val[1];
            while (val.indexOf("%2F") != -1) {
                val = val.replace("%2F", "/");
            }
            if (key == "topic") {
                ret = ret + "topic" + val;
                break;
            }
        }
    }
    return ret;
}

CMCUrl.prototype.ToFolder	= function()
{
	var fullPath = FMCIsEclipseHelp() ? this.AlternateEclipsePath() : this.PlainPath;
	var pos = fullPath.lastIndexOf( "/" );
	var newPath = fullPath.substring( 0, pos + 1 );

	return new CMCUrl( newPath );
};

CMCUrl.prototype.ToRelative	= function( otherUrl )
{
	var path		= otherUrl.FullPath;
	var otherPath	= this.FullPath;
	var pos			= otherPath.indexOf( path );
	var relPath		= null;
	
	if ( pos == 0 )
	{
		relPath = otherPath.substring( path.length );
	}
	else
	{
		relPath = otherPath;
	}
	
	return new CMCUrl( relPath );
};

CMCUrl.prototype.ToExtension	= function( newExt )
{
	var path	= this.FullPath;
	var pos		= path.lastIndexOf( "." );
	var left	= path.substring( 0, pos );
	var newPath	= left + "." + newExt;
	
	return new CMCUrl( newPath );
};

//
//    End class CMCUrl
//

/* -CatapultCompiler- -End- -Copy to CSH Javascript- */

//
//    DOM traversal functions
//

function FMCGetElementsByClassName(className, tag, root)
{
    tag = tag || "*";
    root = root || document;

    var nodes = new Array();
    var elements = root.getElementsByTagName(tag);

    for (var i = 0, length = elements.length; i < length; i++)
    {
        var el = elements[i];

        if (FMCHasClass(el, className))
        {
            nodes[nodes.length] = el;
        }
    }

    return nodes;
}

function FMCHasClass(el, className)
{
    var re = new RegExp("(^|\\s+)" + className + "(\\s+|$)");

    return re.test(el.className);
}

function FMCGetElementsByClassRoot( node, classRoot )
{
    var nodes   = new Array();
    var args    = new Array();
    
    args[0] = nodes;
    args[1] = classRoot;
    
    FMCTraverseDOM( "post", node, FMCGetByClassRoot, args );
                         
    return nodes;
}

function FMCGetByClassRoot( node, args )
{
    var nodes       = args[0];
    var classRoot   = args[1];
    
    if ( node.nodeType == 1 && FMCContainsClassRoot( node.className, classRoot ) )
    {
        nodes[nodes.length] = node;
    }
}

function FMCGetElementsByAttribute( node, attribute, value )
{
    var nodes   = new Array();
    var args    = new Array();
    
    args[0] = nodes;
    args[1] = attribute;
    args[2] = value;
    
    FMCTraverseDOM( "post", node, FMCGetByAttribute, args );
                         
    return nodes;
}

function FMCGetByAttribute( node, args )
{
    var nodes       = args[0];
    var attribute   = args[1];
    var value       = args[2];
    
    try
    {
        if ( node.nodeType == 1 && (FMCGetMCAttribute( node, attribute ) == value || (value == "*" && FMCGetMCAttribute( node, attribute ))) )
        {
            nodes[nodes.length] = node;
        }
    }
    catch( err )
    {
        node.setAttribute( attribute, null );
    }
}

function FMCTraverseDOM( type, root, Func, args )
{
    if ( type == "pre" )
    {
        Func( root, args );
    }
    
    if ( root.childNodes.length != 0 )
    {
        for ( var i = 0; i < root.childNodes.length; i++ )
        {
            FMCTraverseDOM( type, root.childNodes[i], Func, args );
        }
    }
    
    if ( type == "post" )
    {
        Func( root, args );
    }
}

//
//    End DOM traversal functions
//

//
//    Button effects
//

var gButton		= null;
var gTabIndex	= 1;

function MakeButton( td, title, outImagePath, overImagePath, selectedImagePath, width, height, text )
{
	var div	= document.createElement( "div" );

    div.setAttribute( "MadCap:outImage", outImagePath );
    div.setAttribute( "MadCap:overImage", overImagePath );
    div.setAttribute( "MadCap:selectedImage", selectedImagePath );
    div.setAttribute( "MadCap:width", width );
    div.setAttribute( "MadCap:height", height );
    
    FMCPreloadImage( outImagePath );
    FMCPreloadImage( overImagePath );
    FMCPreloadImage( selectedImagePath );

    var buttonEl = document.createElement("button");
    buttonEl.setAttribute("type", "button"); // Need to set type="button" to workaround IE's behavior of focusing the first button on the page when the type is set to "submit" (which is the default value). Pressing enter would then invoke the button. Wrapping the button in a form element also prevents this.
    buttonEl.tabIndex = gTabIndex++;

    if (title != null)
    {
        buttonEl.setAttribute("title", title);
    }

    var imgEl = document.createElement("img");
    imgEl.setAttribute("src", outImagePath);
    imgEl.setAttribute("alt", title);

    buttonEl.appendChild(imgEl);

    if (text != null)
        buttonEl.appendChild(document.createTextNode(text));

    div.appendChild(buttonEl);
    td.appendChild( div );
    
    InitButton( div );
}

function InitButton(div)
{
    var width = parseInt(FMCGetMCAttribute(div, "MadCap:width")) + "px";
    var height = parseInt(FMCGetMCAttribute(div, "MadCap:height")) + "px";
    var image = FMCGetMCAttribute(div, "MadCap:outImage");
    var imgEl = div.getElementsByTagName("img")[0];

    if (image != null)
    {
        image = FMCStripCssUrl(image);

        imgEl.setAttribute("src", image);

        div.onmouseover = ButtonOnOver;
        div.onmouseout = ButtonOnOut;
        div.onmousedown = ButtonOnDown;
        div.onmouseup = ButtonOnUp;
    }

    imgEl.style.width = width;
    imgEl.style.height = height;

    div.style.cursor = "default";
    div.style.width = width;
    div.style.height = height;

    div.parentNode.style.width = width;
    div.parentNode.style.height = height;
}

function ButtonOnOver()
{
	var image	= FMCGetMCAttribute( this, "MadCap:overImage" );
	image = FMCStripCssUrl(image);

	var imgEl = this.getElementsByTagName("img")[0];
    imgEl.setAttribute("src", image);
}

function ButtonOnOut()
{
	var image	= FMCGetMCAttribute( this, "MadCap:outImage" );
	image = FMCStripCssUrl(image);

	var imgEl = this.getElementsByTagName("img")[0];
    imgEl.setAttribute("src", image);
}

function ButtonOnDown()
{
	StartPress( this ); return false;
}

function ButtonOnUp()
{
    var image = FMCGetMCAttribute(this, "MadCap:outImage")
    image = FMCStripCssUrl(image);

    var imgEl = this.getElementsByTagName("img")[0];
    imgEl.setAttribute("src", image);
}

function StartPress( node )
{
    var image = FMCGetMCAttribute(node, "MadCap:selectedImage")
    image = FMCStripCssUrl(image);

    var imgEl = node.getElementsByTagName("img")[0];
    imgEl.setAttribute("src", image);
}

function LookupIFrame(iframeName)
{
    var allIFrames = document.getElementsByTagName("iframe");

    for (var i = 0, length = allIFrames.length; i < length; i++)
    {
        var currIFrame = allIFrames[i];

        if (FMCGetAttribute(currIFrame, "name") == iframeName)
        {
            return currIFrame;
        }
    }

    return null;
}

//
//    End button effects
//

if ( FMCIsWebHelpAIR() )
{
	gOnloadFuncs.splice( 0, 0, FMCInitializeBridge );

	function FMCInitializeBridge()
	{
		if ( window.parentSandboxBridge )
		{
			if ( typeof( gServiceClient ) != "undefined" )
			{
				gServiceClient = {};
			}
			
			for ( var key in window.parentSandboxBridge )
			{
				var pairs		= key.split( "_" );
				var ns			= pairs[0];
				var funcName	= pairs[1];
				
				if ( ns == "FeedbackServiceClient" )
				{
					if ( typeof( gServiceClient ) != "undefined" )
					{
						gServiceClient[funcName] = window.parentSandboxBridge[key];
					}
				}
				else if ( ns == "MadCapUtilities" )
				{
					window[funcName] = window.parentSandboxBridge[key];
				}
			}
		}
	}
}

function FMCFade()
{
    var finished = false;
    var opacity = FMCGetOpacity(gPopupObj);

    if (opacity == -1)
    {
        finished = true;
    }
    else
    {
        FMCSetOpacity(gPopupObj, opacity + 10);

        if (gPopupBGObj)
        {
            var opacityBG = FMCGetOpacity(gPopupBGObj);

            FMCSetOpacity(gPopupBGObj, opacityBG + 5);
        }
    }

    if (opacity == 100)
    {
        finished = true;
    }

    //    if (gPopupObj.filters)
    //    {
    //        var opacity = gPopupObj.style.filter;

    //        if (opacity == "")
    //        {
    //            opacity = "alpha( opacity = 0 )";
    //        }

    //        gPopupObj.style.filter = "alpha( opacity = " + (parseInt(opacity.substring(17, opacity.length - 2)) + 10) + " )";

    //        if (gPopupBGObj)
    //        {
    //            opacity = gPopupBGObj.style.filter;

    //            if (opacity == "")
    //            {
    //                opacity = "alpha( opacity = 0 )";
    //            }

    //            gPopupBGObj.style.filter = "alpha( opacity = " + (parseInt(opacity.substring(17, opacity.length - 2)) + 5) + " )";
    //        }

    //        if (gPopupObj.style.filter == "alpha( opacity = 100 )")
    //        {
    //            finished = true;
    //        }
    //    }
    //    else if (gPopupObj.style.MozOpacity != null)
    //    {
    //        var opacity = gPopupObj.style.MozOpacity;

    //        if (opacity == "")
    //        {
    //            opacity = "0.0";
    //        }

    //        gPopupObj.style.MozOpacity = parseFloat(opacity) + 0.11;

    //        if (gPopupBGObj)
    //        {
    //            opacity = gPopupBGObj.style.MozOpacity;

    //            if (opacity == "")
    //            {
    //                opacity = "0.0";
    //            }

    //            gPopupBGObj.style.MozOpacity = parseFloat(opacity) + 0.05;
    //        }

    //        if (parseFloat(gPopupObj.style.MozOpacity) == 0.99)
    //        {
    //            finished = true;
    //        }
    //    }
    //    else
    //    {
    //        finished = true;
    //    }

    if (finished)
    {
        clearInterval(gFadeID);
        gFadeID = 0;
    }
}

var MCFader = new function ()
{
    // Public methods

    this.FadeIn = function (node, startOpacity, endOpacity, nodeBG, startOpacityBG, endOpacityBG, handleClick)
    {
        var interval = 0;

        FMCSetOpacity(node, startOpacity);

        if (nodeBG != null)
        {
            FMCSetOpacity(nodeBG, startOpacityBG);
        }

        function DoFadeIn()
        {
            if (!FMCIsInDom(node))	// Node was already removed from the DOM.
            {
                clearInterval(interval);

                return;
            }

            var opacity = FMCGetOpacity(node);

            if (opacity == startOpacity || opacity == -1)
            {
                if (handleClick)
                {
                    var funcIndex = -1;

                    function OnClickDocument()
                    {
                        if (FMCIsInDom(node)) // Node was already removed from the DOM.
                        {
                            node.parentNode.removeChild(node);

                            if (nodeBG != null)
                            {
                                nodeBG.parentNode.removeChild(nodeBG);
                            }
                        }

                        gDocumentOnclickFuncs.splice(funcIndex, 1);
                    }

                    funcIndex = gDocumentOnclickFuncs.push(OnClickDocument) - 1;
                }
            }

            if (opacity == -1)
            {
                clearInterval(interval);

                return;
            }

            var opacityStep = (endOpacity - startOpacity) / 10;
            var newOpacity = opacity + opacityStep;
            FMCSetOpacity(node, newOpacity);

            if (newOpacity >= endOpacity)
            {
                clearInterval(interval);

                if (nodeBG != null)
                {
                    FMCSetOpacity(nodeBG, endOpacityBG);
                }
            }
        }

        interval = setInterval(DoFadeIn, 10);
    };
}

//
//    Class CMCDateTimeHelpers
//

var CMCDateTimeHelpers = new function () {
    this.GetDateFromUTCString = function (utcString) {
        var ms = Date.parse(utcString);
        var date = new Date(ms);
        var utcMS = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
        var utcDate = new Date(utcMS);

        return utcDate;
    };

    this.GetDateFromJsonString = function (dateString) {
        var dateRegex = /\/Date\(([0-9]+)\)\//i;
        var dateMatch = dateRegex.exec(dateString);

        if (dateMatch != null) {
            return new Date(parseInt(dateMatch[1]));
        }
        else {
            return new Date(dateString);
        }
    };

    this.ToUIString = function (date) {
        var dateStr = (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + " " + date.toLocaleTimeString();

        return dateStr;
    };

    this.ToDurationString = function (fromDate, toDate) {
        if (fromDate > toDate) {
            var tempDate = fromDate;
            fromDate = toDate;
            toDate = tempDate;
        }

        var ticks = toDate - fromDate;
        var seconds = ticks / 1000;
        var minutes = seconds / 60;
        var hours = minutes / 60;
        var days = hours / 24;

        if (minutes < 1)
            return "Just now";
        if (hours < 1)
            return parseInt(minutes) + " minutes ago";
        if (days < 1)
            return parseInt(hours) + " hours ago";
        if (days < 30)
            return parseInt(days) + " days ago";

        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var dateString = months[fromDate.getMonth()] + " " + fromDate.getDate();

        if (fromDate.getFullYear() != toDate.getFullYear())
            dateString += ", " + fromDate.getFullYear();

        return dateString;
    };
}

//
//    End class CMCDateTimeHelpers
//

//
//    Class CMCException
//

function CMCException( number, message )
{
	// Private member variables and functions

	this.Number		= number;
	this.Message	= message;
}

//
//    End class CMCException
//

var MCGlobals = new function ()
{
    // Private member variables

    var mSelf = this;

    // Public properties

    this.Initialized = false;
    this.GetHelpSystemComplete = false;
    this.StylesheetInitialized = false;

    this.RootFolder = null;
    this.RootFrameRootFolder = null;
    this.RootFrame = null;
    this.ToolbarFrame = null;
    this.BodyFrame = null;
    this.NavigationFrame = null;
    this.BodyCommentsFrame = null;
    this.PersistenceFrame = null;

    // Private methods

    function InitRoot()
    {
        mSelf.RootFrame = window;
        mSelf.ToolbarFrame = frames["mctoolbar"];
        mSelf.BodyFrame = frames["body"];
        mSelf.NavigationFrame = frames["navigation"];
        mSelf.PersistenceFrame = null;

        mSelf.Initialized = true;
    }

    function InitTopicCHM()
    {
        mSelf.RootFrame = null;
        mSelf.ToolbarFrame = frames["mctoolbar"];
        mSelf.BodyFrame = window;
        mSelf.NavigationFrame = null;
        mSelf.BodyCommentsFrame = frames["topiccomments"];
        mSelf.PersistenceFrame = frames["persistence"];

        //

        mSelf.Initialized = true;
    }

    function InitNavigation()
    {
        mSelf.RootFrame = parent;
        mSelf.NavigationFrame = window;
        mSelf.PersistenceFrame = null;

        FMCRegisterCallback("Root", MCEventType.OnReady, OnRootReady, null);

        function OnRootReady(args)
        {
            mSelf.ToolbarFrame = mSelf.RootFrame.frames["mctoolbar"];
            mSelf.BodyFrame = mSelf.RootFrame.frames["body"];

            if (FMCIsWebHelpAIR())
            {
                FMCRegisterCallback("Root", MCEventType.OnLoad, OnRootLoaded, null);

                function OnRootLoaded(args)
                {
                    mSelf.Initialized = true;
                }
            }
            else
            {
                mSelf.Initialized = true;
            }
        }
    }

    function InitNavigationFramesWebHelp()
    {
        mSelf.RootFrame = parent.parent;
        mSelf.NavigationFrame = parent;
        mSelf.PersistenceFrame = null;

        FMCRegisterCallback("Root", MCEventType.OnReady, OnRootReady, null);

        function OnRootReady(args)
        {
            mSelf.ToolbarFrame = mSelf.RootFrame.frames["mctoolbar"];
            mSelf.BodyFrame = mSelf.RootFrame.frames["body"];

            //

            if (window.name == "search" && FMCIsWebHelpAIR())
            {
                FMCRegisterCallback("Navigation", MCEventType.OnLoad, OnNavigationLoaded, null);

                function OnNavigationLoaded(args)
                {
                    mSelf.Initialized = true;
                }
            }
            else
            {
                mSelf.Initialized = true;
            }
        }
    }

    function InitBodyCommentsFrameWebHelp()
    {
        var rootFrame = null;

        //        if (parent.parent.gRuntimeFileType == "Default")	// Standalone topic
        //        {
        //            rootFrame = parent.parent;
        //        }
        if (parent.parent != parent) // Standalone topic
        {
            rootFrame = parent.parent;
        }

        mSelf.RootFrame = rootFrame;
        mSelf.NavigationFrame = parent.parent.frames["navigation"];
        mSelf.PersistenceFrame = null;
        mSelf.ToolbarFrame = parent.parent.frames["mctoolbar"];
        mSelf.BodyFrame = parent;
        mSelf.BodyCommentsFrame = window;

        mSelf.Initialized = true;
    }

    function InitBodyCommentsFrameDotNetHelp()
    {
        mSelf.RootFrame = null;
        mSelf.ToolbarFrame = null;
        mSelf.BodyFrame = parent;
        mSelf.NavigationFrame = null;
        mSelf.BodyCommentsFrame = window;
        mSelf.PersistenceFrame = null;

        //

        mSelf.Initialized = true;
    }

    function InitToolbarWebHelp()
    {
        mSelf.RootFrame = parent;
        mSelf.ToolbarFrame = window;
        mSelf.PersistenceFrame = null;

        FMCRegisterCallback("Root", MCEventType.OnReady, OnRootReady, null);

        function OnRootReady(args)
        {
            mSelf.BodyFrame = mSelf.RootFrame.frames["body"];
            mSelf.NavigationFrame = mSelf.RootFrame.frames["navigation"];

            //

            mSelf.Initialized = true;
        }
    }

    function InitToolbarWebHelpTopic()
    {
        var currFrame = window;

        while (true)
        {
            if (currFrame.parent == currFrame)
            {
                mSelf.RootFrame = currFrame;
                break;
            }

            currFrame = currFrame.parent;
        }

        mSelf.PersistenceFrame = null;
        mSelf.BodyFrame = parent;

        FMCRegisterCallback("Root", MCEventType.OnReady, OnRootReady, null);

        function OnRootReady(args)
        {
            mSelf.ToolbarFrame = mSelf.RootFrame.frames["mctoolbar"];
            mSelf.NavigationFrame = mSelf.RootFrame.frames["navigation"];

            //

            mSelf.Initialized = true;
        }
    }

    function InitToolbarCHM()
    {
        mSelf.RootFrame = null;
        mSelf.ToolbarFrame = window;
        mSelf.BodyFrame = parent;
        mSelf.NavigationFrame = null;

        FMCRegisterCallback("Body", MCEventType.OnReady, OnBodyReady, null);

        function OnBodyReady(args)
        {
            mSelf.BodyCommentsFrame = mSelf.BodyFrame.frames["topiccomments"];
            mSelf.PersistenceFrame = mSelf.BodyFrame.frames["persistence"];

            //

            mSelf.Initialized = true;
        }
    }

    function InitTopicWebHelp()
    {
        var rootFrame = null;

        //        if (parent.gRuntimeFileType == "Default")	// Standalone topic
        //        {
        //            rootFrame = parent;
        //        }
        if (parent != window)
        {
            rootFrame = parent;
        }

        mSelf.RootFrame = rootFrame;
        mSelf.BodyFrame = window;
        mSelf.PersistenceFrame = null;

        if (mSelf.RootFrame == null)	// Standalone topic
        {
            mSelf.Initialized = true;
        }
        else
        {
            function OnRootReady(args)
            {
                mSelf.ToolbarFrame = mSelf.RootFrame.frames["mctoolbar"];
                mSelf.NavigationFrame = mSelf.RootFrame.frames["navigation"];

                if (FMCIsWebHelpAIR())
                {
                    FMCRegisterCallback("Root", MCEventType.OnLoad, OnRootLoaded, null);

                    function OnRootLoaded(args)
                    {
                        mSelf.Initialized = true;
                    }
                }
                else
                {
                    mSelf.Initialized = true;
                }
            }

            FMCRegisterCallback("Root", MCEventType.OnReady, OnRootReady, null);
        }
    }

    function InitTopicDotNetHelp()
    {
        mSelf.RootFrame = null;
        mSelf.ToolbarFrame = null;
        mSelf.BodyFrame = window;
        mSelf.NavigationFrame = null;
        mSelf.PersistenceFrame = null;

        //

        mSelf.Initialized = true;
    }

    function InitGlossaryFrameDotNetHelp()
    {
        mSelf.RootFrame = null;
        mSelf.ToolbarFrame = null;
        mSelf.BodyFrame = null;
        mSelf.NavigationFrame = null;
        mSelf.BodyCommentsFrame = null;
        mSelf.PersistenceFrame = null;

        //

        mSelf.Initialized = true;
    }

    function InitNavigationFramesCHM()
    {
        mSelf.RootFrame = null;
        mSelf.BodyFrame = parent;
        mSelf.NavigationFrame = null;

        FMCRegisterCallback("Body", MCEventType.OnReady, OnBodyReady, null);

        function OnBodyReady(args)
        {
            mSelf.ToolbarFrame = mSelf.BodyFrame.frames["mctoolbar"];
            mSelf.BodyCommentsFrame = mSelf.BodyFrame.frames["topiccomments"];
            mSelf.PersistenceFrame = mSelf.BodyFrame.frames["persistence"];

            //

            mSelf.Initialized = true;
        }
    }

    // Public methods

    this.GetIsInitialized = function ()
    {
        return this.Initialized && this.GetHelpSystemComplete && this.StylesheetInitialized;
    };

    this.Init = function ()
    {
        function OnGetHelpSystemComplete(helpSystem)
        {
            function OnGetSkinFolder(skinFolder)
            {
                mSelf.RootFrameSkinFolder = skinFolder;

                mSelf.GetHelpSystemComplete = true;

                CMCFlareStylesheet.Init(OnGetStylesheetComplete);
            }

            var masterHS = helpSystem;

            mSelf.SkinFolder = masterHS.SkinFolder;
            mSelf.SkinTemplateFolder = masterHS.SkinTemplateFolder;
            mSelf.DefaultStartTopic = masterHS.DefaultStartTopic;
            mSelf.InPreviewMode = masterHS.InPreviewMode;

            if (FMCIsWebHelp())
            {
                FMCPostMessageRequest(mSelf.RootFrame, "get-skin-folder", null, function (data)
                {
                    var skinFolder = data[0];

                    OnGetSkinFolder(skinFolder);
                }, function ()
                {
                    OnGetSkinFolder(MCGlobals.RootFrame.gSkinFolder);
                });
            }
            else
            {
                OnGetSkinFolder(masterHS.SkinFolder);
            }
        }

        function OnGetStylesheetComplete()
        {
            mSelf.StylesheetInitialized = true;
        }

        function OnGetUrl(url)
        {
            function OnGetRootFolder(rootFolder)
            {
                mSelf.RootFolder = rootFolder;
                mSelf.RootFrameRootFolder = FMCEscapeHref(rootFolder);

                FMCLoadHelpSystem(OnGetHelpSystemComplete);
            }

            var rootFolder = new CMCUrl(url).ToFolder();
            mSelf.RootFrameRootFolder = FMCEscapeHref(rootFolder.FullPath);
            var href = new CMCUrl(document.location.href);
            var subFolder = href.ToFolder().ToRelative(rootFolder);

            if (subFolder.FullPath.StartsWith("Subsystems", false))
            {
                while (subFolder.FullPath.StartsWith("Subsystems", false))
                {
                    rootFolder = rootFolder.AddFile("Subsystems/");
                    subFolder = href.ToFolder().ToRelative(rootFolder);

                    var projFolder = subFolder.FullPath.substring(0, subFolder.FullPath.indexOf("/") + 1);

                    rootFolder = rootFolder.AddFile(projFolder);
                    subFolder = href.ToFolder().ToRelative(rootFolder);
                }

                var r = rootFolder.FullPath;
                r = r.replace(/\\/g, "/");
                r = r.replace(/%20/g, " ");
                r = r.replace(/;/g, "%3B"); // For Safari

                mSelf.RootFolder = r;
            }
            else if (subFolder.FullPath.StartsWith("AutoMerge", false))
            {
                while (subFolder.FullPath.StartsWith("AutoMerge", false))
                {
                    rootFolder = rootFolder.AddFile("AutoMerge/");
                    subFolder = href.ToFolder().ToRelative(rootFolder);

                    var projFolder = subFolder.FullPath.substring(0, subFolder.FullPath.indexOf("/") + 1);

                    rootFolder = rootFolder.AddFile(projFolder);
                    subFolder = href.ToFolder().ToRelative(rootFolder);
                }

                var r = rootFolder.FullPath;
                r = r.replace(/\\/g, "/");
                r = r.replace(/%20/g, " ");
                r = r.replace(/;/g, "%3B"); // For Safari

                mSelf.RootFolder = r;
            }
            else
            {
                FMCPostMessageRequest(mSelf.RootFrame, "get-root-folder", null, function (data)
                {
                    var rootFolder = data[0];

                    OnGetRootFolder(rootFolder);
                }, function ()
                {
                    OnGetRootFolder(FMCGetRootFolder(mSelf.RootFrame.document.location));
                });

                return;
            }

            FMCLoadHelpSystem(OnGetHelpSystemComplete);
        }

        var inPreviewMode = FMCGetAttributeBool(document.documentElement, "MadCap:InPreviewMode", false);

        if (inPreviewMode)
        {
            this.InPreviewMode = true;

            this.SkinFolder = "Skin/";
            this.RootFrameSkinFolder = "Skin/";
            this.SkinTemplateFolder = "SkinTemplate/";

            CMCFlareStylesheet.Init(OnGetStylesheetComplete);

            mSelf.Initialized = true;
            mSelf.GetHelpSystemComplete = true;

            return;
        }

        if (window.name == "bridge")
        {
            mSelf.Initialized = true;
            mSelf.GetHelpSystemComplete = true;
            mSelf.StylesheetInitialized = true;

            return;
        }
        else if (gRuntimeFileType == "Default" || (gRuntimeFileType == "Topic" && FMCIsHtmlHelp()))	// Root or topic in CHM
        {
            mSelf.ToolbarFrame = frames["mctoolbar"];

            if (frames["body"] != null)	// Root
            {
                InitRoot();
            }
            else							// Topic in CHM
            {
                InitTopicCHM();
            }
        }
        else if (window.name == "navigation")	// Navigation
        {
            InitNavigation();
        }
        else if (window.name.StartsWith("mctoolbar"))	// Toolbar
        {
            mSelf.ToolbarFrame = window;

            if (FMCIsWebHelp())
            {
                if (window.name == "mctoolbar")	// Toolbar in WebHelp
                InitToolbarWebHelp();
                else // Toolbar in WebHelp topic
                InitToolbarWebHelpTopic();
            }
            else						// Toolbar in CHM
            {
                InitToolbarCHM();
            }
        }
        else if (FMCIsTopicPopup(window))   // Topic popup
        {
            var currFrame = window;

            while (true)
            {
                if (currFrame.frames["navigation"] != null)
                {
                    mSelf.RootFrame = currFrame;

                    break;
                }

                if (currFrame.parent == currFrame)
                {
                    break;
                }

                currFrame = currFrame.parent;
            }

            mSelf.Initialized = true;
        }
        else if (window.name == "body" || gRuntimeFileType == "Topic")	// Topic in WebHelp - window.name is "body" when viewed in frameset, but gRuntimeFileType might not be "Topic" if it's an external topic. gRuntimeFileType is "Topic" when viewed as standalone, but window.name won't be "body".
        {
            if (FMCIsWebHelp() || FMCIsEclipseHelp())
            {
                InitTopicWebHelp();
            }
            else if (FMCIsDotNetHelp())
            {
                InitTopicDotNetHelp();
            }
            else if (FMCIsHtmlHelp())
            {
                InitTopicCHM();
            }
        }
        else if (window.name == "topiccomments")
        {
            if (FMCIsHtmlHelp())
            {
                InitNavigationFramesCHM(); // Body comments frame in CHM
            }
            else if (FMCIsWebHelp() || FMCIsEclipseHelp())
            {
                InitBodyCommentsFrameWebHelp(); // Body comments frame in WebHelp body
            }
            else if (FMCIsDotNetHelp())
            {
                InitBodyCommentsFrameDotNetHelp(); // Body comments frame in DotNet Help body
            }
        }
        else if (window.name == "glossary" && FMCIsDotNetHelp())
        {
            InitGlossaryFrameDotNetHelp();
        }
        else if (window.name == "toc" || window.name == "index" || window.name == "search" || window.name == "glossary" || window.name == "favorites" || window.name == "browsesequences")
        {
            if (FMCIsWebHelp())
            {
                InitNavigationFramesWebHelp(); // Navigation frames in WebHelp
            }
            else
            {
                InitNavigationFramesCHM(); // Navigation frames in CHM
            }
        }
        else if (FMCIsDotNetHelp())
        {
            mSelf.Initialized = true;
        }
        else
        {
            mSelf.Initialized = true;
            mSelf.GetHelpSystemComplete = true;
            mSelf.StylesheetInitialized = true;

            return;
        }

        if (FMCIsWebHelp() || FMCIsEclipseHelp())
        {
            if (mSelf.RootFrame == null)	// Standalone topic
            {
                mSelf.GetHelpSystemComplete = true;
                mSelf.StylesheetInitialized = true;

                return;
            }

            FMCPostMessageRequest(mSelf.RootFrame, "url", null, function (data)
            {
                var url = data[0];

                OnGetUrl(url);
            }, function ()
            {
                OnGetUrl(mSelf.RootFrame.document.location.href);
            });

            return;
        }
        else if (FMCIsHtmlHelp())
        {
            var myChm = "";
            var href = document.location.href;
            var doubleColonPos = href.lastIndexOf("::");

            // When a topic popup points to a topic inside another CHM, RootFolder needs to include it.
            // Example: mk:@MSITStore:C:\MyOutput.chm::/ms-its:MyOutput2.chm::\Topic.htm yields /MyOutput2.chm::/
            if (doubleColonPos >= 0)
            {
                var doubleColonPos2 = href.indexOf("::");

                if (doubleColonPos2 >= 0 && doubleColonPos2 < doubleColonPos)
                {
                    var colonPos = href.lastIndexOf(":", doubleColonPos - 1);
                    myChm = href.substring(colonPos + 1, doubleColonPos + "::".length) + "/";
                }
            }

            mSelf.RootFolder = "/" + myChm;
            mSelf.RootFrameRootFolder = mSelf.RootFolder;
        }
        else if (FMCIsDotNetHelp())
        {
            var pathToHelpSystem = FMCGetAttribute(document.documentElement, "MadCap:PathToHelpSystem");
            var rootFolder = new CMCUrl(document.location.href).ToFolder();
            rootFolder = rootFolder.CombinePath(pathToHelpSystem);

            mSelf.RootFolder = rootFolder.FullPath;
            mSelf.RootFrameRootFolder = FMCEscapeHref(rootFolder.FullPath);
        }

        FMCLoadHelpSystem(OnGetHelpSystemComplete);
    }
}

var gMessageID = 0;
var gMessageInfos = new Array();
var gMessageSeparator = "%%%%%";
var gDataSeparator = "^^^^^";

function FMCPostMessageRequest(win, message, data, callbackFunc, postMessageNotSupportedFunc, alwaysUsePostMessage)
{
    /// <summary>Sends a message to the specified window with a request for data.</summary>
    /// <param name="win">The window to send the request to.</param>
    /// <param name="message">The name of the request.</param>
    /// <param name="data">An array containing data to send along with the request.</param>
    /// <param name="callbackFunc">The callback function to execute when the message is handled.</param>
    /// <param name="postMessageNotSupportedFunc">When the postMessage API is not being used, this callback function will be called.</param>
    /// <param name="alwaysUsePostMessage">Whether to always use the postMessage API even when not Chrome running locally.</param>

    if (FMCIsChromeLocal() || alwaysUsePostMessage)
    {
        gMessageInfos[gMessageID] = callbackFunc;

        var dataString = "";

        if (data != null)
        {
            for (var i = 0, length = data.length; i < length; i++)
            {
                if (i > 0)
                {
                    dataString += gDataSeparator;
                }

                dataString += data[i];
            }
        }

        win.postMessage("request" + gMessageSeparator + message + gMessageSeparator + dataString + gMessageSeparator + gMessageID, "*");

        gMessageID++;
    }
    else
    {
        if (postMessageNotSupportedFunc != null)
        {
            postMessageNotSupportedFunc();
        }
    }
}

function FMCPostMessageResponse(win, message, data, messageID)
{
    /// <summary>Sends a message to the specified window responding to a request made by that window.</summary>
    /// <param name="win">The window to send the response to.</param>
    /// <param name="message">The name of the request.</param>
    /// <param name="data">An array containing data to send along with the request.</param>
    /// <param name="messageID">The messageID of the original request.</param>

    var dataString = "";

    if (data != null)
    {
        for (var i = 0, length = data.length; i < length; i++)
        {
            if (i > 0)
            {
                dataString += gDataSeparator;
            }

            dataString += data[i];
        }
    }

    win.postMessage("response" + gMessageSeparator + message + gMessageSeparator + dataString + gMessageSeparator + messageID, "*");

    gMessageID++;
}

function OnMessage(e)
{
    var parts = e.data.split(gMessageSeparator);
    var messageType = parts[0];
    var message = parts[1];
    var messageData = parts[2];
    var messageID = parts[3];

    var dataValues = null;

    if (!String.IsNullOrEmpty(messageData))
    {
        dataValues = messageData.split(gDataSeparator);

        for (var i = 0, length = dataValues.length; i < length; i++)
        {
            if (dataValues[i] == "null")
            {
                dataValues[i] = null;
            }
        }
    }

    if (messageType == "request")
    {
        var handled = false;
        var responseData = new Array();

        if (message == "url")
        {
            responseData[responseData.length] = document.location.href;
            handled = true;
        }
        else if (message == "title")
        {
            responseData[responseData.length] = document.title;
            handled = true;
        }
        else if (message == "get-root-folder")
        {
            responseData[responseData.length] = FMCGetRootFolder(document.location);
            handled = true;
        }
        else if (message == "get-skin-folder")
        {
            responseData[responseData.length] = gSkinFolder;
            handled = true;
        }
        else if (message == "gReady")
        {
            responseData[responseData.length] = gReady;
            handled = true;
        }
        else if (message == "gLoaded")
        {
            responseData[responseData.length] = gLoaded;
            handled = true;
        }
        else if (message == "gInit")
        {
            responseData[responseData.length] = gInit;
            handled = true;
        }
        else if (message == "get-href")
        {
            responseData[responseData.length] = document.location.href;
            handled = true;
        }
        else if (message == "navigate")
        {
            var path = dataValues[0];
            document.location.href = path;

            handled = true;
        }
        else if (message == "navigate-iframe")
        {
            var path = dataValues[0];
            var name = dataValues[1];

            LookupIFrame(name).setAttribute("src", path);

            handled = true;
        }
        else if (message == "navigate-relative")
        {
            var relPath = dataValues[0];
            var helpSystem = FMCGetHelpSystem();
            var fullPath = MCGlobals.RootFolder + helpSystem.ContentFolder + relPath;

            document.location.href = fullPath;

            handled = true;
        }
        else if (message == "navigate-replace")
        {
            var path = dataValues[0];
            document.location.replace(path);

            handled = true;
        }
        else if (message == "navigate-back")
        {
            window.history.go(-1);
            handled = true;
        }
        else if (message == "navigate-forward")
        {
            window.history.go(1);
            handled = true;
        }
        else if (message == "navigate-stop")
        {
            if (window.stop)
            {
                window.stop();
            }
            else if (document.execCommand)
            {
                window.document.execCommand("Stop");
            }

            handled = true;
        }
        else if (message == "navigate-refresh")
        {
            window.history.go(0);
            handled = true;
        }
        else if (message == "set-iframe-width")
        {
            var iframeName = dataValues[0];
            var width = parseInt(dataValues[1]);
            var iframe = LookupIFrame(iframeName);

            iframe.style.width = width + "px";
            iframe.style.visibility = "visible";

            //

            handled = true;
        }
        else if (message == "set-iframe-height")
        {
            var iframeName = dataValues[0];
            var height = parseInt(dataValues[1]);
            var iframe = LookupIFrame(iframeName);

            iframe.style.height = height + "px";
            iframe.style.visibility = "visible";

            //

            handled = true;
        }

        if (handled)
        {
            FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
        }
    }
    else if (messageType == "response")
    {
        if (gMessageInfos[messageID] != null)
        {
            gMessageInfos[messageID](dataValues);
        }
    }
}

if (window.postMessage != null)
{
    if (window.addEventListener)
        window.addEventListener("message", OnMessage, false);
    else if (window.attachEvent)
        window.attachEvent("onmessage", OnMessage);
}
