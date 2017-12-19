/// <reference path="MadCapUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.2.2.0</version>
////////////////////////////////////////////////////////////////////////////////

function Default_WindowOnload()
{
	var framesForBridge	= ["body", "navigation"];
	
	for ( var i = 0; i < framesForBridge.length; i++ )
	{
		var frameName	= framesForBridge[i];
		
		frames[frameName].parentSandboxBridge = {};
		
		for ( var key in frames["bridge"].childSandboxBridge )
		{
			frames[frameName].parentSandboxBridge[key] = frames["bridge"].childSandboxBridge[key];
		}
	}
}

function CheckCSH()
{
    var hash = document.location.hash.substring(1);

    hash = CMCUrl.StripInvalidCharacters(hash);

    if (hash != "")
    {
        if (FMCIsSafari())
        {
            hash = hash.replace(/%23/g, "#");
        }

        var cshParts = hash.split("|");
        var oldForm = false;

        for (var i = 0; i < cshParts.length; i++)
        {
            var pair = cshParts[i].split("=");

            if (pair[0] == "CSHID")
            {
                gCSHID = decodeURIComponent(pair[1]);
                oldForm = true;
            }
            else if (pair[0] == "StartTopic")
            {
                gStartTopic = decodeURIComponent(pair[1]);
                oldForm = true;
            }
            else if (pair[0] == "SkinName")
            {
                gSkinFolder = "Data/Skin" + pair[1] + "/";
                oldForm = true;
            }
            else if (pair[0] == "Pulse")
            {
                var pulsePath = cshParts[i].substring("Pulse".length + 1);
                gStartTopic = gServiceClient.PulseServer + decodeURIComponent(pulsePath);
                oldForm = true;
            }
        }

        if (!oldForm) {
            var url = new CMCUrl(decodeURIComponent(hash));
            var pulsePath = url.QueryMap.GetItem("pulsepath");
            if (pulsePath) { // if pulse notification link 
                gStartTopic = url.PlainPath;
                gPulsePath = pulsePath;
            }
        }
    }
}


function Default_Preload(onCompleteFunc)
{
    var pulsePath = CMCUrl.HashMap.GetItem("Pulse");

    if (pulsePath && FMCIsLiveHelpEnabled())
    {
        gServiceClient.Init(onCompleteFunc());
    }
    else
    {
        onCompleteFunc();
    }
}


function Default_Init()
{
	FMCPreloadImage( MCGlobals.SkinTemplateFolder + "Images/Loading.gif" );

	Default_LoadSkin(function ()
	{
	    FMCRegisterCallback("Navigation", MCEventType.OnInit, function ()
	    {
	        NavigateToStartupTopic();

	        gInit = true;
	    }, null);
	});
}

function NavigateToStartupTopic()
{
    function OnSearchFinished(numResults)
    {
        if (!firstPick || numResults == 0)
        {
            var path = MCGlobals.RootFolder + parent.gStartTopic;

            if (parent.gCSHID != null)
            {
                path = path.Insert(path.indexOf("#"), "?CSHID=" + encodeURIComponent(parent.gCSHID));
            }

            FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate", [path], null, function ()
            {
                parent.frames["body"].document.location.href = path;
            });
        }
    }

    var searchString = document.location.search.substring(1).replace(/%20/g, " ");

    if (searchString == "")
    {
        var path = null;
        var startupTopicUrl = new CMCUrl(gStartTopic);

        if (gPulsePath) {
            gStartTopic = FMCGetHelpSystem().ContentFolder + gStartTopic;
        }

        if (!startupTopicUrl.IsAbsolute)
            path = MCGlobals.RootFolder + gStartTopic;
        else
            path = gStartTopic;

        if (gCSHID != null) {
            path = path.Insert(path.indexOf("#"), "?CSHID=" + encodeURIComponent(gCSHID));
        }
        else if (gPulsePath != null) {
            path = path.Insert(path.indexOf("#"), "?PulsePath=" + encodeURIComponent(gPulsePath));
        }

        FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate-replace", [path], null, function ()
        {
            MCGlobals.BodyFrame.document.location.replace(path);
        });

        FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-default-pane-active", null, null, function ()
        {
            MCGlobals.NavigationFrame.SetActiveIFrame(MCGlobals.NavigationFrame.gcDefaultID, MCGlobals.NavigationFrame.gcDefaultTitle);
        });
    }
    else
    {
        var firstPick = false;

        if (searchString.EndsWith("|FirstPick"))
        {
            firstPick = true;
            searchString = searchString.substring(0, searchString.length - "|FirstPick".length);
        }

        FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-active-iframe-by-name", ["search"], null, function ()
        {
            MCGlobals.NavigationFrame.SetActiveIFrameByName("search");
        });

        FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["search"], "do-search", [searchString, firstPick], OnSearchFinished, function ()
        {
            var searchFrame = MCGlobals.NavigationFrame.frames["search"];

            searchFrame.document.forms["search"].searchField.value = searchString;
            searchFrame.StartSearch(firstPick, OnSearchFinished, null);
        });
    }
}

