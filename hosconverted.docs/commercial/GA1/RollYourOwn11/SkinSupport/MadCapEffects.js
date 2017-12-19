/// <reference path="MadCapUtilities.js" />
/// <reference path="MadCapMerging.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

var gPopupObj           = null;
var gPopupBGObj         = null;
var gJustPopped         = false;

var gFadeID             = 0;

var gTextPopupBody      = null;
var gTextPopupBodyBG    = null;

var gImgNode            = null;

function FMCImageSwap( img, swapType )
{
	var state	= FMCGetMCAttribute( img, "MadCap:state" );
	
    switch ( swapType )
    {
        case "swap":
            var src		= img.src;
            var altsrc2 = FMCGetMCAttribute(img, "MadCap:altsrc2");
            var alt = FMCGetAttribute(img, "alt");
            var alt2 = FMCGetMCAttribute(img, "MadCap:alt2");
            
            if ( !altsrc2 )
            {
				altsrc2 = FMCGetMCAttribute( img, "MadCap:altsrc" );
            }

            if (!alt2) {
                alt2 = FMCGetAttribute(img, "alt");
            }
            
            img.src = altsrc2;
            img.setAttribute( "MadCap:altsrc2", src );
            img.setAttribute("MadCap:state", (state == null || state == "close") ? "open" : "close");
            img.setAttribute("alt", alt2);
            img.setAttribute("MadCap:alt2", alt);

            break;
            
        case "open":
            if ( state != swapType )
            {
                FMCImageSwap( img, "swap" );
            }
            
            break;
            
        case "close":
            if ( state == "open" )
            {
                FMCImageSwap( img, "swap" );
            }
            
            break;
    }
}

function FMCExpandAll( swapType )
{
    var nodes   = FMCGetElementsByAttribute( document.body, "MadCap:targetName", "*" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        nodes[i].style.display = (swapType == "open") ? "" : "none";
    }
    
    nodes = FMCGetElementsByClassRoot( document.body, "MCTogglerIcon" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        FMCImageSwap( nodes[i], swapType );
    }
    
    nodes = FMCGetElementsByClassRoot( document.body, "MCExpandingBody" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        nodes[i].style.display = (swapType == "open") ? "" : "none";
    }
    
    nodes = FMCGetElementsByClassRoot( document.body, "MCExpandingIcon" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        FMCImageSwap( nodes[i], swapType );
    }
    
    nodes = FMCGetElementsByClassRoot( document.body, "MCDropDownBody" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        nodes[i].style.display = (swapType == "open") ? "" : "none";
    }
    
    nodes = FMCGetElementsByClassRoot( document.body, "MCDropDownIcon" );
    
    for ( var i = 0; i < nodes.length; i++ )
    {
        FMCImageSwap( nodes[i], swapType );
    }
}

function FMCDropDown( node )
{
    // Find head node
    
    var headNode    = node;
    
    while ( !FMCContainsClassRoot( headNode.className, "MCDropDown", "GlossaryPageEntry" ) )
    {
        headNode = headNode.parentNode;
    }
    
    // Toggle the icon
    
    var imgNodes    = node.getElementsByTagName( "img" );
    
    for ( var i = 0; i < imgNodes.length; i++ )
    {
        var imgNode = imgNodes[i];
        
        if ( FMCContainsClassRoot( imgNode.className, "MCDropDownIcon" ) )
        {
            FMCImageSwap( imgNode, "swap" );
            
            break;
        }
    }
    
    // Hide/unhide the body
    
    var id              = node.id.substring( "MCDropDownHotSpot_".length, node.id.length );
    var dropDownBody    = document.getElementById( "MCDropDownBody_" + id );
    
    dropDownBody.style.display = (dropDownBody.style.display == "none") ? "" : "none";
}

function FMCExpand( node )
{
    // Find top node
    
    while ( !FMCContainsClassRoot( node.className, "MCExpanding" ) )
    {
        node = node.parentNode;
    }

    var nodes = node.childNodes;

    // Hide/unhide the body

    var expandingBody;

    for (i = 0; i < nodes.length; i++)
    {
        var currNode = nodes[i];

        if (FMCContainsClassRoot(currNode.className, "MCExpandingBody"))
        {
            expandingBody = currNode;
            break;
        }
    }

    expandingBody.style.display = (expandingBody.style.display == "none") ? "" : "none";

    // Toggle the icon

    var imgNodes = node.getElementsByTagName("img");
    
    for ( var i = 0; i < imgNodes.length; i++ )
    {
        var imgNode = imgNodes[i];
        
        if ( FMCContainsClassRoot( imgNode.className, "MCExpandingIcon" ) )
        {
            FMCImageSwap( imgNode, "swap" );
            
            break;
        }
    }
}

