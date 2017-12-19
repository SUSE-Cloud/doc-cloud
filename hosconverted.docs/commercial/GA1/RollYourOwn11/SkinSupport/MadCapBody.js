/// <reference path="MadCapUtilities.js" />
/// <reference path="MadCapLiveHelpUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function FMCInit()
{
	if ( gInit )
	{
		return;
	}

	//

	FMCCheckForBookmark();

	if (FMCIsWebHelp() && window.name == "body" && !FMCIsStandaloneTopic()) {
	    FMCPostMessageRequest(parent, "body-loaded", [document.location.href]);

	    FMCRegisterCallback("TOC", MCEventType.OnInit, function ()
	    {
	        var tocPath = FMCGetTocPath();
	        var href = FMCGetBodyHref();

	        FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["toc"], "sync-toc", [tocPath, href.FullPath], null, function ()
	        {
	            if (MCGlobals.NavigationFrame.frames["toc"].gSyncTOC)
	            {
	                FMCSyncTOC(tocPath, href);
	            }
	        }, null);
	    });
	}
	
	if ( MCGlobals.ToolbarFrame != null )
	{
	    FMCRegisterCallback("Toolbar", MCEventType.OnInit, function ()
	    {
	        var topicID = FMCGetMCAttribute(document.documentElement, "MadCap:liveHelp");

	        FMCPostMessageRequest(MCGlobals.ToolbarFrame, "topic-initialized", [topicID], null, function ()
	        {
	            MCGlobals.ToolbarFrame.gTopicID = topicID;

	            if (MCGlobals.ToolbarFrame.document.getElementById("RatingIcons") != null)
	            {
	                MCGlobals.ToolbarFrame.SetRating(0);
	                MCGlobals.ToolbarFrame.UpdateRating();
	            }

	            MCGlobals.ToolbarFrame.OnBodyInitSetCurrentTopicIndex();
	        });
	    }, null);
	}

	var topicToolbarHeight = null;

	if (!FMCIsWebHelp() || MCGlobals.RootFrame != null) // Check if standalone topic
	{
	    topicToolbarHeight = CMCFlareStylesheet.LookupValue("Frame", "TopicToolbar", "Height", null);
	}

	if (topicToolbarHeight != null)
	{
	    var topicToolbars = document.getElementsByTagName("iframe");

	    for (var i = 0, length = topicToolbars.length; i < length; i++)
	    {
	        var topicToolbar = topicToolbars[i];
	        var iframeName = FMCGetAttribute(topicToolbar, "name");

	        if (iframeName != null && iframeName.StartsWith("mctoolbar"))
	        {
	            topicToolbar.style.height = topicToolbarHeight;
	        }
	    }
	}

	FMCInitBodyCommentsFrame();
	
	if ( MCGlobals.BodyCommentsFrame != null && !FMCIsTopicPopup( window ) )
	{
		if ( !FMCIsWebHelp() || MCGlobals.RootFrame != null )	// Standalone topic
		{
		    gServiceClient.Init(function () {
		        var iframe = document.getElementById("topiccomments");

		        if (!gServiceClient.PulseEnabled) {
		            var feedbackCommentsSrc = FMCGetTopicCommentsUrl();

		            if (iframe.getAttribute("src") !== feedbackCommentsSrc) {
		                iframe.setAttribute("src", feedbackCommentsSrc);
		            }

		            FMCRegisterCallback("BodyComments", MCEventType.OnLoad, FMCOnBodyCommentsLoaded, null);

		            return;
		        }

		        var topicID = FMCGetAttribute(document.documentElement, "MadCap:liveHelp");

		        if (!gServiceClient.PulseActive)
		            return;

		        var pulsePath = CMCUrl.QueryMap.GetItem("PulsePath");
		        if (pulsePath) {
		            FMCSetPulseFrameSrc(gServiceClient.PulseServer + pulsePath);
		        }
		        else {
		            gServiceClient.GetPulseStreamID(topicID, function (streamID) {
		                FMCSetPulseFrameSrc(gServiceClient.PulseServer + "streams/" + streamID + "/activities?frame=stream");
		            }, null);
		        }
		    }, null);
		}
	}

	FMCHighlightUrl(window);

	//

    // Old way that didn't work, but didn't want to remove because I'm not sure what it is supposed to do
    //	if ( MCGlobals.RootFrame == null && !FMCIsTopicPopup( window ) )
    //	{
    //	    var framesetLinks = FMCGetElementsByClassName("MCWebHelpFramesetLink", null, document.body);
    //		
    //		for ( var i = 0; i < framesetLinks.length; i++ )
    //		{
    //			var framesetLink	= framesetLinks[i];
    //			framesetLink.style.display = "";
    //		}
    //    }

    if (MCGlobals.RootFrame == null && FMCIsTopicPopup(window) == false) {
        var framesetLinks = FMCGetElementsByClassName("MCWebHelpFramesetLink", null, document.body);

        for (var i = 0; i < framesetLinks.length; i++) {
            var framesetLink = framesetLinks[i];
            framesetLink.style.display = "block";
        }
    }

	//

	if ( FMCIsLiveHelpEnabled() && !FMCIsSkinPreviewMode() )
	{
	    gServiceClient.Init(function () {
	        var topicID = FMCGetMCAttribute(document.documentElement, "MadCap:liveHelp");

	        if (gServiceClient.Version == 1) {
	            gServiceClient.LogTopic(topicID);
	        }
	        else {
	            var cshID = CMCUrl.QueryMap.GetItem("CSHID");

	            gServiceClient.LogTopic2(topicID, cshID, function () {
	                if (MCGlobals.BodyCommentsFrame != null && !FMCIsTopicPopup(window)) {
	                    if (!FMCIsWebHelp() || MCGlobals.RootFrame != null)	// Standalone topic
	                    {
	                        var iframe = document.getElementById("topiccomments");

	                        if (!gServiceClient.PulseEnabled) {
	                            var feedbackCommentsSrc = FMCGetTopicCommentsUrl();

	                            if (iframe.getAttribute("src") !== feedbackCommentsSrc) {
	                                iframe.setAttribute("src", feedbackCommentsSrc);
	                            }

	                            FMCRegisterCallback("BodyComments", MCEventType.OnLoad, FMCOnBodyCommentsLoaded, null);

	                            return;
	                        }

	                        if (!gServiceClient.PulseActive)
	                            return;

	                        var topicID = FMCGetAttribute(document.documentElement, "MadCap:liveHelp");

	                        var pulsePath = CMCUrl.QueryMap.GetItem("PulsePath");
	                        if (pulsePath) {
	                            FMCSetPulseFrameSrc(gServiceClient.PulseServer + pulsePath);
	                        }
	                        else {
	                            gServiceClient.GetPulseStreamID(topicID, function (streamID) {
	                                FMCSetPulseFrameSrc(gServiceClient.PulseServer + "streams/" + streamID + "/activities?frame=stream");
	                            }, null);
	                        }
	                    }
	                }
	            }, null, null);
	        }
	    }, null, null);
	}

	if (MadCap.Slideshow)
	    MadCap.Slideshow.Init();

	//

	gInit = true;
}