function Default_LoadSkin(OnCompleteFunc)
{
    CMCXmlParser.GetXmlDoc(gRootFolder + gSkinFolder + "Skin.xml", true, function (xmlDoc)
    {
        var xmlHead = xmlDoc.getElementsByTagName("CatapultSkin")[0];
        var caption = xmlHead.getAttribute("Title");

        if (caption == null)
        {
            var masterHS = FMCGetHelpSystem();

            if (masterHS.IsWebHelpPlus)
            {
                caption = "WebHelp Plus";
            }
            else
            {
                caption = "WebHelp";
            }
        }

        document.title = caption;

        //

        Default_LoadWebHelpOptions(xmlDoc);

        var heightPx = CMCFlareStylesheet.LookupValue("Frame", "Toolbar", "Height", null);

        if (heightPx != null)
        {
            var frameset = null;

            if (gNavPosition == "Left" || gNavPosition == "Right")
            {
                frameset = gOuterFrameset;
            }
            else if (gNavPosition == "Top" || gNavPosition == "Bottom")
            {
                frameset = gInnerFrameset;
            }

            frameset.rows = heightPx + ", *";
        }

        if (document.location.hash == null || document.location.hash.indexOf("OpenType=Javascript") == -1)
        {
            LoadSize(xmlDoc);
        }

        OnCompleteFunc();
    }, null);
}

function LoadSize( xmlDoc )
{
    try
    {
        var doc = frames["body"].document;
    }
    catch ( err )
    {
        return;
    }
    
    var xmlHead			= xmlDoc.documentElement;
    var useDefaultSize	= FMCGetAttributeBool( xmlHead, "UseBrowserDefaultSize", false );
    
    if ( useDefaultSize )
    {
		return;
    }

    var topPx = FMCGetAttributeInt(xmlHead, "Top", 0);
    var leftPx = FMCGetAttributeInt(xmlHead, "Left", 0);
    var bottomPx = FMCGetAttributeInt(xmlHead, "Bottom", 0);
    var rightPx = FMCGetAttributeInt(xmlHead, "Right", 0);
    var widthPx = FMCGetAttributeInt(xmlHead, "Width", 800);
    var heightPx = FMCGetAttributeInt(xmlHead, "Height", 600);
    
    var anchors = xmlHead.getAttribute( "Anchors" );
    
    if ( anchors )
    {
        var aTop    = (anchors.indexOf( "Top" ) > -1)    ? true : false;
        var aLeft   = (anchors.indexOf( "Left" ) > -1)   ? true : false;
        var aBottom = (anchors.indexOf( "Bottom" ) > -1) ? true : false;
        var aRight  = (anchors.indexOf( "Right" ) > -1)  ? true : false;
        var aWidth  = (anchors.indexOf( "Width" ) > -1)  ? true : false;
        var aHeight = (anchors.indexOf( "Height" ) > -1) ? true : false;
    }
    
    if ( aLeft && aRight )
    {
        widthPx = screen.availWidth - (leftPx + rightPx);
    }
    else if ( !aLeft && aRight )
    {
        leftPx = screen.availWidth - (widthPx + rightPx);
    }
    else if ( aWidth )
    {
        leftPx = (screen.availWidth / 2) - (widthPx / 2);
    }
    
    if ( aTop && aBottom )
    {
        heightPx = screen.availHeight - (topPx + bottomPx);
    }
    else if ( !aTop && aBottom )
    {
        topPx = screen.availHeight - (heightPx + bottomPx);
    }
    else if ( aHeight )
    {
        topPx = (screen.availHeight / 2) - (heightPx / 2);
    }
    
	if ( window == top )
	{
		try
		{
			// This is in a try/catch block because there seems to be a bug in IE where if the window loses focus
			// immediately before these statements are executed, IE will produce an "Access is denied" error.
			
			window.resizeTo( widthPx, heightPx );
			window.moveTo( leftPx, topPx );
		}
		catch ( err )
		{
		}
	}
}