var gPopupNumber	= 0;

function FMCPopup( e, node )
{
	// Don't continue if something is already popped up

	if ( gPopupObj )
	{
		return;
	}

	if ( !e )
	{
		e = window.event;
	}

	if ( FMCInPreviewMode() && document.documentElement.innerHTML.indexOf( "<!-- saved from url" ) != -1 )
	{
		var span	= document.getElementById( "MCTopicPopupWarning" );
		
		if ( !span )
		{
			span = document.createElement( "span" );
			span.id = "MCTopicPopupWarning";
			span.className = "MCTextPopupBody";
			span.style.display = "none";
			span.appendChild( document.createTextNode( "Topic popups can not be displayed when Insert Mark of the Web is enabled in the target." ) );
			
			document.body.appendChild( span );
		}
		
		gTextPopupBody = span;
		
		FMCShowTextPopup( e );
		
		return;
	}

	// Toggle the icon

	var imgNodes    = node.getElementsByTagName( "img" );

	for ( var i = 0; i < imgNodes.length; i++ )
	{
		var imgNode = imgNodes[i];
	    
		if ( FMCContainsClassRoot( imgNode.className, "MCExpandingIcon" ) )
		{
			FMCImageSwap( imgNode, "swap" );
			gImgNode = imgNode;
	        
			break;
		}
	}

	// Create iframe node

	var name			= FMCGetAttribute( node, "MadCap:iframeName" );
	var iframeExists	= name != null;
	var iframe			= null;
	
	if ( iframeExists )
	{
		iframe = document.getElementById( name );
	}
	else
	{
		var src		= FMCGetAttribute( node, "MadCap:src" );
		var path	= null;

		if (src.Contains("://") || FMCInPreviewMode())
		{
			path = src;
		}
		else
		{
			var currentUrl	= document.location.href;
			
			path = currentUrl.substring( 0, currentUrl.lastIndexOf( "/" ) + 1 )
			path = path + src;

            //var pathUrl = new CMCUrl(path);

            //// CHMs don't support query strings, so we'll use the old cross-frame method in FMCIsTopicPopup() (which doesn't work in Chrome) to determine if a topic is a popup.
            //if (!FMCIsHtmlHelp())
            //    pathUrl = pathUrl.ToQuery("IsTopicPopup=true");

            //path = pathUrl.FullPath;
		}

		try
		{
			// For IE
			
			iframe = document.createElement( "<iframe onload='FMCIFrameOnloadInline( this );'>" );
		}
		catch ( ex )
		{
			// For non-IE
			
			iframe = document.createElement( "iframe" );
			iframe.onload = FMCIFrameOnload;
		}

		var name	= "MCPopup_" + (gPopupNumber++);
		
		node.setAttribute( "MadCap:iframeName", name );
		
		iframe.name = name;
		iframe.id = name;
		iframe.className = "MCPopupBody";
		iframe.setAttribute( "title", "Popup" );
		iframe.setAttribute( "scrolling", "auto" );
		iframe.setAttribute( "frameBorder", "0" );

		var width = FMCGetAttribute( node, "MadCap:width" );
		
		if ( width != null )
		{
			iframe.setAttribute( "MadCap:width", width );
		}
		
		var height = FMCGetAttribute( node, "MadCap:height" );
		
		if ( height != null )
		{
			iframe.setAttribute( "MadCap:height", height );
		}

		document.body.appendChild( iframe );

		iframe.src = path;
	}
	
	iframe.style.display = "none";
	
	//
	
	gJustPopped = true;
		
	iframe.MCClientX = e.clientX + FMCGetScrollLeft(window);
	iframe.MCClientY = e.clientY + FMCGetScrollTop(window);
	
	if ( iframeExists )
	{
		FMCShowIFrame( iframe );
	}
}

function FMCIFrameOnload( e )
{
    // Safari will fire the onload event twice. Once for creating the iframe (about:blank). The second time for setting the src of the iframe.

    try
    {
        if (this.contentWindow.document.location.href == "about:blank")
        {
            return;
        } 
    }
    catch (ex)
    {
    }

	// Navigating to a link in the popup will fire onload again.

	if ( FMCGetAttributeBool( this, "MadCap:loaded", false ) )
	{
		return;
	}

	FMCShowIFrame( this );

	this.setAttribute( "MadCap:loaded", "true" );
}

