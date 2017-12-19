/// <reference path="MadCapUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function TopicComments_Init(topicID, OnCompleteFunc)
{
    gTopicID = topicID;

    //

	if ( gInit )
	{
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
		}
		
		return;
	}
	
	// Don't do this if we're inside a topic popup
	
	if ( FMCIsTopicPopup( window.parent ) )
	{
		gInit = true;
		
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
		}
		
		return;
	}
    
    //

	window.setTimeout( Init2, 0 );

	function Init2()
	{
		var buttonTable			= document.getElementById( "Buttons" );
		var tr					= buttonTable.getElementsByTagName( "tr" )[0];
		
		FMCSetupButtonFromStylesheet( tr, "Control", "CommentsAddButton", "Images/AddComment.gif", "Images/AddComment_over.gif", "Images/AddComment_selected.gif", 23, 22, "Add comment", "", AddComment );
		FMCSetupButtonFromStylesheet( tr, "Control", "CommentsReplyButton", "Images/ReplyComment.gif", "Images/ReplyComment_over.gif", "Images/ReplyComment_selected.gif", 23, 22, "Reply to comment", "", ReplyComment );
		FMCSetupButtonFromStylesheet( tr, "Control", "CommentsRefreshButton", "Images/RefreshTopicComments.gif", "Images/RefreshTopicComments_over.gif", "Images/RefreshTopicComments_selected.gif", 23, 22, "Refresh comments", "", TopicComments_RefreshComments );
		
		//

		var labelTD	= document.createElement( "td" );
		var label	= CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "Label", "Comments" );

		labelTD.appendChild( document.createTextNode( label ) );
		labelTD.style.fontFamily = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "FontFamily", "Arial, Sans-Serif" );
		labelTD.style.fontSize = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "FontSize", "16px" );
		labelTD.style.fontWeight = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "FontWeight", "bold" );
		labelTD.style.fontStyle = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "FontStyle", "normal" );
		labelTD.style.color = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "Color", "#000000" );
		labelTD.style.whiteSpace = "nowrap";

		tr.replaceChild( labelTD, tr.firstChild );

		//

		buttonTable.parentNode.style.borderTop = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "BorderTop", "solid 1px #5EC9FF" );
		buttonTable.parentNode.style.borderBottom = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "BorderBottom", "solid 1px #5EC9FF" );
		buttonTable.parentNode.style.borderLeft = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "BorderLeft", "none" );
		buttonTable.parentNode.style.borderRight = CMCFlareStylesheet.LookupValue( "Frame", "BodyComments", "BorderRight", "none" );

		//
		
		TopicComments_LoadSkin();

		//

		gInit = true;
		
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
		}
	}
}

function TopicComments_LoadSkin()
{
    document.body.style.backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "BodyComments", "BackgroundColor", "#ffffff");
}

function GetTopicCommentsOnComplete( commentsXml, refreshCount )
{
	if ( refreshCount != gRefreshCount )
	{
		return;
	}
	
	var commentsDiv	= document.getElementById( "LiveHelpComments" );
	
	if ( commentsDiv )
	{
		var newCommentsDiv	= commentsDiv.cloneNode( false );
		
		commentsDiv.parentNode.replaceChild( newCommentsDiv, commentsDiv );
		
		commentsDiv = newCommentsDiv;
	}
	else
	{
		commentsDiv = document.createElement( "div" );
		commentsDiv.id = "LiveHelpComments";
		
		document.body.appendChild( commentsDiv );
	}
	
	var xmlDoc	= CMCXmlParser.LoadXmlString( commentsXml );

	TopicComments_Build( xmlDoc.documentElement, commentsDiv, 0 );
	
	//
	
	var loadingImg	= document.getElementById( "MCLoadingImage" );

	if (loadingImg && loadingImg.parentNode)
	    loadingImg.parentNode.removeChild( loadingImg );
	
	//

	document.body.style.padding = "0px";

	// Issue with CHMs: first access of document's scroll height is incorrect. Subsequent accesses return the correct value so call it once before using its value.

	FMCGetScrollHeight(window);

	var height = FMCGetScrollHeight(window);

	FMCPostMessageRequest(MCGlobals.BodyFrame, "set-topic-comments-height", [height], null, function ()
	{
	    var iframe = MCGlobals.BodyFrame.document.getElementById("topiccomments");
	    iframe.style.height = height + "px";
	});
}

