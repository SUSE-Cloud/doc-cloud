/// <reference path="MadCapUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

var gEmptyIcon				= null;
var gFullIcon				= null;
var gIconWidth				= 16;
var gTopicRatingIconsInit	= false;

function TopicRatingIconsInit()
{
	if ( gTopicRatingIconsInit )
	{
		return;
	}
	
	//
	
	var value	= CMCFlareStylesheet.LookupValue( "ToolbarItem", "TopicRatings", "EmptyIcon", null );

	if ( value == null )
	{
		gEmptyIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Rating0.gif";
		gIconWidth = 16;
	}
	else
	{
		value = FMCStripCssUrl( value );
		value = decodeURIComponent( value );
		value = escape( value );
		gEmptyIcon = FMCGetSkinFolderAbsolute() + value;
	}

	value = CMCFlareStylesheet.LookupValue( "ToolbarItem", "TopicRatings", "FullIcon", null );

	if ( value == null )
	{
		gFullIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/RatingGold100.gif";
	}
	else
	{
		value = FMCStripCssUrl( value );
		value = decodeURIComponent( value );
		value = escape( value );
		gFullIcon = FMCGetSkinFolderAbsolute() + value;
	}
	
	//
	
	gTopicRatingIconsInit = true;
}

function FMCRatingIconsCalculateRating( e, iconContainer )
{
	if ( !e ) { e = window.event; }

	var x			= FMCGetMouseXRelativeTo( window, e, iconContainer );
	var imgNodes	= iconContainer.getElementsByTagName( "img" );
	var numImgNodes	= imgNodes.length;
	var iconWidth	= gIconWidth;
	var numIcons	= Math.ceil( x / iconWidth );
	numIcons = Math.max(numIcons, 1); // numIcons will be 0 if x was 0 (left most edge of the rating control).
	var rating		= numIcons * 100 / numImgNodes;
	
	return rating;
}

function FMCRatingIconsOnmousemove( e, iconContainer )
{
	TopicRatingIconsInit();
	
	//
	
	if ( !e ) { e = window.event; }

	var rating	= FMCRatingIconsCalculateRating( e, iconContainer );
	
	FMCDrawRatingIcons( rating, iconContainer );
}

function FMCClearRatingIcons( rating, iconContainer )
{
	FMCDrawRatingIcons( rating, iconContainer );
}

function FMCDrawRatingIcons( rating, iconContainer )
{
	TopicRatingIconsInit();
	
	//

	var imgNodes	= iconContainer.getElementsByTagName( "img" );
	var numImgNodes	= imgNodes.length;
	var numIcons	= Math.ceil( rating * numImgNodes / 100 );

	for ( var i = 0; i < numImgNodes; i++ )
	{
		var node	= imgNodes[i];
		
		if ( i <= numIcons - 1 )
		{
			node.src = gFullIcon;
		}
		else
		{
			node.src = gEmptyIcon;
		}
	}
}

//
//    Class CMCLiveHelpServiceClient
//

function FMCGetFeedbackServerUrl(prefix)
{
	var inPreviewMode = FMCGetAttributeBool( document.documentElement, "MadCap:InPreviewMode", false );
	
	if (inPreviewMode) {
		return null;
	}

	var serverUrl = FMCGetAttribute(document.documentElement, "MadCap:LiveHelpServer");
	
	if (serverUrl == null) {
		return null;
    }

    if (typeof prefix == 'undefined') {
        prefix = '';
    }
	
	var url			= serverUrl;
	var pos			= url.indexOf( ":" );
	var urlProtocol	= url.substring( 0, pos + 1 );
	var docProtocol	= document.location.protocol;
	
	url = url + prefix + "Service.FeedbackExplorer/FeedbackJsonService.asmx/";
	
	return url;
}