function Default_LoadWebHelpOptions( xmlDoc )
{
    var webHelpOptions	= xmlDoc.getElementsByTagName( "WebHelpOptions" )[0];
    
    if ( webHelpOptions )
    {
		if ( webHelpOptions.getAttribute( "NavigationPanePosition" ) )
		{
			gNavPosition = webHelpOptions.getAttribute( "NavigationPanePosition" );
		}
		
        if ( webHelpOptions.getAttribute( "NavigationPaneWidth" ) )
        {
            var navWidth    = webHelpOptions.getAttribute( "NavigationPaneWidth" );

            if (navWidth != "0") {
                var hideNavStartup = FMCGetAttributeBool(webHelpOptions, "HideNavigationOnStartup", false);

                if (!hideNavStartup) {
                    if (gNavPosition == "Left") {
                        document.getElementsByTagName("frameset")[1].cols = navWidth + ", *";
                    }
                    else if (gNavPosition == "Right") {
                        document.getElementsByTagName("frameset")[1].cols = "*, " + navWidth;
                    }
                    else if (gNavPosition == "Top") {
                        var resizeBarHeight = 7;

                        document.getElementsByTagName("frameset")[0].rows = navWidth + ", " + resizeBarHeight + ", *";
                    }
                    else if (gNavPosition == "Bottom") {
                        document.getElementsByTagName("frameset")[0].rows = "*, " + navWidth;
                    }
                }
            }
            else if (navWidth == "0") {
                if (gNavPosition == "Left") {
                    document.getElementsByTagName("frameset")[1].cols = navWidth + ", *";
                }
                else if (gNavPosition == "Right") {
                    document.getElementsByTagName("frameset")[1].cols = "*, " + navWidth;
                }
            }
        }
        
		gHideNavStartup = FMCGetAttributeBool( webHelpOptions, "HideNavigationOnStartup", false );

		if ( gHideNavStartup )
		{
		    Default_ShowHideNavigation(false);
		}
    }
    
    // Safari
    
    if ( FMCIsSafari() )
    {
		var frameNodes	= document.getElementsByTagName( "frame" );
		
		for ( var i = 0; i < frameNodes.length; i++ )
        {
            if ( frameNodes[i].name == "navigation" )
            {
				if ( gNavPosition == "Left" )
				{
					frameNodes[i].style.borderRight = "solid 1px #444444";
					
					break;
				}
				else if ( gNavPosition == "Right" )
				{
					frameNodes[i].style.borderLeft = "solid 1px #444444";
                    
                    break;
				}
            }
        }
    }
}

function Default_ShowHideNavigation( slide )
{
	if ( gInnerFrameset == null || gOuterFrameset == null || gBodyFrameNode == null )
	{
		return;
	}
	
    if ( gChanging )
    {
        return;
    }
    
    gChanging = true;
    gSlide = slide;
    
    if ( gNavigationState == "visible" )
    {
		gNavigationState = "hidden";
    }
    else if ( gNavigationState == "hidden" )
    {
		gNavigationState = "visible";
    }
    
	for ( var i = 0, length = gChangeNavigationStateStartedListeners.length; i < length; i++ )
	{
	    gChangeNavigationStateStartedListeners[i](gNavigationState, gNavPosition);
    }

	for (var i = 0, length = gChangeNavigationStateStartedMessageListeners.length; i < length; i++)
    {
        var win = gChangeNavigationStateStartedMessageListeners[i];
        FMCPostMessageRequest(win, "change-navigation-state-started", [gNavigationState, gNavPosition], null, null);
    }
    
    if ( gNavigationState == "hidden" )  // Hiding
	{            
		gNavigationFrameNode.tabIndex = "-1";
	}
	else                         // Showing
	{
		gNavigationFrameNode.tabIndex = "0";
	}
    
    if ( gNavPosition == "Left" || gNavPosition == "Right" )
    {
        ShowHideNavigationHorizontal();
    }
    else
    {
        ShowHideNavigationVertical();
    }
}