function FMCSetPulseFrameSrc(src) {
    var iframe = document.getElementById("topiccomments");
    if (iframe.getAttribute("src") !== src) {
        iframe.setAttribute("src", src);
        iframe.style.height = "1000px"; // -TODO- Fix this
    }
}

function FMCInitBodyCommentsFrame() {
    if (MCGlobals.BodyCommentsFrame == null && FMCIsLiveHelpEnabled()) {
        var iframe = document.getElementById("topiccomments");
        if (iframe)
            MCGlobals.BodyCommentsFrame = iframe.contentWindow;
    }
}

function FMCOnBodyCommentsLoaded()
{
    function TopicComments_OnInit()
    {
        FMCPostMessageRequest(MCGlobals.BodyCommentsFrame, "refresh-comments", null, null, function ()
        {
            MCGlobals.BodyCommentsFrame.TopicComments_RefreshComments();
        });
    }

    var topicID = FMCGetMCAttribute(document.documentElement, "MadCap:liveHelp");

    FMCPostMessageRequest(MCGlobals.BodyCommentsFrame, "init", [topicID], TopicComments_OnInit, function ()
    {
        MCGlobals.BodyCommentsFrame.TopicComments_Init(topicID, TopicComments_OnInit);
    });
}

function FMCCheckForBookmark()
{
    var hash	= document.location.hash;
    
    if ( !hash )
    {
        return;
    }
    
    var bookmark	= null;
    
    if ( hash.charAt( 0 ) == "#" )
    {
        hash = hash.substring( 1 );
    }
    
    var currAnchor  = null;
    
    for ( var i = 0; i < document.anchors.length; i++ )
    {
        currAnchor = document.anchors[i];
        
        if ( currAnchor.name == hash )
        {
            bookmark = currAnchor;
            
            break;
        }
    }
    
    if ( bookmark )
    {
        FMCUnhide( window, currAnchor );
        
        // Won't navigate to the bookmark on load since it was inside a hidden node. So, after we ensure it's visible, navigate to the bookmark manually.
        var bookmarkTop = FMCGetPosition(bookmark)[0];
        window.scrollTo(0, bookmarkTop);

        if (FMCIsHtmlHelp()) //Bug 86027 - Skip the rest for chm files. It's an issue with html help topics containing the X-UA-Compatible meta tag
            return;
        
        if ( navigator.userAgent.Contains( "MSIE 7", false ) )
        {
			// IE 7 bug: Older builds of IE 7 have the following bug: if you create an iframe who's URL has a bookmark and the iframe's opacity has been set,
			// the document won't scroll to the bookmark. It seems to be a render issue because scrolling the document in the iframe causes it to jump down to
			// the bookmark and scroll from there. The hack workaround is to cause the iframe to redraw after the document has loaded, which is done here.
	        
	        window.setTimeout( function()
	        {
				document.body.style.display = "none";
				document.body.style.display = "";
			}, 1 );
        }
    }
}

