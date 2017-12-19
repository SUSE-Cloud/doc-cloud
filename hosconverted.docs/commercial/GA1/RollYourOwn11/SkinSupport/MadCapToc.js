/// <reference path="MadCapUtilities.js" />
/// <reference path="MadCapMerging.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Toc_WindowOnload()
{
	if ( MCGlobals.NavigationFrame != null )
	{
		Toc_WaitForPaneActive();
	}
	else
	{
		Toc_Init( null );
	}
}

function Toc_WaitForPaneActive()
{
    function OnGetActivePane(activePane)
    {
        if (activePane == window.name)
        {
            //MCGlobals.NavigationFrame.SetIFrameHeight();

            Toc_Init(null);
        }
        else
        {
            window.setTimeout(Toc_WaitForPaneActive, WAIT_FOR_PANE_ACTIVE_INTERVAL);
        }
    }

    FMCPostMessageRequest(MCGlobals.NavigationFrame, "gActivePane", null, function (data)
    {
        var activePane = data[0];

        OnGetActivePane(activePane);
    }, function ()
    {
        OnGetActivePane(MCGlobals.NavigationFrame.gActivePane);
    });
}

function SyncTOC( tocPath, href )
{
	if ( tocPath == null )
	{
		return;
	}
	
	//
	
	GetTocNode( tocPath, href, OnComplete );

	function OnComplete( tocNode )
	{
		if ( tocNode )
		{
			for ( var currNode = tocNode.parentNode; currNode != null && currNode.id != "CatapultToc"; currNode = currNode.parentNode )
			{
				if ( FMCGetChildNodeByTagName( currNode, "DIV", 0 ).style.display == "none" )
				{
					var aNode = FMCGetChildNodeByTagName( currNode, "A", 0 );
					
					TocExpand( aNode );
				}
				else
				{
					break;
				}
			}

			SetSelection( FMCGetChildNodeByTagName( tocNode, "A", 0 ) );
			FMCScrollToVisible( window, tocNode );
		}
	}
}

function GetTocNode( tocPath, href, onCompleteFunc )
{
	Toc_Init( OnInit );

	function OnInit()
	{
		gTocPath = tocPath;
		gTocHref = href;

		//

		var tocNode	= document.getElementById( "CatapultToc" ).getElementsByTagName( "div" )[0];
		var steps	= (tocPath == "") ? new Array( 0 ) : tocPath.split( "|" );

		for ( var i = 0; tocNode && i < steps.length; i++ )
		{
			var aNode	= FMCGetChildNodeByTagName( tocNode, "A", 0 );

			if ( FMCGetMCAttribute( aNode, "MadCap:chunk" ) )
			{
				CreateToc( aNode,
					function()
					{
						GetTocNode( gTocPath, gTocHref, onCompleteFunc )
					}
				);

				return;
			}
			
			//
			
			tocNode = FindBook( tocNode, steps[i] );
		}

		if ( tocNode == null )
		{
			onCompleteFunc( null );
			
			return;
		}

        var aNode = FMCGetChildNodeByTagName(tocNode, "A", 0);

        if (FMCGetMCAttribute(aNode, "MadCap:chunk"))
        {
            CreateToc(aNode, function ()
            {
                GetTocNode(gTocPath, gTocHref, onCompleteFunc)
            });

            return;
        }
		
		var relHref = href.ToRelative( new CMCUrl( MCGlobals.RootFolder ) );
		var foundNode = FindLink( tocNode, relHref.FullPath.toLowerCase(), true );

		if ( !foundNode )
		{
			bodyHref = relHref.PlainPath.toLowerCase();
			foundNode = FindLink( tocNode, relHref.PlainPath.toLowerCase(), false );
		}
		
		//

		gTocPath = null;
		gTocHref = null;
		
		//
		
		onCompleteFunc( foundNode );
	}
}

function FindBook( tocNode, step )
{
	var foundNode = null;
	var div = FMCGetChildNodeByTagName( tocNode, "DIV", 0 );

	for ( var i = 0; i < tocNode.childNodes.length; i++ )
	{
		if ( tocNode.childNodes[i].nodeName == "DIV" &&
			 tocNode.childNodes[i].firstChild.lastChild.nodeValue == step )
		{
			foundNode = tocNode.childNodes[i];
			
			break;
		}
	}
	
	return foundNode;
}