function TopicComments_Build( xmlNode, htmlNode, indent )
{
	for ( var i = 0; i < xmlNode.childNodes.length; i++ )
	{
		var node	= xmlNode.childNodes[i];
	    
		if ( node.nodeName != "Comment" )
		{
			continue;
		}
		
		//
		
		var isReply			= false;
		var styleClass		= "CommentNode";
		var commentsNode	= FMCGetChildNodeByTagName( node, "Comments", 0 );
		
		if ( commentsNode != null && commentsNode.childNodes.length > 0 )
		{
			isReply = true;
			styleClass = "CommentReplyNode";
		}
		
		//
	    
		var subject		= node.getAttribute( "Subject" );
		var username	= node.getAttribute( "User" );
		var date		= node.getAttribute( "DateUTC" );
		
		if ( date == null )
		{
			// Feedback V1 used "Date", V2 uses "DateUTC". We could do a version check, but simply checking for the attribute it easier.
			
			date = node.getAttribute( "Date" );
		}
	    
		var outerDiv	= document.createElement( "div" );
		var innerDiv	= document.createElement( "div" );
		var subjectDiv	= document.createElement( "div" );
		var subjectSpan	= document.createElement( "span" );
		var infoDiv		= document.createElement( "div" );
		var img			= document.createElement( "img" );
		
		outerDiv.appendChild( innerDiv );
		
		outerDiv.style.marginLeft = indent + "px";
		
		innerDiv.setAttribute( "MadCap:commentID", node.getAttribute( "CommentID" ) );
		innerDiv.setAttribute( "MadCap:bgColor", "Transparent" );
//		innerDiv.setAttribute( "MadCap:bgColorOver", "#CEE3FF" );
//		innerDiv.setAttribute( "MadCap:bgColorSelected", "#5EC9FF" );
		innerDiv.setAttribute( "MadCap:bgColorSelected", CMCFlareStylesheet.LookupValue( "Control", styleClass, "BackgroundColor", "#CEE3FF" ) );

		innerDiv.style.cursor = "default";
//		innerDiv.onmouseover = CommentOnmouseover;
//		innerDiv.onmouseout = CommentOnmouseout;
		innerDiv.onclick = TopicComments_CommentOnclick;
		innerDiv.ondblclick = ReplyComment;

	    subjectDiv.style.fontFamily = CMCFlareStylesheet.LookupValue( "Control", styleClass, "SubjectFontFamily", "Arial" );
	    subjectDiv.style.fontSize = CMCFlareStylesheet.LookupValue( "Control", styleClass, "SubjectFontSize", "12px" );
	    subjectDiv.style.fontWeight = CMCFlareStylesheet.LookupValue( "Control", styleClass, "SubjectFontWeight", "bold" );
	    subjectDiv.style.fontStyle = CMCFlareStylesheet.LookupValue( "Control", styleClass, "SubjectFontStyle", "normal" );
	    subjectDiv.style.color = CMCFlareStylesheet.LookupValue( "Control", styleClass, "SubjectColor", "#000000" );
	    subjectDiv.appendChild( img );
	    subjectDiv.appendChild( subjectSpan );
	    
	    if ( FMCIsSafari() )
	    {
			subjectSpan.innerHTML = subject;
	    }
	    else
	    {
			subjectSpan.appendChild( document.createTextNode( subject ) );
		}

        innerDiv.appendChild( subjectDiv );
		
		if ( username )
		{
			var userSpan	= document.createElement( "span" );
			userSpan.style.fontFamily = CMCFlareStylesheet.LookupValue( "Control", styleClass, "UserInfoFontFamily", "Arial" );
			userSpan.style.fontSize = CMCFlareStylesheet.LookupValue( "Control", styleClass, "UserInfoFontSize", "10px" );
			userSpan.style.fontWeight = CMCFlareStylesheet.LookupValue( "Control", styleClass, "UserInfoFontWeight", "normal" );
			userSpan.style.fontStyle = CMCFlareStylesheet.LookupValue( "Control", styleClass, "UserInfoFontStyle", "normal" );
			userSpan.style.color = CMCFlareStylesheet.LookupValue( "Control", styleClass, "UserInfoColor", "#000000" );
			
			if ( FMCIsSafari() )
			{
				userSpan.innerHTML = username;
			}
			else
			{
				userSpan.appendChild( document.createTextNode( username ) );
			}
			
			infoDiv.appendChild( userSpan );
		}
		
		if ( date )
		{
			if ( username )
			{
				infoDiv.appendChild( document.createTextNode( " " ) );
			}
			
			var dateObj		= CMCDateTimeHelpers.GetDateFromUTCString( date );
			var dateSpan	= document.createElement( "span" );
			dateSpan.appendChild( document.createTextNode( CMCDateTimeHelpers.ToUIString( dateObj ) ) );
			dateSpan.style.fontFamily = CMCFlareStylesheet.LookupValue( "Control", styleClass, "TimestampFontFamily", "Arial" );
			dateSpan.style.fontSize = CMCFlareStylesheet.LookupValue( "Control", styleClass, "TimestampFontSize", "10px" );
			dateSpan.style.fontWeight = CMCFlareStylesheet.LookupValue( "Control", styleClass, "TimestampFontWeight", "normal" );
			dateSpan.style.fontStyle = CMCFlareStylesheet.LookupValue( "Control", styleClass, "TimestampFontStyle", "italic" );
			dateSpan.style.color = CMCFlareStylesheet.LookupValue( "Control", styleClass, "TimestampColor", "#000000" );
			
			infoDiv.appendChild( dateSpan );
		}
		
		infoDiv.style.marginLeft = "16px";
		innerDiv.appendChild( infoDiv );
		
		var bodyNode	= FMCGetChildNodeByTagName( node, "Body", 0 );
		
		if ( bodyNode )
		{
			var commentNode	= bodyNode.childNodes[0];
			
			if ( commentNode )
			{
				var comment		= commentNode.nodeValue;
				var commentDiv	= document.createElement( "div" );

				commentDiv.appendChild( document.createTextNode( comment ) );
				commentDiv.style.marginLeft = "16px";
				commentDiv.style.fontFamily = CMCFlareStylesheet.LookupValue( "Control", styleClass, "BodyFontFamily", "Arial" );
				commentDiv.style.fontSize = CMCFlareStylesheet.LookupValue( "Control", styleClass, "BodyFontSize", "10px" );
				commentDiv.style.fontWeight = CMCFlareStylesheet.LookupValue( "Control", styleClass, "BodyFontWeight", "normal" );
				commentDiv.style.fontStyle = CMCFlareStylesheet.LookupValue( "Control", styleClass, "BodyFontStyle", "normal" );
				commentDiv.style.color = CMCFlareStylesheet.LookupValue( "Control", styleClass, "BodyColor", "#000000" );
				
				innerDiv.appendChild( commentDiv );
			}
		}

		outerDiv.appendChild( document.createElement( "br" ) );
		
		var commentsNode	= FMCGetChildNodeByTagName( node, "Comments", 0 );

		if ( isReply )
		{
			CMCFlareStylesheet.SetImageFromStylesheet( img, "Control", styleClass, "Icon", "Images/CommentReply.gif", 16, 16 );
			
			TopicComments_Build( commentsNode, outerDiv, indent + 16 );
		}
		else
		{
			CMCFlareStylesheet.SetImageFromStylesheet( img, "Control", styleClass, "Icon", "Images/Comment.gif", 16, 16 );
		}
	    
		htmlNode.appendChild( outerDiv );
	}
}

