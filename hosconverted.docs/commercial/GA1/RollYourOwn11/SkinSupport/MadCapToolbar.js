/// <reference path="MadCapUtilities.js" />
/// <reference path="MadCapMerging.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Toolbar_Init()
{
	if ( gInit )
	{
		return;
	}

	// If the project is opened from a UNC path, a topic toolbar frame won't be able to access its parent frame.
	// For now, detect this and skip initializing the topic toolbar during preview mode.

	if (MCGlobals.InPreviewMode)
	{
		try
		{
			var doc = parent.document;
		}
		catch (err)
		{
			return;
		}
	}
    
    //
    
	document.body.tabIndex = gTabIndex++;
	
	//
	
	if ( MCGlobals.InPreviewMode )
	{
		MCGlobals.BodyFrame = parent;	// This is a temporary hack. Eventually, MCGlobals.Init() should account for InPreviewMode and set everything up.
	}
	
	//

	Toolbar_LoadSkin(function () {
	    if (typeof gServiceClient !== 'undefined') {
	        gServiceClient.Init(function () {
	            var className = document.documentElement.getAttribute("class") || "";

	            className += "feedback-active" + (gServiceClient.PulseActive ? " pulse-active" : "");

	            document.documentElement.setAttribute("class", className);
	        });
	    }
	    gInit = true;
	});
}