var gServiceClient = new function () {
    // Private member variables and functions

    var mSelf = this;
    var mInit = false;
    var mInitializing = false;
    var mInitOnCompleteFuncs = new Array();

    var mCallbackMap = new CMCDictionary();

    var mLiveHelpScriptIndex = 0;
    var mGetAverageRatingOnCompleteFunc = null;
    var mGetAverageRatingOnCompleteArgs = null;
    var mGetAnonymousEnabledOnCompleteFunc = null;
    var mGetAnonymousEnabledOnCompleteArgs = null;
    var mStartActivateUserOnCompleteFunc = null;
    var mStartActivateUserOnCompleteArgs = null;
    var mCheckUserStatusOnCompleteFunc = null;
    var mCheckUserStatusOnCompleteArgs = null;
    var mGetSynonymsFileOnCompleteFunc = null;
    var mGetSynonymsFileOnCompleteArgs = null;

    this.Server = FMCGetAttribute(document.documentElement, "MadCap:LiveHelpServer");
    this.FeedbackServer = FMCGetFeedbackServerUrl();
    this.Version = -1;
    this.PulseServer = null;
    this.PulseEnabled = false;
    this.PulseActive = false;
    this.PulseUserGuid = null;

    function InitComplete() {
        for (var i = 0; i < mInitOnCompleteFuncs.length; i++)
            mInitOnCompleteFuncs[i](mSelf);

        mInit = true;
    }

    function AddScriptTag(webMethodName, onCompleteFunc, nameValuePairs) {
        var script = document.createElement("script");
        var head = document.getElementsByTagName("head")[0];
        var scriptID = "MCLiveHelpScript_" + mLiveHelpScriptIndex++;
        var src = mSelf.FeedbackServer + webMethodName + "?";

        if (mSelf.FeedbackServer != null) {
            src += "OnComplete=" + onCompleteFunc + "&ScriptID=" + scriptID + "&UniqueID=" + (new Date()).getTime();

            if (nameValuePairs != null) {
                for (var i = 0, length = nameValuePairs.length; i < length; i++) {
                    var pair = nameValuePairs[i];
                    var name = pair[0];
                    var value = encodeURIComponent(pair[1]);

                    src += ("&" + name + "=" + value);
                }
            }

            if (window.ActiveXObject) {
                var ieUrlLimit = 2083;

                if (src.length > ieUrlLimit) {
                    var diff = src.length - ieUrlLimit;
                    var data = { ExceedAmount: diff };
                    var ex = new CMCFeedbackException(-1, "URL limit exceeded.", data);

                    throw ex;
                }
            }

            var qsLimit = 2048;
            var qsPos = src.indexOf("?")
            var qsChars = src.substring(qsPos + 1).length;

            if (qsChars > qsLimit) {
                var diff = qsChars - qsLimit;
                var data = { ExceedAmount: diff };
                var ex = new CMCFeedbackException(-1, "Query string limit exceeded.", data);

                throw ex;
            }

            script.id = scriptID;
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", src);

            head.appendChild(script);

            return scriptID;
        }
    }

    // Public member functions

    this.RemoveScriptTag = function (scriptID) {
        function RemoveScriptTag2() {
            var script = document.getElementById(scriptID);

            script.parentNode.removeChild(script);
        }

        // IE bug: Need this setTimeout() or else IE will crash. This happens when removing the <script> tag after re-navigating to the same page.

        window.setTimeout(RemoveScriptTag2, 10);
    }

    this.Init = function (onCompleteFunc) {
        if (mInit) {
            onCompleteFunc(this);
            return;
        }

        if (onCompleteFunc != null)
            mInitOnCompleteFuncs.push(onCompleteFunc);

        if (mInitializing)
            return;

        mInitializing = true;

        mSelf.GetVersion(function () {
            if (mSelf.PulseEnabled)
                mSelf.GetPulseServerActivated(function (active) {
                    mSelf.PulseActive = active && active.toLowerCase() === 'true';

                    InitComplete();
                });
            else
                InitComplete();
        });
    }

    this.LogTopic = function (topicID) {
        AddScriptTag("LogTopic", "gServiceClient.LogTopicOnComplete", [["TopicID", topicID]]);
    }

    this.LogTopicOnComplete = function (scriptID) {
        this.RemoveScriptTag(scriptID);
    }

    this.LogTopic2 = function (topicID, cshID, onCompleteFunc, onCompleteArgs, thisObj) {
        this.LogTopic2OnComplete = function (scriptID) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, onCompleteArgs);
                }
                else {
                    onCompleteFunc(onCompleteArgs);
                }
            }

            //

            this.RemoveScriptTag(scriptID);

            this.LogTopic2OnComplete = null;
        }

        AddScriptTag("LogTopic2", "gServiceClient.LogTopic2OnComplete", [["TopicID", topicID],
																			["CSHID", cshID]]);
    }

    this.LogSearch = function (projectID, userGuid, resultCount, language, query) {
        AddScriptTag("LogSearch", "gServiceClient.LogSearchOnComplete", [["ProjectID", projectID],
																			["UserGuid", userGuid],
																			["ResultCount", resultCount],
																			["Language", language],
																			["Query", query]]);
    }

    this.LogSearchOnComplete = function (scriptID) {
        this.RemoveScriptTag(scriptID);
    }

    this.AddComment = function (topicID, userGuid, userName, subject, comment, parentCommentID) {
        AddScriptTag("AddComment", "gServiceClient.AddCommentOnComplete", [["TopicID", topicID],
																				["UserGuid", userGuid],
																				["Username", userName],
																				["Subject", subject],
																				["Comment", comment],
																				["ParentCommentID", parentCommentID]]);
    }

    this.AddCommentOnComplete = function (scriptID) {
        this.RemoveScriptTag(scriptID);
    }

    this.GetAverageRating = function (topicID, onCompleteFunc, onCompleteArgs) {
        mGetAverageRatingOnCompleteFunc = onCompleteFunc;
        mGetAverageRatingOnCompleteArgs = onCompleteArgs;

        AddScriptTag("GetAverageRating", "gServiceClient.GetAverageRatingOnComplete", [["TopicID", topicID]]);
    }

    this.GetAverageRatingOnComplete = function (scriptID, averageRating, ratingCount) {
        if (mGetAverageRatingOnCompleteFunc != null) {
            mGetAverageRatingOnCompleteFunc(averageRating, ratingCount, mGetAverageRatingOnCompleteArgs);
            mGetAverageRatingOnCompleteFunc = null;
            mGetAverageRatingOnCompleteArgs = null;
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.SubmitRating = function (topicID, rating, comment, onCompleteFunc, onCompleteArgs) {
        var scriptID = AddScriptTag("SubmitRating", "gServiceClient.SubmitRatingOnComplete", [["TopicID", topicID],
																					["Rating", rating],
																					["Comment", comment]]);

        var callbackData = { OnCompleteFunc: onCompleteFunc, OnCompleteArgs: onCompleteArgs };

        mCallbackMap.Add(scriptID, callbackData);
    }

    this.SubmitRatingOnComplete = function (scriptID) {
        var callbackData = mCallbackMap.GetItem(scriptID);
        var callbackFunc = callbackData.OnCompleteFunc;
        var callbackArgs = callbackData.OnCompleteArgs;

        if (callbackFunc != null) {
            callbackFunc(callbackArgs);

            mCallbackMap.Remove(scriptID);
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.GetTopicComments = function (topicID, userGuid, userName, onCompleteFunc, onCompleteArgs) {
        var scriptID = AddScriptTag("GetTopicComments", "gServiceClient.GetTopicCommentsOnComplete", [["TopicID", topicID],
																										["UserGuid", userGuid],
																										["Username", userName]]);

        var callbackData = { OnCompleteFunc: onCompleteFunc, OnCompleteArgs: onCompleteArgs };

        mCallbackMap.Add(scriptID, callbackData);
    }

    this.GetTopicCommentsOnComplete = function (scriptID, commentsXml) {
        var callbackData = mCallbackMap.GetItem(scriptID);
        var callbackFunc = callbackData.OnCompleteFunc;
        var callbackArgs = callbackData.OnCompleteArgs;

        if (callbackFunc != null) {
            callbackFunc(commentsXml, callbackArgs);

            mCallbackMap.Remove(scriptID);
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.GetAnonymousEnabled = function (projectID, onCompleteFunc, onCompleteArgs) {
        mGetAnonymousEnabledOnCompleteFunc = onCompleteFunc;
        mGetAnonymousEnabledOnCompleteArgs = onCompleteArgs;

        var src = mSelf.FeedbackServer + "GetAnonymousEnabled?ProjectID=" + encodeURIComponent(projectID);

        AddScriptTag("GetAnonymousEnabled", "gServiceClient.GetAnonymousEnabledOnComplete", [["ProjectID", projectID]]);
    }

    this.GetAnonymousEnabledOnComplete = function (scriptID, enabled) {
        if (mGetAnonymousEnabledOnCompleteFunc != null) {
            mGetAnonymousEnabledOnCompleteFunc(enabled, mGetAnonymousEnabledOnCompleteArgs);
            mGetAnonymousEnabledOnCompleteFunc = null;
            mGetAnonymousEnabledOnCompleteArgs = null;
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.StartActivateUser = function (xmlDoc, onCompleteFunc, onCompleteArgs) {
        mStartActivateUserOnCompleteFunc = onCompleteFunc;
        mStartActivateUserOnCompleteArgs = onCompleteArgs;

        var usernameNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "Username");
        var username = FMCGetAttribute(usernameNode, "Value");
        var emailAddressNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "EmailAddress");
        var emailAddress = FMCGetAttribute(emailAddressNode, "Value");
        var firstNameNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "FirstName");
        var firstName = FMCGetAttribute(firstNameNode, "Value");
        var lastNameNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "LastName");
        var lastName = FMCGetAttribute(lastNameNode, "Value");
        var countryNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "Country");
        var country = FMCGetAttribute(countryNode, "Value");
        var postalCodeNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "PostalCode");
        var postalCode = FMCGetAttribute(postalCodeNode, "Value");
        var genderNode = FMCGetChildNodeByAttribute(xmlDoc.documentElement, "Name", "Gender");
        var gender = FMCGetAttribute(genderNode, "Value");
        var uiLanguageOrder = "";

        AddScriptTag("StartActivateUser", "gServiceClient.StartActivateUserOnComplete", [["Username", username],
																							["EmailAddress", emailAddress],
																							["FirstName", firstName],
																							["LastName", lastName],
																							["Country", country],
																							["Zip", postalCode],
																							["Gender", gender],
																							["UILanguageOrder", uiLanguageOrder]]);
    }

    this.StartActivateUserOnComplete = function (scriptID, pendingGuid) {
        if (mStartActivateUserOnCompleteFunc != null) {
            mStartActivateUserOnCompleteFunc(pendingGuid, mStartActivateUserOnCompleteArgs);
            mStartActivateUserOnCompleteFunc = null;
            mStartActivateUserOnCompleteArgs = null;
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.StartActivateUser2 = function (xmlDoc, onCompleteFunc, onCompleteArgs, thisObj) {
        var xml = CMCXmlParser.GetOuterXml(xmlDoc);

        this.StartActivateUser2OnComplete = function (scriptID, pendingGuid) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, pendingGuid, onCompleteArgs);
                }
                else {
                    onCompleteFunc(pendingGuid, onCompleteArgs);
                }
            }

            //

            this.RemoveScriptTag(scriptID);

            this.StartActivateUser2OnComplete = null;
        }

        AddScriptTag("StartActivateUser2", "gServiceClient.StartActivateUser2OnComplete", [["Xml", xml]]);
    }

    this.UpdateUserProfile = function (guid, xmlDoc, onCompleteFunc, onCompleteArgs, thisObj) {
        var xml = CMCXmlParser.GetOuterXml(xmlDoc);

        this.UpdateUserProfileOnComplete = function (scriptID, pendingGuid) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, pendingGuid, onCompleteArgs);
                }
                else {
                    onCompleteFunc(pendingGuid, onCompleteArgs);
                }
            }

            //

            this.RemoveScriptTag(scriptID);

            this.UpdateUserProfileOnComplete = null;
        }

        AddScriptTag("UpdateUserProfile", "gServiceClient.UpdateUserProfileOnComplete", [["Guid", guid],
																							["Xml", xml]]);
    }

    this.GetUserProfile = function (guid, onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetUserProfileOnComplete = function (scriptID, userProfileXml) {
            if (onCompleteFunc != null) {
                if (thisObj != null)
                    onCompleteFunc.call(thisObj, userProfileXml, onCompleteArgs);
                else
                    onCompleteFunc(userProfileXml, onCompleteArgs);
            }

            //

            this.RemoveScriptTag(scriptID);

            this.GetUserProfileOnComplete = null;
        }

        AddScriptTag("GetUserProfile", "gServiceClient.GetUserProfileOnComplete", [["Guid", guid]]);
    }

    this.CheckUserStatus = function (pendingGuid, onCompleteFunc, onCompleteArgs) {
        mCheckUserStatusOnCompleteFunc = onCompleteFunc;
        mCheckUserStatusOnCompleteArgs = onCompleteArgs;

        AddScriptTag("CheckUserStatus", "gServiceClient.CheckUserStatusOnComplete", [["PendingGuid", pendingGuid]]);
    }

    this.CheckUserStatusOnComplete = function (scriptID, status) {
        if (mCheckUserStatusOnCompleteFunc != null) {
            var func = mCheckUserStatusOnCompleteFunc;
            var args = mCheckUserStatusOnCompleteArgs;
            mCheckUserStatusOnCompleteFunc = null;
            mCheckUserStatusOnCompleteArgs = null;

            func(status, args);
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.GetSynonymsFile = function (projectID, updatedSince, onCompleteFunc, onCompleteArgs) {
        mGetSynonymsFileOnCompleteFunc = onCompleteFunc;
        mGetSynonymsFileOnCompleteArgs = onCompleteArgs;

        AddScriptTag("GetSynonymsFile", "gServiceClient.GetSynonymsFileOnComplete", [["ProjectID", projectID],
																						["UpdatedSince", updatedSince]]);
    }

    this.GetSynonymsFileOnComplete = function (scriptID, synonymsXml) {
        if (mGetSynonymsFileOnCompleteFunc != null) {
            mGetSynonymsFileOnCompleteFunc(synonymsXml, mGetSynonymsFileOnCompleteArgs);
            mGetSynonymsFileOnCompleteFunc = null;
            mGetSynonymsFileOnCompleteArgs = null;
        }

        //

        this.RemoveScriptTag(scriptID);
    }

    this.GetVersion = function (onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetVersionOnComplete = function (scriptID, version) {
            if (version == null) {
                mSelf.Version = 1;
            }
            else {
                if (mSelf.Version == -1 && version > 4) {
                    mSelf.FeedbackServer = FMCGetFeedbackServerUrl('Feedback/');
                    mSelf.PulseServer = mSelf.Server;
                    mSelf.PulseEnabled = true;
                }
                mSelf.Version = version;
            }

            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, mSelf.Version, onCompleteArgs);
                }
                else {
                    onCompleteFunc(mSelf.Version, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetVersionOnComplete = null;
        }

        if (mSelf.Version == -1) {
            AddScriptTag("GetVersion", "gServiceClient.GetVersionOnComplete");
        }
        else {
            this.GetVersionOnComplete(null, mSelf.Version);
        }
    }

    this.GetPulseServerActivated = function (onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetPulseServerActivatedOnComplete = function (scriptID, active) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, active, onCompleteArgs);
                }
                else {
                    onCompleteFunc(active, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetPulseServerActivatedOnComplete = null;
        }

        AddScriptTag("GetPulseServerActivated", "gServiceClient.GetPulseServerActivatedOnComplete");
    }

    this.GetPulseStreamID = function (topicID, onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetPulseStreamIDOnComplete = function (scriptID, streamID) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, streamID, onCompleteArgs);
                }
                else {
                    onCompleteFunc(streamID, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetPulseStreamIDOnComplete = null;
        }

        AddScriptTag("GetPulseStreamID", "gServiceClient.GetPulseStreamIDOnComplete", [["TopicID", topicID]]);
    }

    this.GetTopicPathByStreamID = function (streamID, onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetTopicPathByStreamIDOnComplete = function (scriptID, topicPath) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, topicPath, onCompleteArgs);
                }
                else {
                    onCompleteFunc(topicPath, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetTopicPathByStreamIDOnComplete = null;
        }

        AddScriptTag("GetTopicPathByStreamID", "gServiceClient.GetTopicPathByStreamIDOnComplete", [["StreamID", streamID]]);
    }

    this.GetTopicPathByPageID = function (pageID, onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetTopicPathByPageIDOnComplete = function (scriptID, topicPath) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, topicPath, onCompleteArgs);
                }
                else {
                    onCompleteFunc(topicPath, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetTopicPathByPageIDOnComplete = null;
        }

        AddScriptTag("GetTopicPathByPageID", "gServiceClient.GetTopicPathByPageIDOnComplete", [["PageID", pageID]]);
    }

    this.GetPulseSearchResults = function (projectID, searchQuery, pageSize, pageIndex, onCompleteFunc, onCompleteArgs, thisObj) {
        this.GetPulseSearchResultsOnComplete = function (scriptID, searchResults) {
            if (onCompleteFunc != null) {
                if (thisObj != null) {
                    onCompleteFunc.call(thisObj, searchResults, onCompleteArgs);
                }
                else {
                    onCompleteFunc(searchResults, onCompleteArgs);
                }
            }

            //

            if (scriptID != null) {
                this.RemoveScriptTag(scriptID);
            }

            this.GetPulseSearchResultsOnComplete = null;
        }

        AddScriptTag("GetPulseSearchResults", "gServiceClient.GetPulseSearchResultsOnComplete", [["ProjectID", projectID],
                                                                                                 ["SearchQuery", searchQuery],
                                                                                                 ["PageSize", pageSize],
                                                                                                 ["PageIndex", pageIndex]]);
    }
}