var gRefreshCount	= 0;

function TopicComments_RefreshComments( e )
{
    if (FMCIsSkinPreviewMode())
        return;

	if ( !e ) { e = window.event; }
	
	gRefreshCount++;

	//
	
	var loadingImg = document.getElementById( "MCLoadingImage" );
	
	if ( loadingImg == null )
	{
		loadingImg = document.createElement( "img" );
		loadingImg.id = "MCLoadingImage";
		loadingImg.src = "Images/LoadingAnimated.gif";
		loadingImg.style.width = "16px";
		loadingImg.style.height = "16px";
		loadingImg.style.position = "absolute";
		loadingImg.style.top = "5px";
		loadingImg.style.left = "5px";
		document.body.insertBefore( loadingImg, document.body.childNodes[0] );
	}
	
	//

	gSelectedComment = null;
	
	if ( FMCIsHtmlHelp() )
	{
		FMCRegisterCallback( "Persistence", MCEventType.OnInit, function( args )
		{
			var userGuid		= FMCLoadUserData( "LiveHelpUserGuid" );

			gServiceClient.GetTopicComments(gTopicID, userGuid, null /* -FIX- */, GetTopicCommentsOnComplete, gRefreshCount);
		}, null );
	}
	else
	{
	    var userGuid = FMCReadCookie("LiveHelpUserGuid");

	    gServiceClient.GetTopicComments(gTopicID, userGuid, null /* -FIX- */, GetTopicCommentsOnComplete, gRefreshCount);
	}
}