function ShowHideNavigationHorizontal()
{
    if ( gNavigationState == "hidden" )  // Hiding
    {
    	// IE 8 bug: Frameset col and row value is incorrect after the frameset has been resized using the mouse. Instead, we'll now use the frame's clientWidth and clientHeight value.
//        var cols    = gInnerFrameset.cols;
//        
//        if ( gNavPosition == "Left" )
//        {
//            gNavigationWidth = parseInt( cols );
//        }
//        else if ( gNavPosition == "Right" )
//        {
//            gNavigationWidth = parseInt( cols.substring( cols.indexOf( "," ) + 1 ) );
//        }

        FMCPostMessageRequest(frames["navigation"], "get-client-width", null, function (data)
        {
            var clientWidth = parseInt(data[0]);
            gNavigationWidth = clientWidth;
            gCurrNavigationWidth = gNavigationWidth;

            gIntervalID = setInterval(ChangeNavigationHorizontal, 10);
        }, function ()
        {
            gNavigationWidth = frames["navigation"].document.documentElement.clientWidth;
            gCurrNavigationWidth = gNavigationWidth;

            gIntervalID = setInterval(ChangeNavigationHorizontal, 10);
        });
    }
    else                         // Showing
    {
        gInnerFrameset.setAttribute( "border", 4 );
        gInnerFrameset.setAttribute( "frameSpacing", 2 )
        gBodyFrameNode.setAttribute("frameBorder", 1);

        gIntervalID = setInterval(ChangeNavigationHorizontal, 10);
    }
}

function ShowHideNavigationVertical()
{
    if ( gNavigationState == "hidden" )  // Hiding
    {
    	// IE 8 bug: Frameset col and row value is incorrect after the frameset has been resized using the mouse. Instead, we'll now use the frame's clientWidth and clientHeight value.
//        var rows    = gOuterFrameset.rows;
//        
//        if ( gNavPosition == "Top" )
//        {
//            gNavigationWidth = parseInt( rows );
//        }
//        else if ( gNavPosition == "Bottom" )
//        {
//            gNavigationWidth = parseInt( rows.substring( rows.indexOf( "," ) + 1 ) );
//        }

        FMCPostMessageRequest(frames["navigation"], "get-client-height", null, function (data)
        {
            var clientHeight = parseInt(data[0]);
            gNavigationWidth = clientHeight;
            gCurrNavigationWidth = gNavigationWidth;

            gIntervalID = setInterval(ChangeNavigationVertical, 10);
        }, function ()
        {
            gNavigationWidth = frames["navigation"].document.documentElement.clientHeight;
            gCurrNavigationWidth = gNavigationWidth;

            gIntervalID = setInterval(ChangeNavigationVertical, 10);
        });
    }
    else                         // Showing
    {
        if ( gNavPosition == "Bottom" )
        {
            gOuterFrameset.setAttribute( "border", 4 );
            gOuterFrameset.setAttribute( "frameSpacing", 2 )
        }

        gIntervalID = setInterval(ChangeNavigationVertical, 10);
    }
}