function FindLink( node, bodyHref, exactMatch )
{
	var foundNode	= null;
    var aNode		= FMCGetChildNodeByTagName( node, "A", 0 );
    var bookHref	= aNode.href;

	bookHref = bookHref.replace( /%20/g, " " );
	bookHref = bookHref.substring( MCGlobals.RootFolder.length );
	bookHref = bookHref.toLowerCase();
    
	if ( bookHref == bodyHref )
	{
		foundNode = node;
	}
	else
	{
		for ( var k = 1; k < node.childNodes.length; k++ )
		{
			var currNode		= node.childNodes[k];
			
			if ( currNode.nodeType != 1 || currNode.nodeName != "DIV" ) { continue; }
			
			var currTopicHref	= currNode.firstChild.href;
			
			currTopicHref = currTopicHref.replace( /%20/g, " " );
			currTopicHref = currTopicHref.substring( MCGlobals.RootFolder.length );
			currTopicHref = currTopicHref.toLowerCase();
			
			if ( !exactMatch )
			{
				var hashPos	= currTopicHref.indexOf( "#" );

				if ( hashPos != -1 )
				{
					currTopicHref = currTopicHref.substring( 0, hashPos );
				}
				
				var searchPos	= currTopicHref.indexOf( "?" );
				
				if ( searchPos != -1 )
				{
					currTopicHref = currTopicHref.substring( 0, searchPos );
				}
			}
            
			if ( currTopicHref == bodyHref )
			{
				foundNode = currNode;
				
				break;
			}
		}
	}
	
	return foundNode;
}

function SetSelection( aNode )
{
    if ( gCurrSelection )
    {
        var oldBGColor  = FMCGetMCAttribute( gCurrSelection, "MadCap:oldBGColor" );
        
        if ( !oldBGColor )
        {
            oldBGColor = "Transparent";
        }
        
        gCurrSelection.style.backgroundColor = oldBGColor;
    }
    
    gCurrSelection = aNode;
    gCurrSelection.setAttribute( "MadCap:oldBGColor", FMCGetComputedStyle( gCurrSelection, "backgroundColor" ) );
    gCurrSelection.style.backgroundColor = "#dddddd";
}

function BookOnClick( e )
{
	var node	= this;

    SetSelection( node );
    
    TocExpand( node );
    
    if ( node.href.indexOf( "javascript:" ) == -1 )
    {
        var frameName   = FMCGetMCAttribute( node, "MadCap:frameName" );
        
        if ( !frameName )
        {
            frameName = "body";
        }
        
        window.open( node.href, frameName );
    }
    
    return false;
}

function ChunkOnClick( e )
{
    var node	= this;

	SetSelection( node );
    
    CreateToc( node, null );
    
    if ( node.href.indexOf( "javascript:" ) == -1 )
    {
        FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate", [node.href], null, function ()
        {
            parent.parent.frames["body"].document.location.href = node.href;
        });
    }
    
    return false;
}

function TopicOnClick( e )
{
    var node	= this;

    SetSelection( node );
    
    if ( node.href.indexOf( "javascript:" ) == -1 )
    {
        var frameName   = FMCGetMCAttribute( node, "MadCap:frameName" );
        
        if ( !frameName )
        {
            frameName = "body";
        }
        
        window.open( node.href, frameName );
    }
    
    return false;
}

function GetOwnerHelpSystem( node )
{
    var currNode        = node;
    var ownerHelpSystem = null;
    
    while ( true )
    {
        if ( currNode.parentNode.id == "CatapultToc" )
        {
            ownerHelpSystem = FMCGetHelpSystem();
            
            break;
        }
        
        var a   = FMCGetChildNodeByTagName( currNode, "A", 0 );
        
        ownerHelpSystem = a["MadCap:helpSystem"];
        
        if ( !ownerHelpSystem && currNode.parentNode.id != "CatapultToc" )
        {
            currNode = currNode.parentNode;
        }
        else
        {
            break;
        }
    }
    
    return ownerHelpSystem;
}

