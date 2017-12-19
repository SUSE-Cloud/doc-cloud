// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Index_WindowOnload()
{
	if ( MCGlobals.NavigationFrame != null )
	{
		Index_WaitForPaneActive();
	}
	else
	{
		Index_Init( null );
	}
}

function Index_WaitForPaneActive()
{
    function OnGetActivePane(activePane)
    {
        if (activePane == window.name)
        {
            //MCGlobals.NavigationFrame.SetIFrameHeight();

            Index_Init(null);
        }
        else
        {
            window.setTimeout(Index_WaitForPaneActive, WAIT_FOR_PANE_ACTIVE_INTERVAL);
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

function FindChunk( item )
{
	if ( gChunks.length == 0 )
	{
		return -1;
	}
	else
	{
		for ( var i = 0; i < gChunks.length; i++ )
		{
			var chunk   = gChunks[i];
			var start   = parseInt( chunk.getAttribute( "Start" ) );
			var count   = parseInt( chunk.getAttribute( "Count" ) );
	        
			if ( item >= start && item < start + count )
			{
				return i;
			}
		}
    }
}

function LoadChunk(index, OnCompleteFunc)
{
    function OnGetXmlComplete(xmlDoc)
    {
        var entries = xmlDoc.getElementsByTagName("IndexEntry")[0].getElementsByTagName("Entries")[0];

        FillXmlItems(entries, start, 0);

        OnCompleteFunc();
    }

	var start	= 0;
	
	if ( index == -1 )
	{
	    OnGetXmlComplete(gXMLDoc);
	}
	else
	{
		var chunk		= gChunks[index];
		var link		= FMCGetAttribute( chunk, "Link" );
		var chunkPath	= null;
		
		if ( link.charAt( 0 ) == "/" )
		{
			chunkPath = MCGlobals.RootFolder + link.substring( 1 );
		}
		else
		{
			var masterHS = FMCGetHelpSystem();

			if ( masterHS.IsWebHelpPlus )
			{
				chunkPath = MCGlobals.RootFolder + "AutoMergeCache/" + link;
			}
			else
			{
				chunkPath = MCGlobals.RootFolder + "Data/" + link;
			}
		}

		CMCXmlParser.GetXmlDoc(chunkPath, true, function (xmlDoc)
		{
		    start = parseInt(chunk.getAttribute("Start"));

		    OnGetXmlComplete(xmlDoc);
		}, null);
	}
}

function FillXmlItems( entries, start, level )
{
	var numNodes	= entries.childNodes.length;
	
	for ( var i = 0; i < numNodes; i++ )
    {
		var currEntry	= entries.childNodes[i];
		
		if ( currEntry.nodeType != 1 ) { continue; }
		
		var indexEntry	= new CMCIndexEntry( currEntry, level );
		
		gIndexEntries[start] = indexEntry;
		
		SetLinkMap( (indexEntry.Level / gIndent) + "_" + indexEntry.Term.toLowerCase(), indexEntry.IndexLinks );
		
		var subNodeCount	= FillXmlItems( currEntry.getElementsByTagName( "Entries" )[0], start + 1, level + 1 );
		
		start = subNodeCount;
    }
    
    return start;
}

function LoadChunksForLetter(letter, OnCompleteFunc)
{
    function OnLoadChunk()
    {
        if (chunk == gChunks.length - 1)
        {
            OnCompleteFunc();

            return;
        }

        var next = gChunks[++chunk].getAttribute("FirstTerm").charAt(0).toLowerCase();

        if (next > letter)
        {
            OnCompleteFunc();

            return;
        }

        LoadChunk(chunk, OnLoadChunk);
    }

    var item	= gAlphaMap.GetItem( letter );
    var chunk	= FindChunk( item );

    LoadChunk(chunk, OnLoadChunk);
}

//
//    Class CMCIndexEntry
//

function CMCIndexEntry( indexEntry, level )
{
    // Public properties
    
    var indexLinks				= FMCGetChildNodeByTagName( indexEntry, "Links", 0 ).childNodes;
    var numNodes				= indexLinks.length;
    var nodeCount				= 0;
    
    this.Term					= FMCGetAttribute( indexEntry, "Term" );
    this.IndexLinks				= new Array();
    this.Level					= level;
    this.GeneratedReferenceType	= FMCGetAttribute( indexEntry, "GeneratedReferenceType" );
    
	for ( var i = 0; i < numNodes; i++ )
	{
		var indexLink	= indexLinks[i];
		
		if ( indexLink.nodeType != 1 ) { continue; }
		
		this.IndexLinks[nodeCount] = new CMCIndexLink( indexLink );
		
		nodeCount++;
	}
}

//
//    End class CMCIndexEntry
//

//
//    Class CMCIndexLink
//

function CMCIndexLink( indexLink )
{
	this.Title	= FMCGetAttribute( indexLink, "Title" );
	this.Link	= FMCGetAttribute( indexLink, "Link" );
}

//
//    End class CMCIndexLink
//

function RefreshIndex(OnCompleteFunc)
{
    function Next()
    {
        function OnLoadIndexEntryComplete()
        {
            BuildIndex(i);

            Next();
        }

        i++;

        if (i < lastIndex && i < gIndexEntryCount)
        {
            if (!gIndexDivs[i])
            {
                if (!gIndexEntries[i])
                {
                    LoadIndexEntry(i, OnLoadIndexEntryComplete);
                }
                else
                {
                    OnLoadIndexEntryComplete();
                }
            }
            else
            {
                Next();
            }
        }
        else
        {
            if (OnCompleteFunc != null)
            {
                OnCompleteFunc();
            }
        }
    }

    var div			= document.getElementById( "CatapultIndex" ).parentNode;
    var firstIndex	= Math.floor( div.scrollTop / gEntryHeight );
    var lastIndex	= Math.ceil( (div.scrollTop + parseInt( div.style.height )) / gEntryHeight );
    var i = firstIndex - 1;

    Next();
}

function LoadIndexEntry(index, OnCompleteFunc)
{
	var chunk	= FindChunk( index );

	LoadChunk(chunk, OnCompleteFunc);
}

function BuildIndex( index )
{
    var entry	= gIndexEntries[index];
    var div		= null;
    
    if ( !gDivCached )
    {
		gDivCached = document.createElement( "div" );
		
		gDivCached.style.position = "absolute";
		gDivCached.style.whiteSpace = "nowrap";
    }

	div = gDivCached.cloneNode( false );
    div.style.top = (gEntryHeight * index) + "px";
    div.style.textIndent = (entry.Level * gIndent) + "px";
    document.getElementById( "CatapultIndex" ).appendChild( div );
    
    gIndexDivs[index] = div;
    
    var a			= null;
    var term		= entry.Term;
    var indexLinks	= entry.IndexLinks;
    
    if ( !gACached )
    {
		gACached = document.createElement( "a" );
		gACached.appendChild( document.createTextNode( "&#160;" ) );
		
		gStylesMap.ForEach( function( key, value )
		{
			gACached.style[key] = value;
			
			return true;
		} );
    }

	a = gACached.cloneNode( true );
	a.firstChild.nodeValue = term;
	a.onmouseover = IndexEntryOnmouseover;
    a.onmouseout = IndexEntryOnmouseout;
    
    a.MCIndexEntry = entry;
    
    if ( entry.GeneratedReferenceType != null )
    {
		var prefix	= null;
		
		if ( entry.GeneratedReferenceType == "See" )
		{
			prefix = gSeeReferencePrefix;
		}
		else if ( entry.GeneratedReferenceType == "SeeAlso" )
		{
			prefix = gSeeAlsoReferencePrefix;
		}
		
		prefix = prefix + ": ";
		
		a.firstChild.nodeValue = prefix + term;
		a.style.fontStyle = "italic";
		
		a.setAttribute( "href", "javascript:void( 0 );" );
		a.onclick = IndexEntryOnclick;
    }
    else if ( indexLinks.length <= 1 )
    {
        if ( indexLinks.length == 1 )
        {
            var link	= indexLinks[0].Link;
            
            link = (link.charAt( 0 ) == "/") ? ".." + link : link;
            
            a.setAttribute( "href", link );
            a.setAttribute( "target", "body" );
        }
        else
        {
            a.setAttribute( "href", "javascript:void( 0 );" );
        }
        
        a.onclick = IndexEntryOnclick;
    }
    else if ( indexLinks.length > 1 )
    {
        a = GenerateKLink( a, indexLinks );
    }
    
    div.appendChild( a );
}

function IndexEntryOnmouseover()
{
	this.style.color = "#ff0000";
}

function IndexEntryOnmouseout()
{
	var color	= gStylesMap.GetItem( "color" );

	this.style.color = color ? color : "#0055ff";
}

function IndexEntryOnclick()
{
	var indexEntry	= this.MCIndexEntry;
	
	if ( indexEntry.GeneratedReferenceType != null )
	{
		var textParts		= indexEntry.Term.split( "," );

		SelectIndexEntry(textParts, function (indexEntryIndex)
		{
		    var item = indexEntryIndex;

		    document.getElementById("CatapultIndex").parentNode.scrollTop = item * gEntryHeight;
		    RefreshIndex(function ()
		    {
		        var indexDiv = gIndexDivs[indexEntryIndex];

		        HighlightEntry(indexDiv);
		    });
		});
	}
	else
	{
		HighlightEntry( this.parentNode );
	}
}

function SetLinkMap( term, indexLinks )
{
    var linkMap = new CMCDictionary();
    
    for ( var i = 0; i < indexLinks.length; i++ )
    {
		var indexLink	= indexLinks[i];
		
        linkMap.Add( indexLink.Title, indexLink.Link );
    }
    
    gLinkMap.Add( term, linkMap );
}

function CreateIndex( xmlDoc )
{
    var chunks		= xmlDoc.getElementsByTagName( "Chunk" );
    var xmlHead		= xmlDoc.getElementsByTagName( "CatapultTargetIndex" )[0];
    var attributes	= xmlHead.attributes;
    
    gIndexEntryCount = parseInt( FMCGetAttribute( xmlHead, "Count" ) );
    
    for ( var i = 0; i < attributes.length; i++ )
    {
        var name    = attributes[i].nodeName;
        var value   = parseInt( attributes[i].nodeValue );
        
        if ( name.substring( 0, 5 ) != "Char_" && name.substring( 0, 5 ) != "char_" )
        {
            continue;
        }
        
        var first   = String.fromCharCode( name.substring( 5, name.length ) ).toLowerCase();
        var start   = gAlphaMap.GetItem( first );
        
        if ( start != null )
        {
            value = Math.min( value, start );
        }
        
        gAlphaMap.Add( first, value );
    }
    
    if ( chunks.length == 0 )
    {
        var xmlNode	= xmlDoc.getElementsByTagName( "IndexEntry" )[0].getElementsByTagName( "Entries" )[0];
        
        gIndexEntryCount = 0;
        
        for ( var i = 0; i < xmlNode.childNodes.length; i++ )
        {
            var entry	= xmlNode.childNodes[i];
            
            if ( entry.nodeName == "IndexEntry" )
            {
                var term	= FMCGetAttribute( entry, "Term" );
                
                if ( !term )
                {
                    term = "";
                }
                
                var first	= term.charAt( 0 ).toLowerCase();
                
                if ( gAlphaMap.GetItem( first ) == null )
                {
                    gAlphaMap.Add( first, gIndexEntryCount );
                }
                
                // When incrementing, must include all sub-level index entries
                
                gIndexEntryCount += entry.getElementsByTagName( "IndexEntry" ).length + 1;
            }
        }
    }
    
    document.getElementById( "CatapultIndex" ).style.height = gIndexEntryCount * gEntryHeight + "px";
    gChunks = chunks;
}

function GenerateKLink( a, indexLinks )
{
    var topics	= "";
    
    for ( var i = 0; i < indexLinks.length; i++ )
    {
        if ( i > 0 )
        {
            topics += "||";
        }
        
        var indexLink	= indexLinks[i];
        var link		= indexLink.Link;
        
        link = (link.charAt( 0 ) == "/") ? ".." + link : link;
        
        topics += indexLink.Title + "|" + link;
    }
    
    a.href = "javascript:void( 0 );";
    a.className = "MCKLink";
    a.setAttribute( "MadCap:topics", topics );
    a.onclick = KLinkOnclick;
    a.onkeydown = KLinkOnkeydown;
    
    return a;
}

function KLinkOnclick( e )
{
	HighlightEntry( this.parentNode );
	FMCLinkControl( e, this, gKLinkStylesMap );
	
	return false;
}

function KLinkOnkeydown()
{
	this.MCKeydown = true;
}

function Index_Init( OnCompleteFunc )
{
    if ( gInit )
    {
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
		}
		
        return;
    }

    // Wrap this in a try/catch. This could get invoked from clicking a K-Link control and setting focus to the search field while it's not displayed causes an exception in IE 8.
    try
    {
        document.getElementById("searchField").focus();
    }
    catch (ex)
    {
    }

    var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
    var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

    StartLoading(window, document.body, loadingLabel, loadingAlternateText, null);

	window.setTimeout( Init2, 0 );

	function Init2()
	{
	    Index_LoadStyles();
		//
	    
		function GetIndexOnComplete( xmlDoc, args )
		{
			gXMLDoc = xmlDoc;
			
			CreateIndex( gXMLDoc );

			RefreshIndex(function ()
			{
			    gInit = true;
			
			    EndLoading( window, null );
			
			    if ( OnCompleteFunc )
			    {
				    OnCompleteFunc();
			    }
            });
		}

		FMCGetHelpSystem().GetIndex( GetIndexOnComplete, null );
	}
}

function Index_LoadStyles()
{
    var label = CMCFlareStylesheet.LookupValue("AccordionItem", "Index", "Label", null);

    if (label != null)
    {
        document.title = label;
    }

    var backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "AccordionIndex", "BackgroundColor", null);

    if (backgroundColor != null)
    {
        document.body.style.backgroundColor = backgroundColor;
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("IndexEntry", null);

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

        if (name == "selectionColor")
        {
            gSelectionColor = value;
        }
        else if (name == "selectionBackgroundColor")
        {
            gSelectionBackgroundColor = value;
        }
        else if (name == "seeReference")
        {
            gSeeReferencePrefix = value;
        }
        else if (name == "seeAlsoReference")
        {
            gSeeAlsoReferencePrefix = value;
        }

        gStylesMap.Add(name, value);
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("IndexEntryPopup", null);

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

        gKLinkStylesMap.Add(name, value);
    }

    //

    var searchBoxTooltip = CMCFlareStylesheet.LookupValue("Control", "IndexSearchBox", "Tooltip", "Search alphabetical index as you type");

    if (searchBoxTooltip.toLowerCase() == "none")
    {
        searchBoxTooltip = "";
    }

    document.getElementById("searchField").title = searchBoxTooltip;

    //

    var fontSizePx = 12;

    if (gStylesMap.GetItem("fontSize"))
    {
        fontSizePx = FMCConvertToPx(document, gStylesMap.GetItem("fontSize"), null, 12);
    }

    gEntryHeight = fontSizePx + 3;
}

function HighlightEntry( node )
{
    if ( gSelectedItem )
    {
        var color           = gStylesMap.GetItem( "color" );
        var backgroundColor = gStylesMap.GetItem( "backgroundColor" );
        
        gSelectedItem.firstChild.style.color = color ? color : "#0055ff";
        gSelectedItem.firstChild.style.backgroundColor = backgroundColor ? backgroundColor : "Transparent";
    }
    
    gSelectedItem = node;
    
    if ( gSelectedItem )
    {
        if ( gSelectionColor )
        {
            gSelectedItem.firstChild.style.color = gSelectionColor;
        }
        
        gSelectedItem.firstChild.style.backgroundColor = gSelectionBackgroundColor;
    }
}

function SearchFieldKeyDown(e)
{
    e = e || window.event;

    if (e.keyCode == 9) // tab
    {
        // This code needs to take place during the keydown event rather than the keyup event. This is because the tab key will move focus to the next tabbable item before keyup is fired causing the keyup event not to fire on the search box.

        if (gSelectedItem)
        {
            gSelectedItem.firstChild.focus();

            return false; // return false so that the browser doesn't handle the tab key. We handled it ourselves above.
        }
    }

    return true;
}

function SelectEntry( e )
{
    if ( !e )
    {
        e = window.event;
    }

    if ( e.keyCode == 116 ) // F5
    {
        return true;
    }
    else if ( e.keyCode == 13 ) // enter
    {
        if ( gSelectedItem )
        {
            parent.parent.frames["body"].location.href = gSelectedItem.childNodes[0].href;
        }
        
        return true;
    }

    var text            = document.getElementById( "searchField" ).value;
	var textParts		= text.split( "," );

	SelectIndexEntry(textParts, function (indexEntryIndex)
	{
	    var item = 0;

	    if (indexEntryIndex == -1)
	    {
	        item = 0;
	    }
	    else
	    {
	        item = indexEntryIndex;
	    }

	    document.getElementById("CatapultIndex").parentNode.scrollTop = item * gEntryHeight;

	    RefreshIndex(function ()
	    {
	        var indexDiv = null;

	        if (indexEntryIndex != -1)
	        {
	            indexDiv = gIndexDivs[indexEntryIndex];
	        }

	        HighlightEntry(indexDiv);
	    });
	});

	return true;
}

function SelectIndexEntry(textParts, OnCompleteFunc)
{
	var text	= textParts[0].toLowerCase();
	
	do
	{
		if ( text == "" )
		{
			break;
		}
		
		var first			= text.charAt( 0 );
		var item			= gAlphaMap.GetItem( first );
		var indexEntryIndex	= -1;

		if ( item == null )
		{
			item = 0;
		}
	} while ( false )

	FindIndexEntry(textParts, 0, item, OnCompleteFunc);
}

function FindIndexEntry(textParts, partIndex, indexEntryIndex, OnCompleteFunc)
{
	var newIndexEntryIndex	= -1;
	var lastIndexEntryIndex	= indexEntryIndex;
	var text				= FMCTrim( textParts[partIndex].toLowerCase() );
	
	do
    {
		if ( text == "" )
		{
			break;
		}
		
		var currIndexEntry	= null;
        
        for ( var i = indexEntryIndex; ; i++ )
        {
			if ( i == gIndexEntryCount )
            {
				newIndexEntryIndex = lastIndexEntryIndex;
				break;
            }
            
            if ( !gIndexEntries[i] )
            {
                LoadChunksForLetter(text.charAt(0), function ()
                {
                    FindIndexEntry(textParts, partIndex, indexEntryIndex, OnCompleteFunc);
                });

                return;
            }
            
            currIndexEntry = gIndexEntries[i];
            
            var term	= currIndexEntry.Term.toLowerCase();
            
            if ( currIndexEntry.Level > gIndexEntries[indexEntryIndex].Level )
            {
                continue;
            }
            else if ( currIndexEntry.Level < gIndexEntries[indexEntryIndex].Level )
            {
				newIndexEntryIndex = lastIndexEntryIndex;
                break;
            }
            else if ( term.substring( 0, text.length ) == text )
            {
				newIndexEntryIndex = i;
                break;
            }
            else if ( term > text )
            {
				newIndexEntryIndex = lastIndexEntryIndex;
				
				for ( var subText = text.substring( 0, text.length - 1 ); subText != ""; subText = subText.substring( 0, subText.length - 1 ) )
				{
					if ( term.substring( 0, subText.length ) == subText )
					{
						newIndexEntryIndex = i;
					}
				}
				
                break;
            }
            else
            {
				lastIndexEntryIndex = i;
            }
        }
    } while ( false )
    
    if ( partIndex + 1 < textParts.length )
    {
		var nextIndexEntryIndex	= newIndexEntryIndex + 1;
		
		if ( newIndexEntryIndex != -1 &&
			 nextIndexEntryIndex < gIndexEntryCount &&
			 gIndexEntries[nextIndexEntryIndex] && gIndexEntries[nextIndexEntryIndex].Level > gIndexEntries[newIndexEntryIndex].Level )
		{
		    FindIndexEntry(textParts, partIndex + 1, nextIndexEntryIndex, function (subIndexEntryIndex)
		    {
		        if (subIndexEntryIndex != -1)
		        {
		            newIndexEntryIndex = subIndexEntryIndex;
		        }

		        OnCompleteFunc(newIndexEntryIndex);
		    });

		    return;
		}
    }

    OnCompleteFunc(newIndexEntryIndex);
}

function Index_OnMessage(e)
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

        if (message == "navigation-height-updated")
        {
            var navHeight = dataValues[0];

            document.getElementById("CatapultIndex").parentNode.style.height = navHeight + "px";

            RefreshIndex(function ()
            {
                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            });

            //

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "refresh-index")
        {
            RefreshIndex(function ()
            {
                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            });

            //

            handled = true;
            needsCallbackFired = false;
        }
        else if (message == "get-keyword-links")
        {
            var indexKeywords = dataValues[0];

            Index_Init(function ()
            {
                var keywords = indexKeywords.split(";");

                for (var i = 0; i < keywords.length; i++)
                {
                    keywords[i] = keywords[i].replace("%%%%%", ";");

                    var currKeyword = keywords[i].replace("\\:", "%%%%%");
                    var keywordPath = currKeyword.split(":");
                    var level = keywordPath.length - 1;
                    var indexKey = level + "_" + keywordPath[level].replace("%%%%%", ":");

                    var currLinkMap = gLinkMap.GetItem(indexKey.toLowerCase());

                    // currLinkMap may be blank if keywords[i] isn't found in index XML file (user may have deleted keyword after associating it with a K-Link)

                    if (currLinkMap)
                    {
                        currLinkMap.ForEach(function (key, value)
                        {
                            responseData[responseData.length] = key + "|" + value;

                            return true;
                        });
                    }
                }

                FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
            });

            //

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

if ( gRuntimeFileType == "Index" )
{

var gInit                       = false;
var gIndent						= 16;
var gIndexEntryCount			= 0;
var gIndexEntries				= new Array();
var gIndexDivs                  = new Array();
var gLinkMap                    = new CMCDictionary();
var gXMLDoc						= null;
var gChunks                     = null;
var gAlphaMap                   = new CMCDictionary();
var gSelectedItem               = null;
var gStylesMap                  = new CMCDictionary();
var gKLinkStylesMap             = new CMCDictionary();
var gEntryHeight                = 15;
var gSelectionColor             = null;
var gSelectionBackgroundColor   = "#cccccc";
var gSeeReferencePrefix			= "See";
var gSeeAlsoReferencePrefix		= "See also";

gOnloadFuncs.push( Index_WindowOnload );

gReadyFuncs.push(function ()
{
    document.getElementById("searchField").value = "";
});

if (FMCIsChromeLocal())
{
    window.addEventListener("message", Index_OnMessage, false);
}

var gDivCached	= null;
var gACached	= null;

}