function FMCIFrameOnloadInline( popupBody )
{
	// Navigating to a link in the popup will fire onload again.
	
	if ( FMCGetAttributeBool( popupBody, "MadCap:loaded", false ) )
	{
		return;
	}
	
	FMCShowIFrame( popupBody );
	
	popupBody.setAttribute( "MadCap:loaded", "true" );
}

function FMCShowIFrame( popupBody )
{
	try
	{
		// Access denied on document when linking to external website
		
		if ( popupBody.contentWindow.document.location.href == "about:blank" )
		{
			return;
		}
	}
	catch ( ex )
	{
	}
	
	popupBody.style.display = "";
	FMCSetPopupSize( popupBody );
	
	var clientX = popupBody.MCClientX;
	var clientY = popupBody.MCClientY;
	var newXY = FMCGetInBounds( popupBody, clientX, clientY );
	
	popupBody.style.left = newXY.X + "px";
	popupBody.style.top = newXY.Y + "px";
    
    // Set up background
    
    var popupBodyBG = document.createElement( "span" );
    
    popupBodyBG.className = "MCPopupBodyBG";
    popupBodyBG.style.top = newXY.Y + 5 + "px";
    popupBodyBG.style.left = newXY.X + 5 + "px";
    popupBodyBG.style.width = parseInt( popupBody.offsetWidth ) + "px";
    popupBodyBG.style.height = parseInt( popupBody.offsetHeight ) + "px";
    
    popupBody.parentNode.appendChild( popupBodyBG );
    gPopupObj = popupBody;
    gPopupBGObj = popupBodyBG;
    
    //

    FMCSetOpacity(gPopupObj, 0);
    FMCSetOpacity(gPopupBGObj, 0);
    gFadeID = setInterval( FMCFade, 10 );
}

function FMCGetInBounds(el, x, y)
{
	var absolutePosition = FMCGetPosition(el.offsetParent);
	var absoluteTop = absolutePosition[0];
	var absoluteLeft = absolutePosition[1];
	var scrollTop = FMCGetScrollTop(window);
	var scrollLeft = FMCGetScrollLeft(window);
	var newTop = y;
	var newLeft = x;

	if (y < scrollTop)
	{
		newTop = scrollTop + 5; // "+ 5" is for some extra padding.
	}

	if (x < scrollLeft)
	{
		newLeft = scrollLeft + 5; // "+ 5" is for some extra padding.
	}

	// "+ 5" is to account for width of popup shadow.

	if (newTop + parseInt(el.style.height) + 5 > scrollTop + FMCGetClientHeight(window, false))
	{
		newTop = scrollTop + FMCGetClientHeight(window, false) - parseInt(el.style.height) - 5;
	}

	newTop -= absoluteTop;

	if (newLeft + parseInt(el.style.width) + 5 > scrollLeft + FMCGetClientWidth(window, false))
	{
		newLeft = scrollLeft + FMCGetClientWidth(window, false) - parseInt(el.style.width) - 5;
	}

    newLeft -= absoluteLeft;

    var rtl = document.documentElement.dir == "rtl";
    if (rtl) 
    {
        newLeft -= 20;  // offset to move popups over from the right edge of the browser
    }

	return { X: newLeft, Y: newTop };
}