function Toolbar_LoadSkin(OnCompleteFunc)
{
    FMCGetSkin(function (xmlDoc) {
        var buttons = null;
        var nodeName = gIsTopicToolbar ? "TopicToolbar" : "Toolbar";
        var toolbarNode = xmlDoc.getElementsByTagName(nodeName)[0];
        var tabs = xmlDoc.documentElement.getAttribute("Tabs").toLowerCase();
        var tabsSplit = xmlDoc.documentElement.getAttribute("Tabs").split(",");

        //

        var defaultTab = xmlDoc.documentElement.getAttribute("DefaultTab");

        defaultTab = (xmlDoc.documentElement.getAttribute("Tabs").indexOf(defaultTab) == -1) ? tabsSplit[0] : defaultTab;

        if (MCGlobals.NavigationFrame != null) {
            if (!gIsTopicToolbar && (toolbarNode == null || !FMCGetAttributeBool(toolbarNode, "ExcludeAccordionTitle", gIsTopicToolbar))) {
                var buttonsTD = document.getElementById("ToolbarButtons");
                var accordionTitleTD = document.createElement("td");
                var accordionTitleSpan = document.createElement("span");

                accordionTitleSpan.appendChild(document.createTextNode(defaultTab));
                accordionTitleTD.appendChild(accordionTitleSpan);

                buttonsTD.parentNode.insertBefore(accordionTitleTD, buttonsTD);

                accordionTitleSpan.id = "AccordionTitleLabel";
                accordionTitleTD.id = "AccordionTitle";
            }
        }

        //

        gAboutBoxEnabled = FMCGetAttributeBool(xmlDoc.documentElement, "EnableAboutBox", true);

        if (!MCGlobals.InPreviewMode) {
            var isWebHelpPlus = document.documentElement.getAttribute("TargetType") == "WebHelpPlus" && document.location.protocol.StartsWith("http", false);
            var logoName = isWebHelpPlus ? "LogoPlus.png" : FMCIsHtmlHelp() ? "LogoHtmlHelp.png" : "Logo.png";

            gAboutBoxURL = document.location.href.substring(0, document.location.href.lastIndexOf("/")) + "/Images/" + logoName;
        }

        //

        Toolbar_LoadWebHelpOptions(xmlDoc);
        FMCPreloadImage(gAboutBoxURL);

        FMCGetStylesheet(function (styleDoc) {
            function OnGetButtonsForToolbarProxyComplete(buttonList) {
                buttons = buttonList;

                if (toolbarNode) {
                    var enableCustomLayout = FMCGetAttributeBool(toolbarNode, "EnableCustomLayout", false);

                    if (enableCustomLayout) {
                        if (buttons == null) {
                            var buttonsAttribute = toolbarNode.getAttribute("Buttons");

                            if (buttonsAttribute) {
                                buttons = buttonsAttribute.split("|");
                            }
                            else {
                                buttons = new Array(0);
                            }
                        }
                    }

                    var scriptNode = toolbarNode.getElementsByTagName("Script")[0];

                    if (scriptNode) {
                        var scriptHtmlNode = document.createElement("script");

                        scriptHtmlNode.type = "text/javascript";
                        scriptHtmlNode.src = "../" + FMCGetSkinFolder() + nodeName + ".js";

                        document.getElementsByTagName("head")[0].appendChild(scriptHtmlNode);
                    }
                }

                if (buttons == null) {
                    buttons = GetDefaultButtons();
                }

                // Cache toolbar styles

                var styles = styleDoc.getElementsByTagName("Style");
                var toolbarStyleMap = new CMCDictionary();

                for (var i = 0; i < styles.length; i++) {
                    if (styles[i].getAttribute("Name") == "ToolbarItem") {
                        var styleClasses = styles[i].getElementsByTagName("StyleClass");

                        for (var j = 0; j < styleClasses.length; j++) {
                            var styleClass = styleClasses[j];
                            var props = styleClass.getElementsByTagName("Property");
                            var propMap = new CMCDictionary();

                            for (var k = 0; props && k < props.length; k++) {
                                var propName = props[k].getAttribute("Name");
                                var propValue = FMCGetPropertyValue(props[k], null);

                                propMap.Add(propName, propValue);
                            }

                            toolbarStyleMap.Add(styleClass.getAttribute("Name"), propMap);
                        }
                    }
                }

                //

                var tdButtons = document.getElementById("ToolbarButtons");
                var table = document.createElement("table");
                var tbody = document.createElement("tbody");
                var tr = document.createElement("tr");

                //

                if (!tabs) {
                    Toolbar_ShowHideNavigation(false);
                }

                //

                var navHidden = gHideNavStartup;

                if (!MCGlobals.InPreviewMode && !FMCIsHtmlHelp() && !FMCIsDotNetHelp()) {
                    FMCPostMessageRequest(MCGlobals.RootFrame, "subscribe-change-navigation-state-started", null, function (data) {
                        gChangeNavigationStateStartedEventID = data[0];
                    }, function () {
                        MCGlobals.RootFrame.gChangeNavigationStateStartedListeners.push(OnChangeNavigationStateStarted);
                    });
                    FMCPostMessageRequest(MCGlobals.RootFrame, "subscribe-change-navigation-state-completed", null, function (data) {
                        gChangeNavigationStateCompletedEventID = data[0];
                    }, function () {
                        MCGlobals.RootFrame.gChangeNavigationStateCompletedListeners.push(OnChangeNavigationStateCompleted);
                    });
                    FMCPostMessageRequest(MCGlobals.RootFrame, "subscribe-changing-navigation-state", null, function (data) {
                        gChangingNavigationStateEventID = data[0];
                    }, function () {
                        MCGlobals.RootFrame.gChangingNavigationStateListeners.push(OnChangingNavigationState);
                    });

                    OnChangeNavigationStateCompleted(navHidden ? "hidden" : "visible", gNavPosition);

                    if (navHidden) {
                        // IE 7-on-8 bug. IE 7-on-8 wasn't applying the 0px width to the accordion title for some reason. Putting it in a setTimeout() works around the issue.

                        window.setTimeout(function () {
                            OnChangingNavigationState(0);
                        }, 100);
                    }

                    gOnunloadFuncs.push(function () {
                        FMCPostMessageRequest(MCGlobals.RootFrame, "unsubscribe-change-navigation-state-started", [gChangeNavigationStateStartedEventID], null, function () {
                            MCGlobals.RootFrame.gChangeNavigationStateStartedListeners.RemoveValue(OnChangeNavigationStateStarted);
                        });
                        FMCPostMessageRequest(MCGlobals.RootFrame, "unsubscribe-change-navigation-state-completed", [gChangeNavigationStateCompletedEventID], null, function () {
                            MCGlobals.RootFrame.gChangeNavigationStateCompletedListeners.RemoveValue(OnChangeNavigationStateCompleted);
                        });
                        FMCPostMessageRequest(MCGlobals.RootFrame, "unsubscribe-changing-navigation-state", [gChangingNavigationStateEventID], null, function () {
                            MCGlobals.RootFrame.gChangingNavigationStateListeners.RemoveValue(OnChangingNavigationState);
                        });
                    });
                }

                //

                for (var i = 0; i < buttons.length; i++) {
                    var isToggle = false;
                    var button = buttons[i];
                    var td = document.createElement("td");
                    var propMap = toolbarStyleMap.GetItem(button);
                    var controlType = null;

                    if (propMap != null) {
                        controlType = propMap.GetItem("ControlType");
                    }
                    else {
                        controlType = button;
                    }

                    tr.appendChild(td);

                    switch (controlType) {
                        case "TopicRatings":
                            if (!FMCIsLiveHelpEnabled() && !FMCIsSkinPreviewMode()) {
                                tr.removeChild(td);
                                continue;
                            }

                            var span = document.createElement("span");

                            span.id = "RatingIcons";
                            span.title = "Topic Rating";
                            span.onclick = FMCIsSkinPreviewMode() ? null : FMCTopicRatingIconsOnclick;
                            span.onmousemove = FMCTopicRatingIconsOnmousemove;
                            span.onmouseout = FMCTopicClearRatingIcons;
                            span.onkeydown = FMCTopicRatingIconsOnkeydown;
                            span.style.fontSize = "1px";

                            var img = document.createElement("img");
                            img.tabIndex = gTabIndex++;

                            CMCFlareStylesheet.SetImageFromStylesheet(img, "ToolbarItem", "TopicRatings", "EmptyIcon", "Images/Rating0.gif", 16, 16);

                            span.appendChild(img);

                            for (var j = 0; j < 4; j++) {
                                var imgClone = img.cloneNode(true);
                                imgClone.tabIndex = gTabIndex++;

                                span.appendChild(imgClone);
                            }

                            td.style.width = "80px";
                            td.setAttribute("class", "feedback-required");

                            td.appendChild(span);

                            break;
                        case "EditUserProfile":
                            if (!FMCIsLiveHelpEnabled() && !FMCIsSkinPreviewMode()) {
                                tr.removeChild(td);
                                continue;
                            }

                            MakeButton(td, "Edit User Profile", "Images/EditUserProfile.gif", "Images/EditUserProfile_over.gif", "Images/EditUserProfile_selected.gif", 23, 22, null);
                            td.setAttribute("class", "feedback-required");

                            if (!MCGlobals.InPreviewMode) {
                                td.getElementsByTagName("button")[0].onclick = EditUserProfile;
                            }

                            break;
                        case "AddTopicToFavorites":
                            if (tabs.indexOf("favorites") == -1) { tr.removeChild(td); continue; }

                            if (FMCIsHtmlHelp() || FMCIsDotNetHelp()) {
                                tr.removeChild(td);
                                continue;
                            }

                            MakeButton(td, "Add topic to favorites", "Images/AddTopicToFavorites.gif", "Images/AddTopicToFavorites_over.gif", "Images/AddTopicToFavorites_selected.gif", 23, 22, null);

                            if (!MCGlobals.InPreviewMode) {
                                td.getElementsByTagName("button")[0].onclick = AddToFavorites;
                            }

                            break;
                        case "ToggleNavigationPane":
                            if (!tabs) { tr.removeChild(td); continue; }

                            if (FMCIsHtmlHelp() || FMCIsDotNetHelp()) {
                                tr.removeChild(td);
                                continue;
                            }

                            var title = "Hide navigation";
                            var checkedTitle = "Show navigation";
                            var outImage = "Images/HideNavigation.gif";
                            var checkedImage = "Images/HideNavigation_checked.gif";

                            if (navHidden) {
                                title = "Show navigation";
                                checkedTitle = "Hide navigation";
                                outImage = "Images/HideNavigation_checked.gif";
                                checkedImage = "Images/HideNavigation.gif";
                            }

                            MakeButton(td, title, outImage, "Images/HideNavigation_over.gif", "Images/HideNavigation_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("div")[0];
                            var buttonEl = div.getElementsByTagName("button")[0];

                            FMCPreloadImage(checkedImage);
                            div.setAttribute("MadCap:checkedImage", checkedImage);
                            buttonEl.setAttribute("MadCap:checkedTitle", checkedTitle);
                            div.id = "ToggleNavigationButton";

                            if (!MCGlobals.InPreviewMode) {
                                buttonEl.onclick = function () { Toolbar_ShowHideNavigation(true); };
                            }

                            isToggle = true;

                            break;
                        case "ExpandAll":
                            MakeButton(td, "Expand all", "Images/Expand.gif", "Images/Expand_over.gif", "Images/Expand_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = function (e) { ExpandAll("open"); };

                            break;
                        case "CollapseAll":
                            MakeButton(td, "Collapse all", "Images/Collapse.gif", "Images/Collapse_over.gif", "Images/Collapse_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = function (e) { ExpandAll("close"); };

                            break;
                        case "Print":
                            MakeButton(td, "Print topic", "Images/Print.gif", "Images/Print_over.gif", "Images/Print_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = PrintTopic;

                            break;
                        case "QuickSearch":
                            var tdQS = document.createElement("td");
                            var form = document.createElement("form");
                            var input = document.createElement("input");

                            tdQS.style.width = "150px";
                            form.onsubmit = function () { QuickSearch(); return false; };
                            input.id = "quickSearchField";
                            input.type = "text";
                            input.tabIndex = gTabIndex++;
                            input.title = "Quick search text box";
                            input.value = "Quick search";
                            input.setAttribute("MadCap:title", "Quick search");

                            input.onfocus = function () {
                                var isEmpty = FMCGetAttributeBool(this, "MadCap:isEmpty", true);

                                if (isEmpty) {
                                    this.style.fontStyle = "normal";
                                    this.style.color = "#000000";
                                    this.value = "";

                                    this.setAttribute("MadCap:isEmpty", "false");
                                }
                            };

                            input.onblur = function () {
                                if (this.value == "") {
                                    this.style.fontStyle = "italic";
                                    this.style.color = "#aaaaaa";

                                    var title = FMCGetAttribute(this, "MadCap:title");

                                    this.value = title;

                                    this.setAttribute("MadCap:isEmpty", "true");
                                }
                            };

                            form.appendChild(input);
                            tdQS.appendChild(form);
                            tr.insertBefore(tdQS, td);

                            MakeButton(td, "Quick search", "Images/QuickSearch.gif", "Images/QuickSearch_over.gif", "Images/QuickSearch_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = QuickSearch;

                            break;
                        case "RemoveHighlight":
                            MakeButton(td, "Remove search highlighting", "Images/Highlight.gif", "Images/Highlight_over.gif", "Images/Highlight_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = RemoveHighlight;

                            break;
                        case "Back":
                            MakeButton(td, "Back", "Images/Back.gif", "Images/Back_over.gif", "Images/Back_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = BackOnclick;

                            break;
                        case "Forward":
                            MakeButton(td, "Forward", "Images/Forward.gif", "Images/Forward_over.gif", "Images/Forward_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = ForwardOnclick;

                            break;
                        case "Stop":
                            MakeButton(td, "Stop", "Images/Stop.gif", "Images/Stop_over.gif", "Images/Stop_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = StopOnclick;

                            break;
                        case "Refresh":
                            MakeButton(td, "Refresh", "Images/Refresh.gif", "Images/Refresh_over.gif", "Images/Refresh_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = RefreshOnclick;

                            break;
                        case "Home":
                            MakeButton(td, "Home", "Images/Home.gif", "Images/Home_over.gif", "Images/Home_selected.gif", 23, 22, null);

                            if (!MCGlobals.InPreviewMode) {
                                td.getElementsByTagName("button")[0].onclick = NavigateHome;
                            }

                            break;
                        case "SelectTOC":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("toc");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gTocTitle, "Images/SelectToc.gif", "Images/SelectToc_over.gif", "Images/SelectToc_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "tocSelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gTocTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectIndex":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("index");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gIndexTitle, "Images/SelectIndex.gif", "Images/SelectIndex_over.gif", "Images/SelectIndex_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "indexSelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gIndexTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectSearch":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("search");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gSearchTitle, "Images/SelectSearch.gif", "Images/SelectSearch_over.gif", "Images/SelectSearch_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "searchSelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gSearchTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectGlossary":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("glossary");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gGlossaryTitle, "Images/SelectGlossary.gif", "Images/SelectGlossary_over.gif", "Images/SelectGlossary_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "glossarySelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gGlossaryTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectFavorites":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("favorites");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gFavoritesTitle, "Images/SelectFavorites.gif", "Images/SelectFavorites_over.gif", "Images/SelectFavorites_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "favoritesSelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gFavoritesTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectBrowseSequence":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("browsesequences");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gBrowseSequencesTitle, "Images/SelectBrowsesequences.gif", "Images/SelectBrowsesequences_over.gif", "Images/SelectBrowsesequences_selected.gif", 23, 22, null);

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "browsesequencesSelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gBrowseSequencesTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "SelectCommunity":
                            if (!FMCIsWebHelp()) { tr.removeChild(td); continue; };

                            var pos = tabs.indexOf("community");

                            if (pos == -1) { tr.removeChild(td); continue; };

                            MakeButton(td, gCommunityTitle, "Images/Community.gif", "Images/Community_over.gif", "Images/Community_selected.gif", 23, 22, null);
                            td.setAttribute("class", "pulse-required");

                            var div = td.getElementsByTagName("button")[0];

                            div.id = "communitySelect";
                            div.setAttribute("MadCap:itemID", tabs.substring(0, pos).split(",").length - 1);
                            div.setAttribute("MadCap:title", gCommunityTitle);

                            if (!MCGlobals.InPreviewMode) {
                                div.onclick = SelectIconClick;
                            }

                            break;
                        case "PreviousTopic":
                            MakeButton(td, "Previous Topic", "Images/PreviousTopic.gif", "Images/PreviousTopic_over.gif", "Images/PreviousTopic_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = PreviousTopic;

                            break;
                        case "NextTopic":
                            MakeButton(td, "Next Topic", "Images/NextTopic.gif", "Images/NextTopic_over.gif", "Images/NextTopic_selected.gif", 23, 22, null);

                            td.getElementsByTagName("button")[0].onclick = NextTopic;

                            break;
                        case "CurrentTopicIndex":
                            var span = document.createElement("span");
                            span.setAttribute("id", "MCCurrentTopicIndexContainer");
                            span.style.whiteSpace = "nowrap";

                            td.appendChild(span);

                            break;
                        case "Separator":
                            var div = document.createElement("div");
                            var img = document.createElement("img");
                            var src = null;

                            if (MCGlobals.InPreviewMode) {
                                src = "SkinTemplate/Separator.gif";
                            }
                            else {
                                src = "Images/Separator.gif";
                            }

                            img.src = src;
                            img.alt = "Separator";
                            var tooltip = CMCFlareStylesheet.LookupValue("ToolbarItem", "Separator", "SeparatorToolTip", "");
                            img.title = tooltip;
                            img.style.width = "2px";
                            img.style.height = "22px";

                            div.appendChild(img);
                            td.appendChild(div);

                            td.style.width = "2px";
                            td.style.height = "22px";

                            break;
                        case "Button":
                            MakeButton(td, button, null, null, null, 0, 0, null);

                            break;
                        case "Text":
                            var tempSpan = document.createElement("span");

                            tempSpan.appendChild(document.createTextNode(button));
                            document.body.appendChild(tempSpan);

                            var tempSpanWidth = tempSpan.offsetWidth;
                            var tempSpanHeight = tempSpan.offsetHeight;

                            document.body.removeChild(tempSpan);

                            MakeButton(td, null, null, null, null, tempSpanWidth, tempSpanHeight, button);

                            break;
                        default: // Default to text control type
                            var tempSpan = document.createElement("span");

                            tempSpan.appendChild(document.createTextNode(button));
                            document.body.appendChild(tempSpan);

                            var tempSpanWidth = tempSpan.offsetWidth;
                            var tempSpanHeight = tempSpan.offsetHeight;

                            document.body.removeChild(tempSpan);

                            MakeButton(td, null, null, null, null, tempSpanWidth, tempSpanHeight, button);

                            break;
                    }

                    var div = td.getElementsByTagName("div")[0];

                    if (!div) {
                        div = td.getElementsByTagName("span")[0];
                    }

                    if (div.onkeyup == null) {
                        div.onkeyup = Toolbar_ItemOnkeyup;
                    }

                    ApplyStyleToControl(div, button, toolbarStyleMap, isToggle);
                }

                tbody.appendChild(tr);
                table.appendChild(tbody);
                tdButtons.appendChild(table);

                // Apply style to accordion title and logo

                if (MCGlobals.NavigationFrame != null) {
                    var accordionTitle = document.getElementById("AccordionTitle");

                    if (accordionTitle != null) {
                        var titleProps = toolbarStyleMap.GetItem("AccordionTitle");

                        if (titleProps) {
                            titleProps.ForEach(function (key, value) {
                                var propName = key;

                                propName = propName.charAt(0).toLowerCase() + propName.substring(1, propName.length);

                                if (propName == "onClick") {
                                    accordionTitle.onclick = new Function(value);
                                }
                                else {
                                    accordionTitle.style[propName] = value;
                                }

                                return true;
                            });
                        }
                    }
                }

                //

                if (!gIsTopicToolbar) {
                    var tdFiller = document.createElement("td");
                    tdFiller.appendChild(document.createTextNode(String.fromCharCode(160)));
                    tr.appendChild(tdFiller);

                    CreateLogoIcon(tr, toolbarStyleMap);
                }
                else {
                    // Need this for Firefox since for some reason it adds space between the button elements and the img elements inside them. Otherwise, the topic comments frame contains scrollbars in Firefox.
                    var tdFiller = document.createElement("td");
                    tdFiller.style.width = "3px";
                    tdFiller.appendChild(document.createTextNode(String.fromCharCode(160)));
                    tr.appendChild(tdFiller);
                }

                if (gIsTopicToolbar) {
                    if (!buttons.Contains("CurrentTopicIndex")) {
                        SetIFrameFixedWidth();
                    }
                }
                else if (!FMCIsWebHelp()) {
                    var iframe = FMCGetContainingIFrame(window);
                    iframe.style.visibility = "visible";
                }

                OnCompleteFunc();
            }

            Toolbar_LoadStyles(styleDoc, defaultTab);

            if (!gIsTopicToolbar && String.IsNullOrEmpty(document.body.style.backgroundImage)) {
                document.body.style.backgroundImage = "url( 'Images/ToolbarBackground.jpg' )";
            }

            //

            if (gIsTopicToolbar) {
                FMCPostMessageRequest(MCGlobals.BodyFrame, "get-buttons-for-toolbar-proxy", [window.name], function (data) {
                    var buttonList = data[0].split(",");

                    OnGetButtonsForToolbarProxyComplete(buttonList);
                }, function () {
                    var iframe = FMCGetContainingIFrame(window);
                    var buttonList = FMCGetAttributeStringList(iframe, "MadCap:buttonItems", "|");

                    OnGetButtonsForToolbarProxyComplete(buttonList);
                });
            }
            else {
                OnGetButtonsForToolbarProxyComplete(null);
            }
        });
    });
}

function CreateLogoIcon(tr, toolbarStyleMap)
{
	var src = CMCFlareStylesheet.LookupValue("ToolbarItem", "Logo", "Icon", null);

	if (src == "none")
	{
		return;
	}

	var td = document.createElement("td");
	var img = document.createElement("img");

	var width = -1;
	var height = -1;

	if (src == null)
	{
		src = "Images/LogoIcon.gif";
		width = 111;
		height = 24;
	}
	else
	{
		src = FMCStripCssUrl(src);
		src = decodeURIComponent(src);

		width = CMCFlareStylesheet.GetResourceProperty(src, "Width", -1);
		height = CMCFlareStylesheet.GetResourceProperty(src, "Height", -1);

		src = "../" + FMCGetSkinFolder() + escape(src);
	}

	td.id = "logoIcon";
	td.style.textAlign = "right";

	img.src = src;
	img.alt = "Logo icon";

	if (gAboutBoxEnabled)
	{
		img.onclick = DisplayAbout;
	}

	if (width != -1)
	{
		td.style.width = width + "px";
		img.style.width = width + "px";
	}

	if (height != -1)
	{
		td.style.height = height + "px";
		img.style.height = height + "px";
	}

	td.appendChild(img);
	tr.appendChild(td);

	var logoProps = toolbarStyleMap.GetItem("Logo");

	if (logoProps)
	{
		logoProps.ForEach(function(key, value)
		{
			var propName = key;
			var propValue = value;

			propName = propName.charAt(0).toLowerCase() + propName.substring(1, propName.length);

			if (propName == "onClick")
			{
				img.onclick = new Function(propValue);
			}
			else if (propName == "logoAlternateText")
			{
				img.alt = propValue;
			}
			else if (propName == "aboutBoxAlternateText")
			{
				gAboutBoxAlternateText = propValue;
			}

			return true;
		});
	}
}

function ApplyStyleToControl( div, button, toolbarStyleMap, isToggle )
{
	// Apply style to control

	var props	= toolbarStyleMap.GetItem( button );
	
	if ( props == null )
	{
		return;
	}
	
	var navHidden = gHideNavStartup;
	
	var width		= 0;
	var height		= 0;
	var isButton	= false;

	props.ForEach( function( key, value )
	{
		var propName    = key;
		var propValue   = value;
		
		if ( propValue == null )
		{
			return true;
		}

		if ( propName == "Label" )
		{
			if ( button == "CurrentTopicIndex" )
			{
				SetCurrentTopicIndexFormatString( div, propValue );
			}
			else
			{
				div.firstChild.nodeValue = propValue;
			}
		}
		else if ( propName == "Tooltip" )
		{
		    if (button == "Separator" || button == "CurrentTopicIndex")
		        return true;

			if ( propValue.toLowerCase() == "none" )
			{
				propValue = "";
			}

            if (button == "TopicRatings")
            {
                div.title = propValue;

                return true;
            }

            var buttonEl = div.getElementsByTagName("button")[0];
            var imgEl = div.getElementsByTagName("img")[0];

			if ( isToggle )
			{
				if ( button == "ToggleNavigationPane" )
				{
					if ( !navHidden )
					{
					    buttonEl.title = propValue;
					    imgEl.alt = propValue;
					}
					else
					{
					    buttonEl.setAttribute("MadCap:checkedTitle", propValue);
					}
				}
            }
            else
            {
                buttonEl.title = propValue;
                imgEl.alt = propValue;
            }
            
            if ( button == "QuickSearch" )
            {
				var searchField = div.parentNode.previousSibling.firstChild.firstChild;
				
				searchField.value = propValue;
				searchField.setAttribute( "MadCap:title", propValue );
            }
		}
		else if ( propName == "Icon" )
		{
			propValue = FMCStripCssUrl( propValue );
			propValue = decodeURIComponent( propValue );

            var width	= CMCFlareStylesheet.GetResourceProperty( propValue, "Width", null );
			var height	= CMCFlareStylesheet.GetResourceProperty( propValue, "Height", null );
			
			if ( width )
			{
				div.setAttribute( "MadCap:width", width );
			}
			
			if ( height )
			{
				div.setAttribute( "MadCap:height", height );
			}

			var imgPath = "";
			
			if ( !MCGlobals.InPreviewMode )
			{
				imgPath = "../"
			}
			
			imgPath += FMCGetSkinFolder() + escape( propValue );
			
			var imgAtt = "MadCap:outImage";
			
			if ( (button == "ToggleNavigationPane" && navHidden) )
			{
				imgAtt = "MadCap:checkedImage";
			}
			
			div.setAttribute( imgAtt, imgPath );
			FMCPreloadImage( imgPath );

			isButton = true;
		}
		else if ( propName == "PressedIcon" )
		{
			propValue = FMCStripCssUrl( propValue );
			propValue = decodeURIComponent( propValue );
			
			var imgPath = "";
			
			if ( !MCGlobals.InPreviewMode )
			{
				imgPath = "../"
			}
			
			imgPath += FMCGetSkinFolder() + escape( propValue );
						
			div.setAttribute( "MadCap:selectedImage", imgPath );
			FMCPreloadImage( imgPath );
		}
		else if ( propName == "HoverIcon" )
		{
			propValue = FMCStripCssUrl( propValue );
			propValue = decodeURIComponent( propValue );
			
			var imgPath = "";
			
			if ( !MCGlobals.InPreviewMode )
			{
				imgPath = "../"
			}
			
			imgPath += FMCGetSkinFolder() + escape( propValue );
			
			div.setAttribute( "MadCap:overImage", imgPath );
			FMCPreloadImage( imgPath );
		}
		else if ( propName == "CheckedIcon" )
		{
			propValue = FMCStripCssUrl( propValue );
			propValue = decodeURIComponent( propValue );
			
			var imgPath = "";
			
			if ( !MCGlobals.InPreviewMode )
			{
				imgPath = "../"
			}
			
			imgPath += FMCGetSkinFolder() + escape( propValue );
			
			var imgAtt = "MadCap:checkedImage";
			
			if ( (button == "ToggleNavigationPane" && navHidden) )
			{
				imgAtt = "MadCap:outImage";
			}
			
			div.setAttribute( imgAtt, imgPath );
			FMCPreloadImage( imgPath );
		}
		else if ( propName == "OnClick" )
		{
			div.onclick = new Function( propValue );
		}
		else if ( propName == "SearchBoxTooltip" )
		{
			if ( propValue.toLowerCase() == "none" )
			{
				propValue = "";
			}
			
			div.parentNode.previousSibling.firstChild.firstChild.title = propValue;
		}
		else if ( propName == "ShowTooltip" )
		{
			if ( propValue.toLowerCase() == "none" )
			{
				propValue = "";
			}
			
			if ( button == "ToggleNavigationPane" )
			{
			    var buttonEl = div.getElementsByTagName("button")[0];
			    var imgEl = div.getElementsByTagName("img")[0];

				if ( navHidden )
				{
				    buttonEl.title = propValue;
				    imgEl.alt = propValue;
				}
				else
				{
				    buttonEl.setAttribute("MadCap:checkedTitle", propValue);
				}
			}
		}
		else if ( propName == "SeparatorAlternateText" )
		{
			div.getElementsByTagName( "img" )[0].alt = propValue;
		}
		else
		{
			var cssName = propName.charAt( 0 ).toLowerCase() + propName.substring( 1 );

			if (propName == "BackgroundColor")
			{
				div.style[cssName] = propValue;
			}
			else
			{
				div.parentNode.style[cssName] = propValue;
			}
		}
		
		return true;
	} );

	if ( isButton )
	{
		InitButton( div );
	}
}

function GetDefaultButtons()
{
	var buttons = new Array();
	
	if ( gIsTopicToolbar )
	{
		buttons.push( "PreviousTopic" );
		buttons.push( "CurrentTopicIndex" );
		buttons.push( "NextTopic" );
	}
	else
	{
		if ( FMCIsLiveHelpEnabled() )
		{
			buttons.push( "TopicRatings" );
			buttons.push( "Separator" );
			buttons.push( "EditUserProfile" );
			buttons.push( "Separator" );
		}

		if ( MCGlobals.NavigationFrame != null )
		{
			buttons.push( "AddTopicToFavorites" );
			buttons.push( "ToggleNavigationPane" );
			buttons.push( "ExpandAll" );
			buttons.push( "CollapseAll" );
			buttons.push( "Print" );
			buttons.push( "Separator" );
			buttons.push( "QuickSearch" );
			buttons.push( "RemoveHighlight" );
			buttons.push( "Separator" );
			buttons.push( "Back" );
			buttons.push( "Forward" );
			buttons.push( "Stop" );
			buttons.push( "Refresh" );
			buttons.push( "Home" );
			buttons.push( "Separator" );
			buttons.push( "SelectTOC" );
			buttons.push( "SelectIndex" );
			buttons.push( "SelectSearch" );
			buttons.push( "SelectGlossary" );
			buttons.push( "SelectFavorites" );
			buttons.push("SelectBrowseSequence");
			buttons.push("SelectCommunity");
			buttons.push( "Separator" );
			buttons.push( "PreviousTopic" );
			buttons.push( "CurrentTopicIndex" );
			buttons.push( "NextTopic" );
		}
		else
		{
			buttons.push( "ExpandAll" );
			buttons.push( "CollapseAll" );
			buttons.push( "Print" );
			buttons.push( "Separator" );
			buttons.push( "QuickSearch" );
			buttons.push( "RemoveHighlight" );
			buttons.push( "Separator" );
			buttons.push( "Back" );
			buttons.push( "Forward" );
			buttons.push( "Stop" );
			buttons.push( "Refresh" );
			buttons.push( "Home" );
			buttons.push( "Separator" );
			buttons.push( "PreviousTopic" );
			buttons.push( "CurrentTopicIndex" );
			buttons.push( "NextTopic" );
		}
	}
	
	return buttons;
}

function Toolbar_LoadStyles(styleDoc, defaultTab)
{
	if ( styleDoc != null )
	{
		var styles = styleDoc.getElementsByTagName( "Style" );
        
		for ( var i = 0; i < styles.length; i++ )
		{
			var styleName = styles[i].getAttribute( "Name" );
            
			if ( MCGlobals.NavigationFrame != null && styleName == "AccordionItem" )
			{
				Toolbar_LoadAccordionItemStyle( styles[i], defaultTab );
			}
			else if ( styleName == "Frame" )
			{
				Toolbar_LoadFrameStyle( styles[i] );
			}
			else if ( styleName == "Control" )
			{
				Toolbar_LoadControlStyle( styles[i] );
			}
		}
	}
}

function Toolbar_LoadAccordionItemStyle( accordionItemStyle, defaultTab )
{
    var styleClasses	= accordionItemStyle.getElementsByTagName( "StyleClass" );
    
    for ( var i = 0; i < styleClasses.length; i++ )
    {
        var styleName	= styleClasses[i].getAttribute( "Name" );
        var properties	= styleClasses[i].getElementsByTagName( "Property" );
        var title		= null;
        
        if ( styleName == "BrowseSequence" )
        {
			styleName = "BrowseSequences";
        }
        
        for ( var j = 0; j < properties.length; j++ )
        {
            var cssName		= properties[j].getAttribute( "Name" );
            var cssValue	= FMCGetPropertyValue( properties[j], null );
            
            if ( cssName == "Label" )
            {
				title = cssValue;
				
				switch ( styleName.toLowerCase() )
				{
					case "toc":
						gTocTitle = title;
						break;
					case "index":
						gIndexTitle = title;
						break;
					case "search":
						gSearchTitle = title;
						break;
					case "glossary":
						gGlossaryTitle = title;
						break;
					case "favorites":
						gFavoritesTitle = title;
						break;
					case "browsesequences":
					    gBrowseSequencesTitle = title;
					    break;
					case "community":
					    gCommunityTitle = title;
					    break;
				}
            }
        }
        
        if ( styleName == defaultTab && title != null )
        {
			var accordionTitle	= document.getElementById( "AccordionTitleLabel" );
			
			if ( accordionTitle != null )
			{
				accordionTitle.firstChild.nodeValue = title;
			}
        }
    }
}

function Toolbar_LoadFrameStyle( frameStyle )
{
    var styleClasses    = frameStyle.getElementsByTagName( "StyleClass" );
    
    for ( var i = 0; i < styleClasses.length; i++ )
    {
        var name    = styleClasses[i].getAttribute( "Name" );
        
        if ( (!gIsTopicToolbar && name == "Toolbar") || (gIsTopicToolbar && name == "TopicToolbar") )
        {
			var properties	= styleClasses[i].getElementsByTagName( "Property" );
			
			for ( var j = 0; j < properties.length; j++ )
			{
				var propName	= properties[j].getAttribute( "Name" );
				
				if ( propName == "BackgroundGradient" )
				{
					document.body.style.backgroundImage = FMCCreateCssUrl( "../" + FMCGetSkinFolder() + (gIsTopicToolbar ? "Topic" : "") + "ToolbarBackground.jpg" );
				}
				else if ( propName == "BackgroundImage" )
				{
					var propValue = FMCGetPropertyValue( properties[j], null );
					
					if ( propValue != "none" )
					{
						propValue = FMCStripCssUrl( propValue );
						propValue = decodeURIComponent( propValue );

						document.body.style.backgroundImage = FMCCreateCssUrl( "../" + FMCGetSkinFolder() + propValue );
					}
				}
				else if ( propName == "Height" )
				{
				    var heightPx = FMCGetPropertyValue(properties[j], null);
					
					document.getElementsByTagName( "table" )[0].style.height = heightPx;
				}
			}
        }
    }
}

function Toolbar_LoadControlStyle( style )
{
	var styleClasses	= style.getElementsByTagName( "StyleClass" );
	
	for ( var i = 0; i < styleClasses.length; i++ )
    {
		var styleClass	= styleClasses[i];
        var styleName	= styleClass.getAttribute( "Name" );
        var properties	= styleClass.getElementsByTagName( "Property" );
        
		if ( styleName == "Messages" )
        {
			for ( var j = 0; j < properties.length; j++ )
			{
				var property	= properties[j];
				var cssName		= property.getAttribute( "Name" );
				var cssValue	= FMCGetPropertyValue( property, null );

				if ( cssName == "QuickSearchExternal" )
				{
					gQuickSearchExternalLabel = cssValue;
				}
				else if ( cssName == "QuickSearchIE5.5" )
				{
					gQuickSearchIE55 = cssValue;
				}
				else if ( cssName == "RemoveHighlightIE5.5" )
				{
					gRemoveHighlightIE55Label = cssValue;
				}
			}
		}
	}
}

function Toolbar_LoadWebHelpOptions( xmlDoc )
{
    var webHelpOptions  = xmlDoc.getElementsByTagName( "WebHelpOptions" )[0];
    
    if ( webHelpOptions )
    {
        var aboutBox    = webHelpOptions.getAttribute( "AboutBox" );

        gAboutBoxURL = FMCGetSkinFolderAbsolute() + aboutBox;
        gAboutBoxWidth = parseInt( webHelpOptions.getAttribute( "AboutBoxWidth" ) );
        gAboutBoxHeight = parseInt( webHelpOptions.getAttribute( "AboutBoxHeight" ) );
    }
        
    if ( MCGlobals.NavigationFrame != null )
    {
		var navWidth	= 200;
	        
		if (webHelpOptions) 
		{
		    var navPaneWidth = webHelpOptions.getAttribute("NavigationPaneWidth");

		    if (navPaneWidth != null) {
		        navWidth = parseInt(navPaneWidth);
		    }

            var navPanePosition = webHelpOptions.getAttribute( "NavigationPanePosition" );

            if (navPanePosition)
                gNavPosition = navPanePosition;

            gHideNavStartup = FMCGetAttributeBool(webHelpOptions, "HideNavigationOnStartup", false);
        }

		var accordionTitle	= document.getElementById( "AccordionTitle" );
	        
	    if ( accordionTitle != null )
	    {
			accordionTitle.style.width = Math.max( navWidth || 0, 0 ) + "px";

			var rtl = document.documentElement.dir == "rtl";
            if ( gNavPosition == "Top" || gNavPosition == "Bottom" )
			{
				accordionTitle.style.display = "none";
			}
			else if ( gNavPosition == "Right" && !rtl || gNavPosition == "Left" && rtl)
			{
				var tr	= accordionTitle.parentNode;
		            
				tr.removeChild( accordionTitle );
				tr.appendChild( accordionTitle );
			}
		}
    }
}

function BackOnclick()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate-back", null, null, function ()
    {
        try
        {
            MCGlobals.BodyFrame.window.history.go(-1);
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function ForwardOnclick()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate-forward", null, null, function ()
    {
        try
        {
            MCGlobals.BodyFrame.window.history.go(1);
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function StopOnclick()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate-stop", null, null, function ()
    {
        try
        {
            if (window.stop)
            {
                MCGlobals.BodyFrame.window.stop();
            }
            else if (document.execCommand)
            {
                MCGlobals.BodyFrame.window.document.execCommand("Stop");
            }
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function RefreshOnclick()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate-refresh", null, null, function ()
    {
        try
        {
            MCGlobals.BodyFrame.window.history.go(0);
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function SelectIconClick( node )
{
    var id = parseInt(FMCGetMCAttribute(this, "MadCap:itemID"));
    var title = FMCGetMCAttribute(this, "MadCap:title");

    FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-active-iframe", [id, title], null, function ()
    {
        var navFrame = MCGlobals.NavigationFrame;

        navFrame.SetActiveIFrame(id, title);
        navFrame.SetIFrameHeight();

        if (MCGlobals.RootFrame.gNavigationState == "hidden")
        {
            Toolbar_ShowHideNavigation(true);
        }
    });

    var toggleButton = document.getElementById("ToggleNavigationButton");

    if (toggleButton != null)
    {
        toggleButton.onmouseout(); // Force onmouseout() to fire so that image gets flipped back to "hide" state
    }
}

function Toolbar_ShowHideNavigation(slide)
{
    FMCRegisterCallback("Root", MCEventType.OnInit, function ()
    {
        FMCPostMessageRequest(MCGlobals.RootFrame, "show-hide-navigation", [slide], null, function ()
        {
            MCGlobals.RootFrame.Default_ShowHideNavigation(slide);
        });
    }, null);
}

function AdvanceTopic(moveType)
{
    function OnGetBodyInfoComplete(href, bsPath, bsPath2, tocPath, tocPath2)
    {
        var master = FMCGetHelpSystem();

        if (bsPath == null)
        {
            bsPath = bsPath2;

            if (bsPath != null)
            {
                var fullBsPath = master.GetFullTocPath("browsesequences", href.PlainPath);

                if (fullBsPath)
                {
                    bsPath = bsPath ? fullBsPath + "|" + bsPath : fullBsPath;
                }

                master.AdvanceTopic("browsesequences", moveType, bsPath, href);

                return;
            }
        }
        else
        {
            master.AdvanceTopic("browsesequences", moveType, bsPath, href);

            return;
        }

        if (tocPath == null)
        {
            tocPath = tocPath2;

            if (tocPath != null)
            {
                var fullTocPath = master.GetFullTocPath("toc", href.PlainPath);

                if (fullTocPath)
                {
                    tocPath = tocPath ? fullTocPath + "|" + tocPath : fullTocPath;
                }

                master.AdvanceTopic("toc", moveType, tocPath, href);

                return;
            }
        }
        else
        {
            master.AdvanceTopic("toc", moveType, tocPath, href);
        }
    }

    if (MCGlobals.InPreviewMode)
    {
        return;
    }

    FMCPostMessageRequest(MCGlobals.BodyFrame, "get-advance-topic-body-info", null, function (data)
    {
        var href = new CMCUrl(data[0]);
        var bsPath = data[1];
        var bsPath2 = data[2];
        var tocPath = data[3];
        var tocPath2 = data[4];

        OnGetBodyInfoComplete(href, bsPath, bsPath2, tocPath, tocPath2);
    }, function ()
    {
        var href = FMCGetBodyHref();
        var bsPath = MCGlobals.BodyFrame.CMCUrl.QueryMap.GetItem("BrowseSequencePath");
        var bsPath2 = FMCGetMCAttribute(MCGlobals.BodyFrame.document.documentElement, "MadCap:browseSequencePath");
        var tocPath = MCGlobals.BodyFrame.CMCUrl.QueryMap.GetItem("TocPath");
        var tocPath2 = FMCGetMCAttribute(MCGlobals.BodyFrame.document.documentElement, "MadCap:tocPath");

        OnGetBodyInfoComplete(href, bsPath, bsPath2, tocPath, tocPath2);
    });
}

function PreviousTopic( e )
{
	AdvanceTopic( "previous" );
}

function NextTopic( e )
{
	AdvanceTopic( "next" );
}

function Toolbar_ItemOnkeyup( e )
{
	var target	= null;
	
	if ( !e ) { e = window.event; }
	
	if ( e.srcElement ) { target = e.srcElement; }
	else if ( e.target ) { target = e.target; }
	
	if ( e.keyCode == 13 && target && target.onclick )
	{
		target.onclick();
	}
}

function AddToFavorites()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "title", null, function (data)
    {
        var title = data[0];

        FMCPostMessageRequest(MCGlobals.BodyFrame, "url", null, function (data)
        {
            var href = data[0];

            if (href.indexOf("?") != -1)
            {
                href = href.substring(0, href.indexOf("?"));
            }

            var value = null;

            if (!title)
            {
                value = href.substring(href.lastIndexOf("/") + 1, href.length) + "|" + href;
            }
            else
            {
                value = title + "|" + href;
            }

            FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["favorites"], "add-topic-favorite", [value], null, null);
        }, null);
    }, function ()
    {
        var title = null;
        var href = null;

        try
        {
            var bodyFrame = MCGlobals.BodyFrame;

            title = bodyFrame.document.title;
            href = bodyFrame.location.href;
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL

            return;
        }

        if (href.indexOf("?") != -1)
        {
            href = href.substring(0, href.indexOf("?"));
        }

        var value = null;

        if (!title)
        {
            value = href.substring(href.lastIndexOf("/") + 1, href.length) + "|" + href;
        }
        else
        {
            value = title + "|" + href;
        }

        var favoritesFrame = MCGlobals.NavigationFrame.frames["favorites"];

        function OnInit()
        {
            favoritesFrame.Favorites_FMCAddToFavorites("topics", value);
            favoritesFrame.FMCLoadTopicsFavorites();
        }

        favoritesFrame.Favorites_Init(OnInit);
    });
}

function DisplayAbout()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "display-about", [gAboutBoxURL, gAboutBoxAlternateText, gAboutBoxWidth, gAboutBoxHeight], null, function ()
    {
        MCGlobals.BodyFrame.FMCDisplayAbout(gAboutBoxURL, gAboutBoxAlternateText, gAboutBoxWidth, gAboutBoxHeight);
    });
}

function ExpandAll( swapType )
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "expand-all", [swapType], null, function ()
    {
        try
        {
            if (MCGlobals.BodyFrame.FMCExpandAll)
            {
                MCGlobals.BodyFrame.FMCExpandAll(swapType);
            }
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function QuickSearch()
{
    if (FMCIsIE55())
    {
        alert(gQuickSearchIE55);

        return;
    }

    var searchField = document.getElementById("quickSearchField");
    var isEmpty = FMCGetAttributeBool(searchField, "MadCap:isEmpty", true);

    if (isEmpty)
    {
        return;
    }

    FMCPostMessageRequest(MCGlobals.BodyFrame, "quick-search", [searchField.value], null, function ()
    {
        try
        {
            MCGlobals.BodyFrame.FMCQuickSearch(searchField.value);
        }
        catch (err)
        {
            alert(gQuickSearchExternalLabel);
        }
    });
}

function RemoveHighlight()
{
    if (FMCIsIE55())
    {
        alert(gRemoveHighlightIE55Label);

        return;
    }

    FMCPostMessageRequest(MCGlobals.BodyFrame, "remove-highlight", null, null, function ()
    {
        try
        {
            MCGlobals.BodyFrame.FMCRemoveHighlight();
        }
        catch (err)
        {
            alert(gQuickSearchExternalLabel);
        }
    });
}

function PrintTopic()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "print-topic", null, null, function ()
    {
        var bodyFrame = MCGlobals.BodyFrame;

        bodyFrame.focus();

        try
        {
            bodyFrame.print();
        }
        catch (ex)
        {
            // Exception occurs when body frame document is an external URL
        }
    });
}

function NavigateHome()
{
	FMCPostMessageRequest(MCGlobals.RootFrame, "navigate-home", null, null, function ()
	{
	    var baseFolder = "../";

	    if (FMCIsHtmlHelp())
	    {
	        baseFolder = "/";
	    }

	    try
	    {
	        // Throws exception when document is external

	        MCGlobals.BodyFrame.document.location.href = baseFolder + MCGlobals.DefaultStartTopic;
	    }
	    catch (ex)
	    {
	        var frameNodes = MCGlobals.RootFrame.document.getElementsByTagName("frame");
	        var bodyFrameNode = null;

	        for (var i = 0, length = frameNodes.length; i < length; i++)
	        {
	            if (frameNodes[i].name == "body")
	            {
	                bodyFrameNode = frameNodes[i];
	                break;
	            }
	        }

	        bodyFrameNode.src = MCGlobals.DefaultStartTopic;
	    }
	});
}

function SetCurrentTopicIndexFormatString( span, formatString )
{
	var currText = "";
	
	for ( var i = 0, length = formatString.length; i < length; i++ )
	{
		var c = formatString.charAt( i );
		
		if ( c == "{" )
		{
			var textNode = document.createTextNode( currText );
			span.appendChild( textNode );
			
			currText = "";
			
			var endPos = formatString.indexOf( "}", i );
			
			if ( endPos >= 0 )
			{
				var format = formatString.substring( i + 1, endPos );
				
				if ( format == "n" )
				{
					var topicIndexNode = document.createElement( "span" );
					topicIndexNode.setAttribute( "id", "MCCurrentTopicIndex" );
					span.appendChild( topicIndexNode );
					
					var topicIndexTextNode = document.createTextNode( "" );
					topicIndexNode.appendChild( topicIndexTextNode );
				}
				else if ( format == "total" )
				{
					var topicTotalNode = document.createElement( "span" );
					topicTotalNode.setAttribute( "id", "MCTopicTotal" );
					span.appendChild( topicTotalNode );
					
					var topicTotalTextNode = document.createTextNode( "" );
					topicTotalNode.appendChild( topicTotalTextNode );
				}
				
				i = endPos;
			}
		}
		else
		{
			currText += c;
		}
	}
	
	var remainingTextNode = document.createTextNode( currText );
	span.appendChild( remainingTextNode );
	
	FMCRegisterCallback( "Body", MCEventType.OnInit, OnBodyInitSetCurrentTopicIndex, null );
}

function OnBodyInitSetCurrentTopicIndex()
{
    var span = document.getElementById("MCCurrentTopicIndexContainer");

    if (span == null)
    {
        return;
    }

    if (MCGlobals.InPreviewMode)
    {
        SetCurrentTopicIndexSequenceIndex(0);
        SetCurrentTopicIndexTotal(0);
        OnCompleteBoth();
    }
    else
    {
        FMCPostMessageRequest(MCGlobals.BodyFrame, "get-bs-path", null, function (data)
        {
            var bsPath = data[0];
            var href = new CMCUrl(data[1]);

            OnCompleteGetBSPath(bsPath, href);
        }, function ()
        {
            var bsPath = MCGlobals.BodyFrame.CMCUrl.QueryMap.GetItem("BrowseSequencePath");
            var href = FMCGetBodyHref();

            if (bsPath == null)
            {
                bsPath = FMCGetMCAttribute(MCGlobals.BodyFrame.document.documentElement, "MadCap:browseSequencePath");

                if (bsPath != null)
                {
                    var master = FMCGetHelpSystem();
                    var fullBsPath = master.GetFullTocPath("browsesequences", href.PlainPath);

                    if (fullBsPath)
                    {
                        bsPath = bsPath ? fullBsPath + "|" + bsPath : fullBsPath;
                    }
                }
            }

            OnCompleteGetBSPath(bsPath, href);
        });
    }

    function OnCompleteGetBSPath(bsPath, href)
    {
        function OnCompleteGetEntrySequenceIndex(sequenceIndex)
        {
            if (sequenceIndex == -1)
            {
                span.style.display = "none";

                OnCompleteBoth();

                return;
            }

            span.style.display = "";

            SetCurrentTopicIndexSequenceIndex(sequenceIndex);

            file.GetIndexTotalForEntry(bsPath, href, OnCompleteGetIndexTotalForEntry);

            function OnCompleteGetIndexTotalForEntry(total)
            {
                SetCurrentTopicIndexTotal(total);

                window.setTimeout(OnCompleteBoth, 100);
            }
        }

        if (bsPath == null || bsPath == "" || bsPath.StartsWith("$$$$$"))
        {
            OnCompleteGetEntrySequenceIndex(-1);

            return;
        }

        var master = FMCGetHelpSystem();
        var file = master.GetBrowseSequenceFile();
        file.GetEntrySequenceIndex(bsPath, href, OnCompleteGetEntrySequenceIndex);
    }
}

function OnCompleteBoth()
{
	var span = document.getElementById( "MCCurrentTopicIndexContainer" );
	
	span.parentNode.style.width = span.offsetWidth + "px";

	if ( gIsTopicToolbar )
	{
		SetIFrameFixedWidth();
	}
}

function SetCurrentTopicIndexSequenceIndex( sequenceIndex )
{
	var topicIndexNode = document.getElementById( "MCCurrentTopicIndex" );

	if ( topicIndexNode != null )
	{
		topicIndexNode.firstChild.nodeValue = sequenceIndex.toString();
	}
}

function SetCurrentTopicIndexTotal( total )
{
	var topicTotalNode = document.getElementById( "MCTopicTotal" );

	if ( topicTotalNode != null )
	{
		topicTotalNode.firstChild.nodeValue = total.toString();
	}
}

function SetIFrameFixedWidth()
{
	var buttonsTD = document.getElementById( "ToolbarButtons" );
	var tds = buttonsTD.getElementsByTagName( "td" );
	var totalWidth = 0;
	
	for ( var i = 0, length = tds.length; i < length; i++ )
	{
		var td = tds[i];
		
		totalWidth += parseInt( td.style.width );
		totalWidth += parseInt( FMCGetComputedStyle( td, "paddingLeft" ) );
		totalWidth += parseInt( FMCGetComputedStyle( td, "paddingRight" ) );
	}

	FMCPostMessageRequest(MCGlobals.BodyFrame, "set-iframe-width", [window.name, totalWidth], null, function ()
	{
	    var iframe = FMCGetContainingIFrame(window);

	    iframe.style.width = totalWidth + "px";
	    iframe.style.visibility = "visible";
	});
}

function EditUserProfile()
{
    FMCPostMessageRequest(MCGlobals.BodyFrame, "edit-user-profile", null, null, function ()
    {
        MCGlobals.BodyFrame.FMCEditUserProfile();
    }, true);
}

function OnChangeNavigationStateStarted( state, navPosition )
{
	var navButton = document.getElementById( "ToggleNavigationButton" );

	if ( navButton )
	{
	    if (!MCGlobals.InPreviewMode)
	    {
	        FMCPostMessageRequest(MCGlobals.RootFrame, "gInit", null, function (data)
	        {
	            var isRootInit = FMCStringToBool(data[0]);

	            if (isRootInit)
	            {
	                ToggleCheckedButton(navButton);
	            }
	        }, function ()
	        {
	            if (MCGlobals.RootFrame.gInit)
	            {
	                ToggleCheckedButton(navButton);
	            }
	        });
	    }
	}
	
	if ( navPosition == "Left" || navPosition == "Right" )
    {
		if ( state == "visible" )
		{
			// Need to use MCGlobals.ToolbarFrame because even though we're a toolbar, we might be an in-topic toolbar and the AccordionTitle is located in the main toolbar.
			var accordionTitle = MCGlobals.ToolbarFrame.document.getElementById( "AccordionTitle" );

			if ( accordionTitle != null )
			{
				accordionTitle.style.visibility = "visible";
			}
		}
	}
}

function OnChangeNavigationStateCompleted( state, navPosition )
{
	if ( navPosition == "Left" || navPosition == "Right" )
    {
		if ( state == "hidden" )
		{
			// Need to use MCGlobals.ToolbarFrame because even though we're a toolbar, we might be an in-topic toolbar and the AccordionTitle is located in the main toolbar.
			var accordionTitle = MCGlobals.ToolbarFrame.document.getElementById( "AccordionTitle" );

			if ( accordionTitle != null )
			{
				accordionTitle.style.visibility = "hidden";
			}
		}
	}
}

function OnChangingNavigationState( newWidth )
{
	// Need to use MCGlobals.ToolbarFrame because even though we're a toolbar, we might be an in-topic toolbar and the AccordionTitle is located in the main toolbar.
	var accordionTitle = MCGlobals.ToolbarFrame.document.getElementById( "AccordionTitle" );
	
	if ( accordionTitle != null )
	{
		accordionTitle.style.width = newWidth + "px";
	}
}

function ToggleCheckedButton(divEl)
{
    var buttonEl = divEl.getElementsByTagName("button")[0];
    var checkedImage = FMCGetMCAttribute(divEl, "MadCap:checkedImage");

    divEl.setAttribute("MadCap:checkedImage", FMCGetMCAttribute(divEl, "MadCap:outImage"));
    divEl.setAttribute("MadCap:outImage", checkedImage);

    divEl.onmouseout(); // Force onmouseout() to fire so that image gets flipped back to "hide" state
	
	//

    var checkedTitle = FMCGetMCAttribute(buttonEl, "MadCap:checkedTitle");

    buttonEl.setAttribute("MadCap:checkedTitle", buttonEl.title);

    buttonEl.title = checkedTitle;
    divEl.getElementsByTagName("img")[0].alt = checkedTitle;
}

function Toolbar_OnMessage(e)
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

        if (message == "change-navigation-state-started")
        {
            var state = dataValues[0];
            var navPosition = dataValues[1];

            OnChangeNavigationStateStarted(state, navPosition);

            //

            handled = true;
        }
        else if (message == "change-navigation-state-completed")
        {
            var state = dataValues[0];
            var navPosition = dataValues[1];

            OnChangeNavigationStateCompleted(state, navPosition);

            //

            handled = true;
        }
        else if (message == "changing-navigation-state")
        {
            var newWidth = dataValues[0];

            OnChangingNavigationState(newWidth);

            //

            handled = true;
        }
        else if (message == "current-navigation-pane-changed")
        {
            var title = dataValues[0];
            var accordionTitle = document.getElementById("AccordionTitleLabel");

            if (accordionTitle != null)
            {
                accordionTitle.firstChild.nodeValue = title;
            }

            //

            handled = true;
        }
        else if (message == "topic-initialized")
        {
            gTopicID = dataValues[0];

            if (document.getElementById("RatingIcons") != null)
            {
                SetRating(0);
                UpdateRating();
            }

            OnBodyInitSetCurrentTopicIndex();

            //

            handled = true;
        }
        else if (message == "navigation-resized")
        {
            var width = dataValues[0];

            var accordionTitle = document.getElementById("AccordionTitle");

            if (accordionTitle != null)
            {
                accordionTitle.style.width = width + "px";
            }

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

if ( gRuntimeFileType == "Toolbar" )
{

var gInit						= false;
var gIsTopicToolbar				= window.name.StartsWith( "mctoolbar_" );
var gAboutBoxEnabled			= true;
var gAboutBoxURL				= null;
var gAboutBoxWidth				= 319;
var gAboutBoxHeight				= 317;
var gAboutBoxAlternateText		= "About";
var gHideNavStartup				= false;
var gTocTitle					= "Table of Contents";
var gIndexTitle					= "Index";
var gSearchTitle				= "Search";
var gGlossaryTitle				= "Glossary";
var gFavoritesTitle				= "Favorites";
var gBrowseSequencesTitle = "Browse Sequences";
var gCommunityTitle       = "Community";

var gQuickSearchExternalLabel	= "Quick search is disabled in external topics.";
var gQuickSearchIE55			= "Quick search is disabled in Internet Explorer 5.5.";
var gRemoveHighlightIE55Label	= "Remove highlighting is disabled in Internet Explorer 5.5.";
var gTopicID = null;
var gChangeNavigationStateStartedEventID = null;
var gChangeNavigationStateCompletedEventID = null;
var gChangingNavigationStateEventID = null;

var gNavPosition            = "Left";

gOnloadFuncs.push(Toolbar_Init);

if (FMCIsChromeLocal())
{
    window.addEventListener("message", Toolbar_OnMessage, false);
}

}