function FMCGetTocPath()
{
    var tocPath = FMCGetMCAttribute(document.documentElement, "MadCap:tocPath");
    var href = FMCGetBodyHref();
    var master = FMCGetMasterHelpSystem();
    var fullTocPath = master.GetFullTocPath("toc", href.FullPath);

    if (fullTocPath)
    {
        tocPath = tocPath ? fullTocPath + "|" + tocPath : fullTocPath;
    }

    return tocPath;
}

function FMCSyncTOC(tocPath, href)
{
	if ( !MCGlobals.NavigationFrame.frames["toc"] || MCGlobals.BodyFrame.document != document )
	{
		return;
	}

	MCGlobals.NavigationFrame.frames["toc"].SyncTOC( tocPath, href );
}

function FMCGlossaryTermHyperlinkOnClick( node )
{
    var navFrame	= MCGlobals.NavigationFrame;
    var anchorName	= FMCGetMCAttribute( node, "MadCap:anchor" );
    
    navFrame.SetActiveIFrameByName( "glossary" );
    navFrame.frames["glossary"].DropDownTerm( anchorName );
}

function FMCDisplayAbout(url, alternateText, width, height)
{
    try
    {
        if (!document.getElementById("About"))
        {
            var imgAbout = document.createElement("img");

            document.body.appendChild(imgAbout);

            var clientCenter = FMCGetClientCenter(window);

            imgAbout.id = "About";
            imgAbout.src = url;
            imgAbout.alt = alternateText;
            imgAbout.style.display = "none";
            imgAbout.style.width = width;
            imgAbout.style.height = height;
            imgAbout.style.position = "absolute";
            imgAbout.style.left = (clientCenter[0] - (width / 2)) + "px";
            imgAbout.style.top = (clientCenter[1] - (height / 2)) + "px";
            imgAbout.style.zIndex = "5";
            imgAbout.style.border = "none";
            imgAbout.style.background = "none";
            imgAbout.style.display = "";

            //

            gPopupObj = imgAbout;
            gPopupBGObj = null;

            if (gPopupObj.filters)
            {
                gPopupObj.style.filter = "alpha( opacity = 0 )";
            }
            else if (gPopupObj.style.MozOpacity != null)
            {
                gPopupObj.style.MozOpacity = "0.0";
            }

            FMCSetOpacity(gPopupObj, 0);
            gFadeID = setInterval(FMCFade, 10);

            //

            if (document.body.setCapture)
            {
                document.body.setCapture();

                document.body.onmousedown = FMCRemoveAbout;
            }
            else if (document.addEventListener)
            {
                document.addEventListener("mousedown", FMCRemoveAbout, true);

                if (!FMCIsChromeLocal())
                {
                    MCGlobals.ToolbarFrame.document.addEventListener("mousedown", FMCRemoveAbout, true);

                    var navFrame = MCGlobals.NavigationFrame;
                    navFrame.document.addEventListener("mousedown", FMCRemoveAbout, true);
                    navFrame.frames[navFrame.gActiveIFrame.id].document.addEventListener("mousedown", FMCRemoveAbout, true);
                }
            }
        }
    }
    catch (ex)
    {
        // Exception occurs when body frame document is an external URL

        return;
    }
}