function FMCSetPopupSize( popupNode )
{
	var popupWidth	= FMCGetAttribute( popupNode, "MadCap:width" );
	var popupHeight	= FMCGetAttribute( popupNode, "MadCap:height" );
	
	if ( (popupWidth != "auto" && !String.IsNullOrEmpty( popupWidth )) || (popupHeight != "auto" && !String.IsNullOrEmpty( popupHeight )) )
	{
		popupNode.style.width = popupWidth;
		popupNode.style.height = popupHeight;
		
		return;
	}
	
	//
	
    var clientWidth     = FMCGetClientWidth( window, false );
    var clientHeight    = FMCGetClientHeight( window, false );
    var stepSize        = 10;
    var hwRatio         = clientHeight / clientWidth;
    var popupFrame      = frames[popupNode.name];
    var maxX            = clientWidth * 0.618034;
    var i               = 0;
    
    // Debug
    //window.status += document.body.clientHeight + ", " + document.body.offsetHeight + ", " + document.body.scrollHeight + ", " + document.body.scrollTop;
    //window.status += " : " + document.documentElement.clientHeight + ", " + document.documentElement.offsetHeight + ", " + document.documentElement.scrollHeight + ", " + document.documentElement.scrollTop;
    
    // Safari
    
    if ( FMCIsSafari() )
    {
        popupNode.style.width = maxX + "px";
        popupNode.style.height = (maxX * hwRatio) + "px";
        
        return;
    }
    
    //
    
    try
    {
        var popupDocument   = popupFrame.document; // This will throw an exception in IE.
        
        FMCGetScrollHeight( popupFrame.window );   // This will throw an exception in Mozilla.
    }
    catch ( err )
    {
        popupNode.style.width = maxX + "px";
        popupNode.style.height = (maxX * hwRatio) + "px";
        
        return;
    }
    
    while ( true )
    {
        popupNode.style.width = maxX - (i * stepSize) + "px";
        popupNode.style.height = (maxX - (i * stepSize)) * hwRatio + "px";
        
        if ( FMCGetScrollHeight( popupFrame.window ) > FMCGetClientHeight( popupFrame.window, false ) ||
             FMCGetScrollWidth( popupFrame.window ) > FMCGetClientWidth( popupFrame.window, false ) )
        {
            popupNode.style.width = maxX - ((i - 1) * stepSize) + "px";
            popupNode.style.height = (maxX - ((i - 1) * stepSize)) * hwRatio + "px";
            
            break;
        }
        
        i++;
    }
}

function FMCPopupThumbnail_Onclick( e, node )
{
	// Don't continue if something is already popped up

	if ( gPopupObj )
	{
		return;
	}

	if ( !e )
	{
		e = window.event;
	}
	
	//
	
	var clientCenter = FMCGetClientCenter( window );
	var img = FMCPopupThumbnailShow(node, clientCenter[0], clientCenter[1]);
	img.focus(); // set focus to popup
	var clickindex = gDocumentOnclickFuncs.push(OnDocumentClick) - 1;
	var keydownindex = gDocumentOnkeydownFuncs.push(OnDocumentKeyDown) - 1;
	var justPopped = true;

	function OnDocumentKeyDown(e) {
	    var e = e || window.event;
	    if (e.keyCode != 27 && e.keyCode != 13) // Escape and enter key support to close thumbnail popup
	        return;

	    CloseThumbnailPopup();
	}

	function OnDocumentClick()
	{
		CloseThumbnailPopup();
	}

	function CloseThumbnailPopup() {
	    if (justPopped) {
	        justPopped = false;
	        return;
	    }

	    FMCRemoveOpacitySheet(window);

	    img.parentNode.removeChild(img);

	    gDocumentOnclickFuncs.splice(clickindex, 1);
	    gDocumentOnkeydownFuncs.splice(keydownindex, 1);
	}
}

function FMCPopupThumbnail_Onmouseover( e, node )
{
	// Don't continue if something is already popped up

	if ( gPopupObj )
	{
		return;
	}

	if ( !e )
	{
		e = window.event;
	}
	
	//
	
	var mouseX = FMCGetClientX( window, e );
	var mouseY = FMCGetClientY( window, e );
	var x = mouseX + FMCGetScrollLeft(window);
	var y = mouseY + FMCGetScrollTop(window);
	var img = FMCPopupThumbnailShow( node, x, y );
	
	img.onmouseout = Onmouseout;
	
	function Onmouseout()
	{
		FMCRemoveOpacitySheet( window );
		
		img.parentNode.removeChild( img );
	}
}

function FMCPopupThumbnailShow( node, x, y )
{
	var popupSrc = FMCGetAttribute( node, "MadCap:popupSrc" );
	var popupWidth = FMCGetAttribute( node, "MadCap:popupWidth" );
	var popupHeight = FMCGetAttribute(node, "MadCap:popupHeight");
	var popupAlt = FMCGetAttribute(node, "MadCap:popupAlt") == null ? "" : FMCGetAttribute(node, "MadCap:popupAlt");

	var img = document.createElement( "img" );
	img.className = "MCPopupThumbnail_Popup";
	img.setAttribute("src", popupSrc);
	img.setAttribute("alt", popupAlt);
	img.setAttribute("tabindex", 0);
	img.style.width = popupWidth + "px";
	img.style.height = popupHeight + "px";
	
	var left = Math.max( 5, x - (popupWidth / 2) );
	var top = Math.max( 5, y - (popupHeight / 2) );
	
	document.body.appendChild( img );
	
	var newXY = FMCGetInBounds( img, left, top );
	
	img.style.left = newXY.X + "px";
	img.style.top = newXY.Y + "px";
	
	FMCInsertOpacitySheet( window, "#eeeeee" );
	
	MCFader.FadeIn( img, 0, 100, null, 0, 0, false );
	
	return img;
}