//
//    End class CMCLiveHelpServiceClient
//

//
//    Class CMCFeedbackException
//

function CMCFeedbackException( number, message, data )
{
	CMCException.call( this, number, message );

	// Public properties

	this.Data = data;
}

CMCFeedbackException.prototype = new CMCException();
CMCFeedbackException.prototype.constructor = CMCFeedbackException;
CMCFeedbackException.prototype.base = CMCException.prototype;

//
//    End class CMCFeedbackException
//

function LiveHelp_OnMessage(e) {
    var parts = e.data.split(gMessageSeparator);
    var messageType = parts[0];
    var message = parts[1];
    var messageData = parts[2];
    var messageID = parts[3];

    var dataValues = null;

    if (!String.IsNullOrEmpty(messageData)) {
        dataValues = messageData.split(gDataSeparator);

        for (var i = 0, length = dataValues.length; i < length; i++) {
            if (dataValues[i] == "null") {
                dataValues[i] = null;
            }
        }
    }

    if (messageType == "request") {
        var handled = false;
        var needsCallbackFired = true;
        var responseData = new Array();

        if (message == "get-topic-path-by-stream-id") {
            var streamID = dataValues[0];

            gServiceClient.GetTopicPathByStreamID(streamID, function (topicPath) {
                responseData[responseData.length] = topicPath;

                var source;

                try {
                    source = e.source;
                }
                catch (ex) {
                    source = window;
                }

                FMCPostMessageResponse(source, message, responseData.length > 0 ? responseData : null, messageID);
            }, null, null);

            //

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "get-topic-path-by-page-id") {
            var pageID = dataValues[0];

            gServiceClient.GetTopicPathByPageID(pageID, function (topicPath) {
                responseData[responseData.length] = topicPath;

                var source;

                try {
                    source = e.source;
                }
                catch (ex) {
                    source = window;
                }

                FMCPostMessageResponse(source, message, responseData.length > 0 ? responseData : null, messageID);
            }, null, null);

            //

            handled = true;
            needsCallbackFired = false;
        }

        if (handled) {
            if (needsCallbackFired) {
                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            }
        }
    }
}

if (window.postMessage != null) {
    if (window.addEventListener)
        window.addEventListener("message", LiveHelp_OnMessage, false);
    else if (window.attachEvent)
        window.attachEvent("onmessage", LiveHelp_OnMessage);
}