function FMCRemoveAbout()
{
    var imgAbout = document.getElementById("About");

    imgAbout.parentNode.removeChild(imgAbout);

    if (document.body.releaseCapture)
    {
        document.body.releaseCapture();

        document.body.onmousedown = null;
    }
    else if (document.removeEventListener)
    {
        document.removeEventListener("mousedown", FMCRemoveAbout, true);

        if (!FMCIsChromeLocal())
        {
            MCGlobals.ToolbarFrame.document.removeEventListener("mousedown", FMCRemoveAbout, true);

            var navFrame = MCGlobals.NavigationFrame;
            navFrame.document.removeEventListener("mousedown", FMCRemoveAbout, true);
            navFrame.frames[navFrame.gActiveIFrame.id].document.removeEventListener("mousedown", FMCRemoveAbout, true);
        }
    }

    gPopupObj = null;
}

function FMCQuickSearch(searchString)
{
    var searchType = FMCGetAttribute(document.documentElement, "MadCap:SearchType");

    FMCClearSearch(window);
    FMCHighlight(window, searchString, gColorTable[0], false, searchType);
}

function FMCRemoveHighlight()
{
    FMCClearSearch(window);
}

function GetButtonsForToolbarProxy(toolbarName)
{
    var buttons = null;
    var toolbarIFrame = LookupIFrame(toolbarName);

    if (toolbarIFrame != null)
    {
        buttons = FMCGetAttributeStringList(toolbarIFrame, "MadCap:buttonItems", "|");
    }

    return buttons;
}

function FMCGetTopicCommentsUrl() {
    var root = new CMCUrl(gMasterHelpSystem.GetPath());
    var extension = new CMCUrl(gMasterHelpSystem.DefaultStartTopic).Extension;
    var topicComments = root.AddFile(gMasterHelpSystem.SkinTemplateFolder + "TopicComments." + extension);
    var relTopicComments = topicComments.ToRelative(new CMCUrl(document.location.href));

    return relTopicComments.FullPath;
}