function BuildToc(xmlNode, htmlNode, indent, fullPath)
{
    for (var i = 0, length = xmlNode.childNodes.length; i < length; i++)
    {
        var entry = xmlNode.childNodes[i];

        if (entry.nodeName != "TocEntry")
        {
            continue;
        }

        var div = document.createElement("div");
        var a = null;
        var img = document.createElement("img");
        var title = entry.getAttribute("Title");
        var link = entry.getAttribute("Link");
        var frameName = entry.getAttribute("FrameName");
        var chunk = entry.getAttribute("Chunk");
        var mergeHint = entry.getAttribute("MergeHint");
        var isBook = (FMCGetChildNodesByTagName(entry, "TocEntry").length > 0 || chunk || mergeHint);
        var bookIcon = null;
        var bookOpenIcon = null;
        var topicIcon = null;
        var markAsNew = null;
        var topicIconAlt = "Topic";
        var bookIconAlt = "Closed Submenu";
        var bookOpenIconAlt = "Open Submenu";
        var markAsNewIconAlt = "New";

        // Create "div" tag

        div.style.textIndent = indent + "px";
        div.style.position = "relative";
        div.style.display = "none";

        div.setAttribute("MadCap:state", "closed");

        // Apply style

        var entryClass = entry.getAttribute("Class");
        var className = "TocEntry_" + ((entryClass == null) ? "TocEntry" : entryClass);
        var aCached = gClassToANodeMap.GetItem(className);
        var nameToValueMap = gStylesMap.GetItem(className);

        if (!aCached)
        {
            aCached = document.createElement("a");

            if (nameToValueMap)
            {
                nameToValueMap.ForEach(function (key, value)
                {
                    var style = ConvertToCSS(key);

                    aCached.style[style] = value;

                    return true;
                });
            }

            gClassToANodeMap.Add(className, aCached);
        }

        // Create "a" tag

        a = aCached.cloneNode(false);
        a.setAttribute("MadCap:className", className);
        a.onmouseover = TocEntryOnmouseover;
        a.onmouseout = TocEntryOnmouseout;

        if (nameToValueMap)
        {
            bookIcon = nameToValueMap.GetItem("BookIcon");
            bookOpenIcon = nameToValueMap.GetItem("BookOpenIcon");
            topicIcon = nameToValueMap.GetItem("TopicIcon");

            var value = nameToValueMap.GetItem("TopicIconAlternateText");

            if (value) { topicIconAlt = value; }

            value = nameToValueMap.GetItem("BookIconAlternateText");

            if (value) { bookIconAlt = value; }

            value = nameToValueMap.GetItem("BookOpenIconAlternateText");

            if (value) { bookOpenIconAlt = value; }

            value = nameToValueMap.GetItem("MarkAsNewIconAlternateText");

            if (value) { markAsNewIconAlt = value; }

            var markAsNewValue = nameToValueMap.GetItem("MarkAsNew");

            if (markAsNewValue)
            {
                markAsNew = FMCStringToBool(markAsNewValue);
            }
        }

        if (link && !mergeHint)
        {
            if (link.charAt(0) == "/")
            {
                link = fullPath + link.substring(1);
            }

            a.setAttribute("href", link);

            if (!frameName)
            {
                frameName = "body";
            }

            a.setAttribute("MadCap:frameName", frameName);
        }
        else
        {
            a.setAttribute("href", "javascript:void( 0 );");
        }

        //

        var ownerHelpSystem = GetOwnerHelpSystem(htmlNode);
        var subPath = null;

        if (mergeHint)
        {
            var subsystem = ownerHelpSystem.GetSubsystem(parseInt(mergeHint));

            if (subsystem == null || !subsystem.GetExists())
            {
                continue;
            }

            subPath = subsystem.GetPath();

            var fileName = null;

            if (window.name == "toc")
            {
                if (!subsystem.HasToc)
                {
                    continue;
                }

                fileName = "Toc.xml";
            }
            else if (window.name == "browsesequences")
            {
                if (!subsystem.HasBrowseSequences)
                {
                    continue;
                }

                fileName = "BrowseSequences.xml";
            }

            chunk = subPath + "Data/" + fileName;

            a["MadCap:helpSystem"] = subsystem;

            var replaceMergeNode = FMCGetAttributeBool(entry, "ReplaceMergeNode", false);

            if (replaceMergeNode)
            {
                div.appendChild(a);
                htmlNode.appendChild(div);

                var args = { div: div, htmlNode: htmlNode, subPath: subPath, subsystem: subsystem };

                CMCXmlParser.GetXmlDoc(chunk, true, function (subTocDoc, args)
                {
                    var div = args.div;
                    var htmlNode = args.htmlNode;
                    var subPath = args.subPath;
                    var subsystem = args.subsystem;
                    var nextNode = div.nextSibling;

                    BuildToc(subTocDoc.documentElement, div, indent, subPath);

                    var newDivs = FMCGetChildNodesByTagName(div, "DIV");

                    htmlNode.removeChild(div);

                    for (var j = 0; j < newDivs.length; j++)
                    {
                        var newDiv = newDivs[j];
                        var newA = FMCGetChildNodeByTagName(newDiv, "A", 0);
                        var state = FMCGetAttribute(htmlNode, "MadCap:state");

                        newDiv.style.display = (state == "open") ? "block" : "none";

                        htmlNode.insertBefore(newDiv, nextNode);

                        if (!newA["MadCap:helpSystem"])
                        {
                            newA["MadCap:helpSystem"] = subsystem;
                        }
                    }
                }, args, null);

                continue;
            }
        }

        //

        a.title = title;

        if (isBook)
        {
            if (chunk)
            {
                if (!mergeHint)
                {
                    var masterHS = FMCGetHelpSystem();

                    if (ownerHelpSystem == masterHS && masterHS.IsWebHelpPlus)
                    {
                        chunk = masterHS.GetPath() + "AutoMergeCache/" + chunk;
                    }
                    else
                    {
                        chunk = ownerHelpSystem.GetPath() + "Data/" + chunk;
                    }
                }

                a.onclick = ChunkOnClick;
                a.setAttribute("MadCap:chunk", chunk);
                a.MCTocXmlNode = entry;
            }
            else if (entry.childNodes.length > 0)
            {
                a.onclick = BookOnClick;
            }

            // Create "img" tag. Append to "a" tag.

            if (bookIcon == "none")
            {
                img = null;
            }
            else
            {
                var src = "Images/Book.gif";
                var width = 16;
                var height = 16;

                if (bookIcon)
                {
                    bookIcon = FMCStripCssUrl(bookIcon);
                    bookIcon = decodeURIComponent(bookIcon);

                    src = "../" + MCGlobals.SkinFolder + escape(bookIcon);
                    width = CMCFlareStylesheet.GetResourceProperty(bookIcon, "Width", 16);
                    height = CMCFlareStylesheet.GetResourceProperty(bookIcon, "Height", 16);
                }

                img.src = src;
                img.alt = bookIconAlt;
                img.setAttribute("MadCap:bookIconAltText", bookIconAlt);
                img.setAttribute("MadCap:bookOpenIconAltText", bookOpenIconAlt);

                if (!bookOpenIcon || bookOpenIcon == "none")
                {
                    img.setAttribute("MadCap:altsrc", "Images/BookOpen.gif");
                }
                else
                {
                    bookOpenIcon = FMCStripCssUrl(bookOpenIcon);
                    bookOpenIcon = "../" + MCGlobals.SkinFolder + escape(bookOpenIcon);
                    img.setAttribute("MadCap:altsrc", bookOpenIcon);

                    FMCPreloadImage(bookOpenIcon);
                }

                img.style.width = width + "px";
                img.style.height = height + "px";
                img.style.verticalAlign = "middle";
            }
        }
        else
        {
            a.onclick = TopicOnClick;

            if (topicIcon == "none")
            {
                img = null;
            }
            else
            {
                var src = "Images/Topic.gif";
                var width = 16;
                var height = 16;

                if (topicIcon)
                {
                    topicIcon = FMCStripCssUrl(topicIcon);
                    topicIcon = decodeURIComponent(topicIcon);

                    src = "../" + MCGlobals.SkinFolder + escape(topicIcon);
                    width = CMCFlareStylesheet.GetResourceProperty(topicIcon, "Width", 16);
                    height = CMCFlareStylesheet.GetResourceProperty(topicIcon, "Height", 16);
                }

                img.src = src;
                img.alt = topicIconAlt;
                img.style.width = width + "px";
                img.style.height = height + "px";
                img.style.verticalAlign = "middle";
            }
        }

        var markAsNewEntry = entry.getAttribute("MarkAsNew");
        var markAsNewComputed = markAsNewEntry ? FMCStringToBool(markAsNewEntry) : markAsNew;

        if (markAsNewComputed)
        {
            var newImg = document.createElement("img");

            newImg.src = "Images/NewItemIndicator.bmp";
            newImg.alt = markAsNewIconAlt;
            newImg.style.width = "7px";
            newImg.style.height = "7px";
            newImg.style.position = "absolute";

            a.appendChild(newImg);
        }

        img ? a.appendChild(img) : false;

        // Create "text" node

        var text = document.createTextNode(title);

        a.appendChild(text);
        div.appendChild(a);
        htmlNode.appendChild(div);

        // Build TOC for child nodes

        BuildToc(entry, div, indent + 16, mergeHint ? subPath : fullPath);
    }
}