function GetHelpControlLinks( node, callbackFunc, callbackArgs )
{
	var linkMap = new Array();
	var inPreviewMode = FMCInPreviewMode();

	if ( !inPreviewMode )
	{
	    if (!FMCIsStandaloneTopic())
	    {
	        var masterHS = FMCGetMasterHelpSystem();

	        if (masterHS.IsMerged())
	        {
	            if (FMCGetMCAttribute(node, "MadCap:indexKeywords") != null)
	            {
	                var indexKeywords = FMCGetMCAttribute(node, "MadCap:indexKeywords").replace("\\;", "%%%%%");

	                if (indexKeywords == "")
	                {
	                    callbackFunc(linkMap, callbackArgs);
	                }

	                var indexFrame = MCGlobals.RootFrame.frames["navigation"].frames["index"];

	                FMCPostMessageRequest(indexFrame, "get-keyword-links", [indexKeywords], function (data)
	                {
	                    callbackFunc(data, callbackArgs);
	                }, function ()
	                {
	                    function OnInit()
	                    {
	                        var keywords = indexKeywords.split(";");

	                        for (var i = 0; i < keywords.length; i++)
	                        {
	                            keywords[i] = keywords[i].replace("%%%%%", ";");

	                            var currKeyword = keywords[i].replace("\\:", "%%%%%");
	                            var keywordPath = currKeyword.split(":");
	                            var level = keywordPath.length - 1;
	                            var indexKey = level + "_" + keywordPath[level].replace("%%%%%", ":");

	                            var currLinkMap = indexFrame.gLinkMap.GetItem(indexKey.toLowerCase());

	                            // currLinkMap may be blank if keywords[i] isn't found in index XML file (user may have deleted keyword after associating it with a K-Link)

	                            if (currLinkMap)
	                            {
	                                currLinkMap.ForEach(function (key, value)
	                                {
	                                    linkMap[linkMap.length] = key + "|" + value;

	                                    return true;
	                                });
	                            }
	                        }

	                        callbackFunc(linkMap, callbackArgs);
	                    }

	                    indexFrame.Index_Init(OnInit);
	                });

	                return;
	            }
	            else if (FMCGetMCAttribute(node, "MadCap:concepts") != null)
	            {
	                var concepts = FMCGetMCAttribute(node, "MadCap:concepts");
	                var args = { callbackFunc: callbackFunc, callbackArgs: callbackArgs };

	                masterHS.GetConceptsLinks(concepts, OnGetConceptsLinks, args);

	                return;
	            }
	        }
	    }
	}
	
	if ( FMCGetMCAttribute( node, "MadCap:topics" ) != null )
	{
		var topics  = FMCGetMCAttribute( node, "MadCap:topics" ).split( "||" );
	    
		if ( topics == "" )
		{
			callbackFunc( linkMap, callbackArgs );
		}
	    
		for ( var i = 0; i < topics.length; i++ )
		{
			linkMap[linkMap.length] = topics[i];
		}
	}

	callbackFunc( linkMap, callbackArgs );
}

function OnGetConceptsLinks( links, args )
{
	var callbackFunc	= args.callbackFunc;
	var callbackArgs	= args.callbackArgs;
	
	callbackFunc( links, callbackArgs );
}

function FMCTextPopup( e, node )
{
    // Don't continue if something is already popped up
    
    if ( gPopupObj )
    {
        return;
    }
    
    if ( !e )
    {
        e = window.event;
    }
    
    // Find top node
    
    while ( !FMCContainsClassRoot( node.className, "MCTextPopup" ) )
    {
        node = node.parentNode;
    }
    
    // Toggle the icon
    
    var imgNodes    = node.getElementsByTagName( "img" );
    
    for ( var i = 0; i < imgNodes.length; i++ )
    {
        var imgNode = imgNodes[i];
        
        if ( FMCContainsClassRoot( imgNode.className, "MCExpandingIcon" ) )
        {
            FMCImageSwap( imgNode, "swap" );
            gImgNode = imgNode;
            
            break;
        }
    }
    
    // Hide/unhide the body
    
    var nodes   = node.childNodes;
    
    for ( i = 0; i < nodes.length; i++ )
    {
        var node = nodes[i];
        
        if ( FMCContainsClassRoot( node.className, "MCTextPopupBody" ) )
        {
            gTextPopupBody = node;
            break;
        }
    }
    
    FMCShowTextPopup( e );
}