function Body_OnMessage(e)
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

        if (message == "set-topic-comments-height") {
            var height = dataValues[0];
            var iframe = document.getElementById("topiccomments");
            iframe.style.height = height + "px";

            //

            handled = true;
        }
        else if (message == "display-about") {
            var url = dataValues[0];
            var alternateText = dataValues[1];
            var width = parseInt(dataValues[2]);
            var height = parseInt(dataValues[3]);

            FMCDisplayAbout(url, alternateText, width, height);

            //

            handled = true;
        }
        else if (message == "expand-all") {
            var swapType = dataValues[0];

            FMCExpandAll(swapType);

            //

            handled = true;
        }
        else if (message == "print-topic") {
            window.focus();
            window.print();

            //

            handled = true;
        }
        else if (message == "quick-search") {
            var searchString = dataValues[0];

            FMCQuickSearch(searchString);

            //

            handled = true;
        }
        else if (message == "remove-highlight") {
            FMCRemoveHighlight();

            //

            handled = true;
        }
        else if (message == "get-bs-path") {
            var bsPath = CMCUrl.QueryMap.GetItem("BrowseSequencePath");
            var href = FMCGetBodyHref();

            if (bsPath == null) {
                bsPath = FMCGetMCAttribute(document.documentElement, "MadCap:browseSequencePath");

                if (bsPath != null) {
                    var master = FMCGetHelpSystem();
                    var fullBsPath = master.GetFullTocPath("browsesequences", href.PlainPath);

                    if (fullBsPath) {
                        bsPath = bsPath ? fullBsPath + "|" + bsPath : fullBsPath;
                    }
                }
            }

            responseData[responseData.length] = bsPath;
            responseData[responseData.length] = href.FullPath;

            //

            handled = true;
        }
        else if (message == "get-advance-topic-body-info") {
            responseData[responseData.length] = FMCGetBodyHref().FullPath;
            responseData[responseData.length] = MCGlobals.BodyFrame.CMCUrl.QueryMap.GetItem("BrowseSequencePath");
            responseData[responseData.length] = FMCGetMCAttribute(MCGlobals.BodyFrame.document.documentElement, "MadCap:browseSequencePath");
            responseData[responseData.length] = MCGlobals.BodyFrame.CMCUrl.QueryMap.GetItem("TocPath");
            responseData[responseData.length] = FMCGetMCAttribute(MCGlobals.BodyFrame.document.documentElement, "MadCap:tocPath");

            //

            handled = true;
        }
        else if (message == "open-comment-dialog") {
            var reply = FMCStringToBool(dataValues[0]);
            var comment = dataValues[1];
            var parentCommentID = dataValues[2];

            FMCOpenCommentDialog(reply, comment, parentCommentID);

            //

            handled = true;
        }
        else if (message == "edit-user-profile" || message == "login-pulse") {
            FMCEditUserProfile();

            //

            handled = true;
        }
        else if (message == "close-login-dialog") {
            var dlg = CMCDialog.GetFirstDialog();
            if (dlg)
                CMCDialog.Close(dlg.RootEl);

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "reload-pulse") {
            var commentsFrame = frames["topiccomments"];
            if (commentsFrame)
                FMCPostMessageRequest(commentsFrame, "reload", null, null, null, true);

            //

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "get-buttons-for-toolbar-proxy") {
            var toolbarName = dataValues[0];
            var buttons = GetButtonsForToolbarProxy(toolbarName);

            responseData[responseData.length] = buttons;

            //

            handled = true;
        }
        else if (message == "set-pulse-login-id") {
            if (gServiceClient)
                gServiceClient.PulseUserGuid = dataValues[0];

            FMCPostMessageRequest(parent, "set-pulse-login-id", dataValues, null, null, true);

            handled = true;
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

if ( gRuntimeFileType == "Topic" )
{

//

if ( FMCIsDotNetHelp() || FMCIsHtmlHelp() )
{
	window.name = "body";
}

//

var gInit	= false;

gOnloadFuncs.push( FMCInit );

if (window.postMessage != null)
{
    if (window.addEventListener)
        window.addEventListener("message", Body_OnMessage, false);
    else if (window.attachEvent)
        window.attachEvent("onmessage", Body_OnMessage);
}

}