function CacheStyles(OnCompleteFunc)
{
    CMCXmlParser.GetXmlDoc(MCGlobals.RootFolder + MCGlobals.SkinFolder + "Stylesheet.xml", true, function (stylesDoc)
    {
        var styles = stylesDoc.getElementsByTagName("Style");
        var tocEntryStyle = null;

        for (var i = 0; i < styles.length; i++)
        {
            if (styles[i].getAttribute("Name") == "TocEntry")
            {
                tocEntryStyle = styles[i];

                break;
            }
        }

        if (tocEntryStyle)
        {
            var properties = FMCGetChildNodesByTagName(tocEntryStyle, "Properties");

            if (properties.length > 0)
            {
                var nameToValueMap = new CMCDictionary();
                var props = properties[0].childNodes;

                for (var i = 0; i < props.length; i++)
                {
                    var prop = props[i];

                    if (prop.nodeType != 1) { continue; }

                    nameToValueMap.Add(prop.getAttribute("Name"), FMCGetPropertyValue(prop, null));
                }

                gStylesMap.Add("TocEntry_" + tocEntryStyle.getAttribute("Name"), nameToValueMap);
            }

            //

            var styleClasses = tocEntryStyle.getElementsByTagName("StyleClass");

            for (var i = 0; i < styleClasses.length; i++)
            {
                var properties = FMCGetChildNodesByTagName(styleClasses[i], "Properties");

                if (properties.length > 0)
                {
                    var nameToValueMap = new CMCDictionary();
                    var props = properties[0].childNodes;

                    for (var j = 0; j < props.length; j++)
                    {
                        var prop = props[j];

                        if (prop.nodeType != 1) { continue; }

                        nameToValueMap.Add(prop.getAttribute("Name"), FMCGetPropertyValue(prop, null));
                    }

                    gStylesMap.Add("TocEntry_" + styleClasses[i].getAttribute("Name"), nameToValueMap);
                }
            }
        }

        OnCompleteFunc();
    }, null);
}