function ChangeNavigationHorizontal()
{
	// IE 8 bug: Frameset col and row value is incorrect after the frameset has been resized using the mouse. Instead, we'll now use the frame's clientWidth and clientHeight value.
//    var cols    = gInnerFrameset.cols;
//    
//    if ( gNavPosition == "Left" )
//    {
//        var currWidth   = parseInt( cols );
//    }
//    else if ( gNavPosition == "Right" )
//    {
//        var currWidth   = parseInt( cols.substring( cols.indexOf( "," ) + 1 ) );
//    }
    
    if ( gSlide )
    {
    	gCurrNavigationWidth = Math.min(Math.max(gCurrNavigationWidth + gNavigationChangeStep, 0), gNavigationWidth);
    }
    else
    {
    	gCurrNavigationWidth = 0;
	}
    
    for ( var i = 0, length = gChangingNavigationStateListeners.length; i < length; i++ )
    {
        gChangingNavigationStateListeners[i](gCurrNavigationWidth);
    }

    for (var i = 0, length = gChangingNavigationStateMessageListeners.length; i < length; i++)
    {
        var win = gChangingNavigationStateMessageListeners[i];
        FMCPostMessageRequest(win, "changing-navigation-state", [gCurrNavigationWidth], null, null);
    }

    if (gCurrNavigationWidth <= 0 || gCurrNavigationWidth >= gNavigationWidth)
    {
        clearInterval( gIntervalID );
        
        for ( var i = 0, length = gChangeNavigationStateCompletedListeners.length; i < length; i++ )
		{
		    gChangeNavigationStateCompletedListeners[i](gNavigationState, gNavPosition);
		}

		for (var i = 0, length = gChangeNavigationStateCompletedMessageListeners.length; i < length; i++)
		{
		    var win = gChangeNavigationStateCompletedMessageListeners[i];
		    FMCPostMessageRequest(win, "change-navigation-state-completed", [gNavigationState, gNavPosition], null, null);
		}
        
        if ( gNavigationState == "hidden" )  // Hiding
        {
        	gCurrNavigationWidth = 0;
            
            gInnerFrameset.setAttribute( "border", 0 );
            gInnerFrameset.setAttribute( "frameSpacing", 0 )
        }
        else                         // Showing
        {
        	gCurrNavigationWidth = gNavigationWidth;
        }
        
        gNavigationChangeStep *= -1;
        gChanging = false;
    }
    
    if ( gNavPosition == "Left" )
    {
    	gInnerFrameset.cols = gCurrNavigationWidth + ", *";
    }
    else if ( gNavPosition == "Right" )
    {
    	gInnerFrameset.cols = "*, " + gCurrNavigationWidth;
    }
}

function ChangeNavigationVertical()
{
	// IE 8 bug: Frameset col and row value is incorrect after the frameset has been resized using the mouse. Instead, we'll now use the frame's clientWidth and clientHeight value.
//    var rows    = gOuterFrameset.rows;
//    
//    if ( gNavPosition == "Top" )
//    {
//        var currHeight  = parseInt( rows );
//    }
//    else if ( gNavPosition == "Bottom" )
//    {
//        var currHeight  = parseInt( rows.substring( rows.indexOf( "," ) + 1 ) );
//    }

	gCurrNavigationWidth = gSlide ? gCurrNavigationWidth + gNavigationChangeStep : 0;
	
    var resizeBarHeight = 7;

    if (gCurrNavigationWidth <= 0 || gCurrNavigationWidth >= gNavigationWidth)
    {
        clearInterval( gIntervalID );
        
        for ( var i = 0, length = gChangeNavigationStateCompletedListeners.length; i < length; i++ )
		{
		    gChangeNavigationStateCompletedListeners[i](gNavigationState, gNavPosition);
		}

		for (var i = 0, length = gChangeNavigationStateCompletedMessageListeners.length; i < length; i++)
		{
		    var win = gChangeNavigationStateCompletedMessageListeners[i];
		    FMCPostMessageRequest(win, "change-navigation-state-completed", [gNavigationState, gNavPosition], null, null);
		}
        
        if ( gNavigationState == "hidden" )  // Hiding
        {
        	gCurrNavigationWidth = 0;
            resizeBarHeight = 0;
            
            if ( gNavPosition == "Bottom" )
            {
                gOuterFrameset.setAttribute( "border", 0 );
                gOuterFrameset.setAttribute( "frameSpacing", 0 )
            }
        }
        else                         // Showing
        {
        	gCurrNavigationWidth = gNavigationWidth;
            resizeBarHeight = 7;
        }
        
        gNavigationChangeStep *= -1;
        gChanging = false;
    }
    
    if ( gNavPosition == "Top" )
    {
    	gOuterFrameset.rows = gCurrNavigationWidth + ", " + resizeBarHeight + ", *";
    }
    else if ( gNavPosition == "Bottom" )
    {
    	gOuterFrameset.rows = "*, " + gCurrNavigationWidth;
    }
}