function FMCShowTextPopup( e )
{
    if ( gTextPopupBody.style.display == "none" )
    {
        if ( gTextPopupBody.childNodes.length == 0 )
        {
            gTextPopupBody.appendChild( document.createTextNode( "(No data to display)") );
        }
        
        gTextPopupBody.style.display = "";
        
        FMCSetTextPopupSize( gTextPopupBody );

        var clientX = e.clientX + FMCGetScrollLeft(window);
        var clientY = e.clientY + FMCGetScrollTop(window);
        var newXY = FMCGetInBounds(gTextPopupBody, clientX, clientY);

        gTextPopupBody.style.left = newXY.X + "px";
        gTextPopupBody.style.top = newXY.Y + "px";
        
        // Set up background
        
        gTextPopupBodyBG = document.createElement( "span" );
        gTextPopupBodyBG.className = "MCTextPopupBodyBG";
        gTextPopupBodyBG.style.top = parseInt( gTextPopupBody.style.top ) + 5 + "px";
        gTextPopupBodyBG.style.left = parseInt( gTextPopupBody.style.left ) + 5 + "px";
        
        FMCSetTextPopupDimensions();
        
        gTextPopupBody.parentNode.appendChild( gTextPopupBodyBG );
        window.onresize = FMCSetTextPopupDimensions;
        gPopupObj = gTextPopupBody;
        gPopupBGObj = gTextPopupBodyBG;
        gJustPopped = true;
        
        //

        FMCSetOpacity(gPopupObj, 0);
        FMCSetOpacity(gPopupBGObj, 0);
        gFadeID = setInterval( FMCFade, 10 );
    }
}

function FMCSetTextPopupSize( popupNode )
{
    var clientWidth     = FMCGetClientWidth( window, false );
    var clientHeight    = FMCGetClientHeight( window, false );
    var stepSize        = 10;
    var hwRatio         = clientHeight / clientWidth;
    var maxX            = clientWidth * 0.618034;
    var i               = 0;
    
    while ( true )
    {
        popupNode.style.width = maxX - (i * stepSize) + "px";
        popupNode.style.height = (maxX - (i * stepSize)) * hwRatio + "px";
        
        // "- 2" is to account for borderLeft + borderRight.
        
        if ( popupNode.scrollHeight > popupNode.offsetHeight - 2 || popupNode.scrollWidth > popupNode.offsetWidth - 2 )
        {
            popupNode.style.overflow = "hidden";    // Since scrollbars are now present, remove them before enlarging the node or else they'll still be present in Firefox and Safari
            
            popupNode.style.width = maxX - ((i - 1) * stepSize) + "px";
            popupNode.style.height = (maxX - ((i - 1) * stepSize)) * hwRatio + "px";
            
            break;
        }
        
        i++;
    }
    
    // Debug
    //window.status = popupNode.offsetWidth + ", " + popupNode.scrollWidth + ", " + popupNode.offsetHeight + ", " + popupNode.scrollHeight;
}

function FMCToggler( node )
{
    // Don't continue if something is already popped up
    
    if ( gPopupObj )
    {
        return;
    }
    
    // Toggle the icon
    
    var imgNodes    = node.getElementsByTagName( "img" );
    
    for ( var i = 0; i < imgNodes.length; i++ )
    {
        var imgNode = imgNodes[i];
        
        if ( FMCContainsClassRoot( imgNode.className, "MCTogglerIcon" ) )
        {
            FMCImageSwap( imgNode, "swap" );
            
            break;
        }
    }
    
    // Toggle all toggler items
    
    var targets = FMCGetMCAttribute( node, "MadCap:targets" ).split( ";" );
    
    for ( var i = 0; i < targets.length; i++ )
    {
        var nodes   = FMCGetElementsByAttribute( document.body, "MadCap:targetName", targets[i] );
        
        for ( var j = 0; j < nodes.length; j++ )
        {
			if ( nodes[j].style.display == "none" )
			{
				nodes[j].style.display = "";
				
				FMCUnhide( window, nodes[j] );
			}
			else
			{
				nodes[j].style.display = "none";
			}
        }
    }
}

function FMCSetTextPopupDimensions()
{
    gTextPopupBodyBG.style.width = gTextPopupBody.offsetWidth + "px";
    gTextPopupBodyBG.style.height = gTextPopupBody.offsetHeight + "px";
}