function ConvertToCSS( prop )
{
    if ( prop == "TopicIcon" || prop == "BookIcon" || prop == "BookOpenIcon" || prop == "HtmlHelpIconIndex" || prop == "MarkAsNew" )
    {
        return prop;
    }
    else
    {
        return prop.charAt( 0 ).toLowerCase() + prop.substring( 1, prop.length );
    }
}

function CreateToc( a, OnCompleteFunc )
{
	var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
	var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

	StartLoading( window, document.body, loadingLabel, loadingAlternateText, document.getElementsByTagName( "div" )[1] );

	//

	var headNode = a.parentNode;
	var xmlFile = FMCGetMCAttribute( headNode.getElementsByTagName( "a" )[0], "MadCap:chunk" );

	FMCRemoveMCAttribute( a, "MadCap:chunk" );

	a.onclick = BookOnClick;

	var masterHS = FMCGetHelpSystem();
	var hasToc = true;
	var tocFile = null;

	if (gRuntimeFileType == "Toc")
	{
	    hasToc = masterHS.HasToc;
	    tocFile = masterHS.GetTocFile();
	}
	else
	{
	    hasToc = masterHS.HasBrowseSequences;
	    tocFile = masterHS.GetBrowseSequenceFile();
	}

	if (!hasToc)
	{
	    EndLoading(window, document.getElementsByTagName("div")[1]);

	    if (OnCompleteFunc != null)
	    {
	        OnCompleteFunc();
	    }

	    return;
	}

	if ( xmlFile == "Toc.xml" || xmlFile == "BrowseSequences.xml" )
	{
		tocFile.GetRootNode( OnCompleteGetTocNode );
	}
	else
	{
		tocFile.LoadChunk( a.MCTocXmlNode, xmlFile, OnCompleteGetTocNode );
	}

	function OnCompleteGetTocNode( tocNode )
	{
		if ( !tocNode )
		{
			EndLoading( window, document.getElementsByTagName( "div" )[1] );
	        
			if ( OnCompleteFunc != null )
			{
				OnCompleteFunc();
			}
	        
			return;
		}
	    
		var headNode	= a.parentNode;
		var indent      = parseInt( headNode.style.textIndent );
		var helpSystem  = GetOwnerHelpSystem( headNode );
		var path        = helpSystem.GetPath();
	    
		indent += (headNode.parentNode.id == "CatapultToc") ? 0 : 16;

		BuildToc(tocNode, headNode, indent, path)

		TocExpand(a);

		//

		EndLoading(window, document.getElementsByTagName("div")[1]);

		//

		if (OnCompleteFunc != null)
		{
		    OnCompleteFunc();
		}
	}
}