function Default_OnMessage(e)
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
        var needsCallbackFired = true;
        var responseData = new Array();

        if (message == "subscribe-change-navigation-state-started") {
            gChangeNavigationStateStartedMessageListeners.push(e.source);
            responseData[responseData.length] = gChangeNavigationStateStartedMessageListeners.length - 1;

            handled = true;
        }
        else if (message == "subscribe-change-navigation-state-completed") {
            gChangeNavigationStateCompletedMessageListeners.push(e.source);
            responseData[responseData.length] = gChangeNavigationStateCompletedMessageListeners.length - 1;

            handled = true;
        }
        else if (message == "subscribe-changing-navigation-state") {
            gChangingNavigationStateMessageListeners.push(e.source);
            responseData[responseData.length] = gChangingNavigationStateMessageListeners.length - 1;

            handled = true;
        }
        else if (message == "unsubscribe-change-navigation-state-started") {
            var eventID = parseInt(dataValues[0]);
            gChangeNavigationStateStartedMessageListeners.Remove(eventID);

            handled = true;
            needsCallbackFired = false; // Don't fire the callback because the source window is "undefined" by now (this gets called from the source window's onunload code).
        }
        else if (message == "unsubscribe-change-navigation-state-completed") {
            var eventID = parseInt(dataValues[0]);
            gChangeNavigationStateCompletedMessageListeners.Remove(eventID);

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "unsubscribe-changing-navigation-state") {
            var eventID = parseInt(dataValues[0]);
            gChangingNavigationStateMessageListeners.Remove(eventID);

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "show-hide-navigation") {
            var slide = dataValues[0];
            Default_ShowHideNavigation(slide);

            handled = true;
        }
        else if (message == "body-loaded") {
            gBodyFrameNode.setAttribute("data-src", dataValues[0]);

            handled = true;
            needsCallBackFired = false;
        }
        else if (message == "get-return-url") {
            var returnUrl = null;

            var src = gBodyFrameNode.getAttribute("data-src");
            if (!src)
                src = gBodyFrameNode.getAttribute("src");

            if (src) {
                var returnUrlIndex = src.indexOf('?returnUrl=');
                if (returnUrlIndex > -1) {
                    returnUrl = src.substring(returnUrlIndex + '?returnUrl='.length);
                }
            }

            responseData[responseData.length] = returnUrl;

            handled = true;
        }
        else if (message == "navigate-home") {
            var frameNodes = document.getElementsByTagName("frame");
            var bodyFrameNode = null;

            for (var i = 0, length = frameNodes.length; i < length; i++) {
                if (frameNodes[i].name == "body") {
                    bodyFrameNode = frameNodes[i];
                    break;
                }
            }

            bodyFrameNode.removeAttribute("data-src");
            bodyFrameNode.src = MCGlobals.DefaultStartTopic;

            //

            handled = true;
        }
        else if (message == "navigate-body") {
            var path = dataValues[0];

            gBodyFrameNode.removeAttribute("data-src");
            gBodyFrameNode.setAttribute("src", path);

            handled = true;
        }
        else if (message == "navigate-body-relative") {
            var relPath = dataValues[0];
            var helpSystem = FMCGetHelpSystem();
            var fullPath = MCGlobals.RootFolder + helpSystem.ContentFolder + relPath;

            gBodyFrameNode.removeAttribute("data-src");
            gBodyFrameNode.setAttribute("src", fullPath);

            handled = true;
        }
        else if (message == "navigate-pulse") {
            var path = dataValues[0];

            gServiceClient.Init(function () {
                // append returnUrl if register/forgotpassword
                var lowerPath = path.toLowerCase();

                if (lowerPath === 'feedback/account/register' || path.toLowerCase() === 'forgotpassword') {
                    var src = gBodyFrameNode.getAttribute("data-src");
                    if (!src)
                        src = gBodyFrameNode.getAttribute("src");

                    if (src) {
                        var returnUrlIndex = src.indexOf('?returnUrl=');

                        if (returnUrlIndex > -1) {
                            returnUrl = src.substring(returnUrlIndex + '?returnUrl='.length);
                        }
                        else {
                            returnUrl = src;
                        }

                        path += '?returnUrl=' + returnUrl;
                    }
                }

                gBodyFrameNode.setAttribute("data-src", path);
                gBodyFrameNode.setAttribute("src", gServiceClient.PulseServer + path);
            });

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "set-pulse-login-id") {
            if (gServiceClient)
                gServiceClient.PulseUserGuid = dataValues[0];

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "login-pulse") {
            FMCPostMessageRequest(MCGlobals.BodyFrame, "login-pulse", null, null, null, true);

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "login-complete" || message == "logout-complete") {
            if (MCGlobals.BodyFrame) {
                FMCPostMessageRequest(MCGlobals.BodyFrame, "reload", null, null, null, true);
                FMCPostMessageRequest(MCGlobals.BodyFrame, "reload-pulse", null, null, null, true);
                FMCPostMessageRequest(MCGlobals.BodyFrame, "close-login-dialog", null, null, null, true);
            }

            if (MCGlobals.NavigationFrame) {
                FMCPostMessageRequest(MCGlobals.NavigationFrame, "reload-community", null, null, null, true);
            }

            handled = true;
            needsCallbackFired = false;
        }

        if (handled)
        {
            if (needsCallbackFired)
            {
                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            }
        }
    }
}