function AddComment( e )
{
	if ( !e ) { e = window.event; }

	if (gTopicID != null)
	{
	    FMCPostMessageRequest(MCGlobals.BodyFrame, "open-comment-dialog", [false, null, null], null, function ()
	    {
	        MCGlobals.BodyFrame.FMCOpenCommentDialog(false, null, null);
	    });
	}
}

function ReplyComment( e )
{
	if ( !e ) { e = window.event; }
	
	if ( gSelectedComment == null )
	{
		alert( "Please select a comment to reply to." );
		
		return;
	}

	var comment			= gSelectedComment.getElementsByTagName( "div" )[2].firstChild.nodeValue;
	var parentCommentID	= FMCGetAttribute( gSelectedComment, "MadCap:commentID" );

	FMCPostMessageRequest(MCGlobals.BodyFrame, "open-comment-dialog", [true, comment, parentCommentID], null, function ()
	{
	    MCGlobals.BodyFrame.FMCOpenCommentDialog(true, comment, parentCommentID);
	});
}

var gSelectedComment	= null;

function TopicComments_CommentOnclick( e )
{
	if ( !e ) { e = window.event; }
	
	if ( gSelectedComment )
	{
		var c1	= FMCGetMCAttribute( gSelectedComment, "MadCap:bgColor" );
		var c2	= FMCGetMCAttribute( gSelectedComment, "MadCap:bgColorSelected" );
		
		gSelectedComment.setAttribute( "MadCap:bgColor", c2 );
		gSelectedComment.setAttribute( "MadCap:bgColorSelected", c1 );
		gSelectedComment.style.backgroundColor = c2;
	}
	
	var bgColor			= FMCGetMCAttribute( this, "MadCap:bgColor" );
	var bgColorSelected	= FMCGetMCAttribute( this, "MadCap:bgColorSelected" );
	
	this.setAttribute( "MadCap:bgColor", bgColorSelected );
	this.setAttribute( "MadCap:bgColorSelected", bgColor );
	this.style.backgroundColor = bgColorSelected;
	
	gSelectedComment = this;
}

//function CommentOnmouseover( e )
//{
//	if ( !e ) { e = window.event; }
//	
//	var bgColor	= FMCGetMCAttribute( this, "MadCap:bgColorOver" );
//	
//	this.style.backgroundColor = bgColor;
//}

//function CommentOnmouseout( e )
//{
//	if ( !e ) { e = window.event; }
//	
//	var bgColor	= FMCGetMCAttribute( this, "MadCap:bgColor" );
//	
//	this.style.backgroundColor = bgColor;
//}

function TopicComments_OnMessage(e)
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

        if (message == "init")
        {
            var topicID = dataValues[0];

            TopicComments_Init(topicID, function ()
            {
                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            });

            //

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "refresh-comments")
        {
            TopicComments_RefreshComments();

            //

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

if ( gRuntimeFileType == "TopicComments" )
{

var gInit = false;
var gTopicID = null;

if (FMCIsChromeLocal())
{
    window.addEventListener("message", TopicComments_OnMessage, false);
}

}