function InitOnComplete()
{
	for ( var i = 0; i < gInitOnCompleteFuncs.length; i++ )
	{
		gInitOnCompleteFuncs[i]();
	}
}

function Toc_Init( OnCompleteFunc )
{
    if ( gInit )
    {
		if ( OnCompleteFunc != null )
		{
			OnCompleteFunc();
		}
		
        return;
    }

    //

    var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
    var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

    StartLoading(window, document.body, loadingLabel, loadingAlternateText, document.getElementsByTagName("div")[1]);

	window.setTimeout( Init2, 0 );
    
    function Init2()
    {
		if ( OnCompleteFunc != null )
		{
			gInitOnCompleteFuncs.push( OnCompleteFunc );
		}
	    
		if ( gInitializing )
		{
			return;
		}
	    
		gInitializing = true;

		//

		var styleClassName = gRuntimeFileType == "Toc" ? "TOC" : "BrowseSequence";
		var label = CMCFlareStylesheet.LookupValue("AccordionItem", styleClassName, "Label", null);

		if (label != null)
		{
		    document.title = label;
		}

		FMCPreloadImage("Images/BookOpen.gif");

		var backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "Accordion" + styleClassName, "BackgroundColor", null);

		if (backgroundColor != null)
		{
		    document.body.style.backgroundColor = backgroundColor;
		}

		CacheStyles(function ()
		{
		    CMCXmlParser.GetXmlDoc(MCGlobals.RootFolder + MCGlobals.SkinFolder + "Skin.xml", true, function (xmlDoc)
		    {
		        gSyncTOC = FMCGetAttributeBool(xmlDoc.documentElement, "AutoSyncTOC", false);

		        //

		        var a = document.getElementById("CatapultToc").getElementsByTagName("div")[0].getElementsByTagName("a")[0];

		        CreateToc(a, OnCreateTocComplete);

		        function OnCreateTocComplete()
		        {
		            gInit = true;

		            EndLoading(window, document.getElementsByTagName("div")[1]);

		            InitOnComplete();
		        }
		    }, null);
		});
	}
}

function TocExpand(a)
{
    var div = a.parentNode;
    var state = FMCGetAttribute(div, "MadCap:state");
    var tocEntries = div.childNodes;

    for (var i = 0; i < tocEntries.length; i++)
    {
        var tocEntry = tocEntries[i];

        if (tocEntry.nodeName != "DIV")
        {
            continue;
        }

        tocEntry.style.display = (state == "open") ? "none" : "block";
    }

    var imgs = a.getElementsByTagName("img");

    if (imgs.length > 0)
    {
        var img = null;

        if (imgs.length == 2)
            img = a.getElementsByTagName("img")[1];
        else if (imgs.length == 1)
            img = a.getElementsByTagName("img")[0];

        FMCImageSwap(img, "swap");

        img.setAttribute("alt", state == "open" ? FMCGetAttribute(img, "MadCap:bookIconAltText") : FMCGetAttribute(img, "MadCap:bookOpenIconAltText"));
    }

    FMCScrollToVisible(window, div);

    div.setAttribute("MadCap:state", state == "open" ? "closed" : "open");
}

function TocEntryOnmouseover()
{
	this.style.color = "#ff0000";
}

function TocEntryOnmouseout()
{
	var color			= "#0055ff";
	var className		= FMCGetMCAttribute( this, "MadCap:className" );
	var nameToValueMap	= gStylesMap.GetItem( className );

	if ( nameToValueMap )
	{
		var classColor	= nameToValueMap.GetItem( "Color" );
		
		if ( classColor )
		{
			color = classColor;
		}
	}

	this.style.color = color;
}

function Toc_OnMessage(e)
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

        if (message == "sync-toc")
        {
            var tocPath = dataValues[0];
            var href = new CMCUrl(dataValues[1]);

            if (gSyncTOC)
            {
                SyncTOC(tocPath, href);
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

if ( gRuntimeFileType == "Toc" || gRuntimeFileType == "BrowseSequences" )
{

var gInit				= false;
var gCurrSelection		= null;
var gStylesMap			= new CMCDictionary();
var gClassToANodeMap	= new CMCDictionary();
var gSyncTOC			= false;
var gTocPath			= null;
var gTocHref			= null;

gOnloadFuncs.push( Toc_WindowOnload );

if (FMCIsChromeLocal())
{
    window.addEventListener("message", Toc_OnMessage, false);
}

var gInitializing			= false;
var gInitOnCompleteFuncs	= new Array();

}