if ( gRuntimeFileType == "Default" )
{

var gInit					= false;
var gRootFolder				= FMCGetRootFolder( document.location );
var gStartTopic				= gDefaultStartTopic;
var gPulsePath              = null;
var gCSHID					= null;
var gLoadingLabel			= "LOADING";
var gLoadingAlternateText	= "Loading";
var gOuterFrameset			= null;
var gInnerFrameset			= null;
var gBodyFrameNode			= null;
var gNavigationWidth;
var gCurrNavigationWidth;
var gNavPosition			= "Left";
var gNavigationState		= "visible";
var gNavigationChangeStep	= -30;
var gSlide					= true;
var gChanging				= false;
var gChangeNavigationStateStartedListeners = new Array();
var gChangeNavigationStateCompletedListeners = new Array();
var gChangingNavigationStateListeners = new Array();
var gChangeNavigationStateStartedMessageListeners = new Array();
var gChangeNavigationStateCompletedMessageListeners = new Array();
var gChangingNavigationStateMessageListeners = new Array();
var gHideNavStartup = false;

if ( FMCIsWebHelpAIR() )
{
	gOnloadFuncs.push( Default_WindowOnload );
}

window.onresize = function()
{
	// Firefox on Mac: might trigger this event before everything is finished being loaded.
	
	var indexFrame	= frames["navigation"].frames["index"];
	
	if ( indexFrame )
	{
        FMCPostMessageRequest(indexFrame, "refresh-index", null, null, function ()
        {
            indexFrame.RefreshIndex();
        });
	}
};

Default_Preload(CheckCSH);

gReadyFuncs.push( 
	function()
	{
		var framesetNodes = document.getElementsByTagName( "frameset" );
		
		gOuterFrameset = framesetNodes[0];
		gInnerFrameset = framesetNodes[1];

		var frameNodes = document.getElementsByTagName( "frame" );
	    
		for ( var i = 0; i < frameNodes.length; i++ )
		{
			var currName    = frameNodes[i].name;
	        
			switch ( currName )
			{
				case "mctoolbar":
					gToolbarFrameNode = frameNodes[i];
					break;
				case "navigation":
					gNavigationFrameNode = frameNodes[i];
					break;
				case "body":
					gBodyFrameNode = frameNodes[i];
					break;
			}
		}
	}
);

gOnloadFuncs.push( Default_Init );

if (window.postMessage != null)
{
    if (window.addEventListener)
        window.addEventListener("message", Default_OnMessage, false);
    else if (window.attachEvent)
        window.attachEvent("onmessage", Default_OnMessage);
}

}
