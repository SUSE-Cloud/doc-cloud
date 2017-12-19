/// <reference path="MadCapUtilities.js" />
/// <reference path="MadCapMerging.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Search_WindowOnload()
{
	if ( FMCIsLiveHelpEnabled() )
	{
		var projectID = FMCGetHelpSystem().LiveHelpOutputId;
	
		gServiceClient.GetSynonymsFile( projectID, null, GetSynonymsFileOnComplete, null );
	}

	//

	if ( MCGlobals.NavigationFrame != null )
	{
		Search_WaitForPaneActive();
	}
	else
	{
		Search_Init( null );
	}
}

function Search_WaitForPaneActive()
{
    function OnGetActivePane(activePane)
    {
        if (activePane == window.name)
        {
            //MCGlobals.NavigationFrame.SetIFrameHeight();

            Search_Init(null);
        }
        else
        {
            window.setTimeout(Search_WaitForPaneActive, WAIT_FOR_PANE_ACTIVE_INTERVAL);
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

function GetSynonymsFileOnComplete( synonymsXmlDoc, onCompleteArgs )
{
	var xmlDoc	= CMCXmlParser.LoadXmlString( synonymsXmlDoc );

    if (xmlDoc != null)
	    gDownloadedSynonymXmlDocRootNode = xmlDoc.documentElement;
}

function Search_FMCAddToFavorites()
{
    FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["favorites"], "add-search-favorite", [document.forms["search"].searchField.value], null, function ()
    {
        var favoritesFrame = parent.frames["favorites"];

        favoritesFrame.Favorites_FMCAddToFavorites("search", document.forms["search"].searchField.value);
        favoritesFrame.FMCLoadSearchFavorites();
    });
}

function Search_Init( OnCompleteFunc )
{
    if ( gInit )
    {
		document.forms["search"].searchField.focus();
		
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
        }
        
        return;
    }

    //

    var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
    var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

    StartLoading(window, document.getElementById("SearchResults"), loadingLabel, loadingAlternateText, null);

    window.setTimeout(Init2, 100);
    
    function Init2()
    {
        function OnGetSearchDBsComplete(searchDBs)
        {
            gSearchDBs = searchDBs;

            gFilters = new CMCFilters();
            gFilters.Load(function ()
            {
                gFilters.CreateFilterCombo();

                document.forms["search"].style.display = "";

                gInit = true;

                document.forms["search"].searchField.focus();

                EndLoading(window, null);

                if (OnCompleteFunc)
                {
                    OnCompleteFunc();
                }
            });
        }

        Search_LoadSkin(function ()
        {
            Search_LoadStyles();

            //

            var inputs = document.getElementsByTagName("input");

            inputs[0].tabIndex = gTabIndex++;
            inputs[1].tabIndex = gTabIndex++;

            //

            if (gFavoritesEnabled)
            {
                var td = document.createElement("td");

                document.getElementById("SearchButton").parentNode.parentNode.appendChild(td);

                MakeButton(td, gAddSearchLabel, gAddSearchIcon, gAddSearchOverIcon, gAddSearchSelectedIcon, gAddSearchIconWidth, gAddSearchIconHeight, null);
                td.getElementsByTagName("button")[0].onclick = Search_FMCAddToFavorites;
                td.getElementsByTagName("button")[0].onkeyup = Search_ItemOnkeyup;
            }

            //

            var masterHS = FMCGetHelpSystem();

            if (!masterHS.IsWebHelpPlus)
            {
                masterHS.GetSearchDBs(OnGetSearchDBsComplete);
            }
            else
            {
                OnGetSearchDBsComplete(null);
            }
        });
	}
}

function Search_LoadSkin(OnCompleteFunc)
{
    CMCXmlParser.GetXmlDoc(MCGlobals.RootFolder + MCGlobals.SkinFolder + "Skin.xml", true, function (xmlDoc)
    {
        var xmlHead = xmlDoc.documentElement;
        var tabsAttribute = xmlHead.getAttribute("Tabs");

        if (tabsAttribute.indexOf("Favorites") == -1)
        {
            gFavoritesEnabled = false;
        }

        OnCompleteFunc();
    });
}

function Search_LoadStyles()
{
    var label = CMCFlareStylesheet.LookupValue("AccordionItem", "Search", "Label", null);

    if (label != null)
    {
        document.title = label;
    }

    var backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "AccordionSearch", "BackgroundColor", null);

    if (backgroundColor != null)
    {
        document.body.style.backgroundColor = backgroundColor;
    }

    //

    var button = document.getElementById("SearchButton");
    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchButton");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            button.value = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);
            button.style[name] = value;
        }
    }

    //

    var searchBox = document.forms["search"].searchField;
    var searchBoxTooltip = CMCFlareStylesheet.LookupValue("Control", "SearchBox", "Tooltip", null);

    if (searchBoxTooltip != null)
    {
        if (searchBoxTooltip.toLowerCase() == "none")
        {
            searchBoxTooltip = "";
        }

        searchBox.title = searchBoxTooltip;
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchFiltersLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gFiltersLabel = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

            gFiltersLabelStyleMap.Add(name, value);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "AddSearchToFavoritesButton");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Tooltip")
        {
            if (value.toLowerCase() == "none")
            {
                value = "";
            }

            gAddSearchLabel = value;
        }
        else if (name == "Icon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var width = CMCFlareStylesheet.GetResourceProperty(value, "Width", null);
            var height = CMCFlareStylesheet.GetResourceProperty(value, "Height", null);

            if (width)
            {
                gAddSearchIconWidth = width;
            }

            if (height)
            {
                gAddSearchIconHeight = height;
            }

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gAddSearchIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "PressedIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gAddSearchSelectedIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "HoverIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gAddSearchOverIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
    }

    //
    
    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchResults");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "TableSummary")
        {
            gTableSummary = value;
        }
        else if (name == "RankLabel")
        {
            gRankLabel = value;
        }
        else if (name == "TitleLabel")
        {
            gTitleLabel = value;
        }
        else if (name == "TopicResultsLabel")
        {
            gTopicResultsLabel = value;
        }
        else if (name == "CommunityResultsLabel")
        {
            gCommunityResultsLabel = value;
        }
        else if (name == "ShowAllCommunityResults")
        {
            gShowAllCommunityResultsLabel = value;
        }
    }

    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchUnfilteredLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gUnfilteredLabel = value;
        }
    }

    //

    gNoTopicsFoundLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "NoTopicsFound", gNoTopicsFoundLabel);
    gInvalidTokenLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "InvalidToken", gInvalidTokenLabel);
}

function ApplySearchFilter(OnCompleteFunc)
{
	var masterHS = FMCGetHelpSystem();
    
    if ( !masterHS.IsWebHelpPlus )
    {
		var searchFilter	= document.getElementById( "SearchFilter" );
		var filterName		= searchFilter ? searchFilter.options[searchFilter.selectedIndex].text : gUnfilteredLabel;
	    
		gFilteredSet = gFilters.ApplyFilter( filterName );
		
		if ( gFilteredSet == null )
		{
		    if (OnCompleteFunc != null)
		    {
		        OnCompleteFunc();
		    }

			return;
		}
		
		gFilteredSet.SetRankPositions();
		Sort(EMCSortColumn.RankPosition, false);

		if (gFullSet)
		{
		    GenerateResultsTable(gFilteredSet, false, OnCompleteFunc);
		}
	}
}

function StartSearch( firstPick, OnSearchFinishedFunc, CallbackFuncArgs )
{
	var searchString	= document.forms["search"].searchField.value;
	
	if ( !searchString || FMCTrim( searchString ) == "" )
	{
		return;
	}

    var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
    var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

    StartLoading(window, document.getElementById("SearchResults"), loadingLabel, loadingAlternateText, null);
	
	//
	
	gOnSearchFinishedFunc = OnSearchFinishedFunc;
	gCallbackFuncArgs = CallbackFuncArgs;

	FMCRegisterCallback( "Search", MCEventType.OnInit, StartSearch2, firstPick );
}

function StartSearch2(firstPick) 
{
    function OnSearchComplete()
    {
        if (firstPick)
        {
            var firstResult = document.getElementById("searchResultsTable").firstChild.childNodes[1];

            if (firstResult.onclick)
            {
                firstResult.onclick();
            }
        }

        var masterHS = FMCGetHelpSystem();

        if (masterHS.LiveHelpEnabled && masterHS.DisplayCommunitySearchResults) {
            var searchString = document.forms["search"].searchField.value;

            DoCommunitySearch(searchString, function () {
                EndLoading(window, null);
            });
        }
        else {
            EndLoading(window, null);
        }
    } 
    
    var searchString = document.forms["search"].searchField.value;
    var masterHS = FMCGetHelpSystem();

	if ( !masterHS.IsWebHelpPlus )
	{
	    DoSearch(searchString, OnSearchComplete);
	}
	else
	{
		var searchFilter	= document.getElementById( "SearchFilter" );
		var filterName		= null;
		
		if ( searchFilter != null )
		{
			filterName = searchFilter.options[searchFilter.selectedIndex].text;
			
			if ( filterName == gUnfilteredLabel )
			{
				filterName = null;
			}
		}
		
		DoSearchWebHelpPlus( searchString, filterName, OnSearchComplete );
	}
}

//
//    Class CMCSearchResult
//

function CMCSearchResult( rank, rankPosition, title, link )
{
	// Public properties

	this.Rank			= rank;
	this.RankPosition	= rankPosition;
	this.Title			= title;
	this.Link			= link;
}

//
//    End class CMCSearchResult
//

//
//    Class CMCSearchResultSet
//

function CMCSearchResultSet()
{
	// Public properties

	this.mResults	= new Array();
	this.SortColumn	= null;
	this.Sortorder	= null;
}

CMCSearchResultSet.prototype.Add	= function( searchResult )
{
	this.mResults.push( searchResult );
};

CMCSearchResultSet.prototype.GetResult	= function( index )
{
	return this.mResults[index];
};

CMCSearchResultSet.prototype.GetLength	= function()
{
	return this.mResults.length;
};

CMCSearchResultSet.prototype.Sort	= function( sortColumn )
{
	if ( this.SortColumn == sortColumn )
	{
		if ( this.SortOrder == EMCSortOrder.Ascending )
		{
			this.SortOrder = EMCSortOrder.Descending;
		}
		else if ( this.SortOrder == EMCSortOrder.Descending )
		{
			this.SortOrder = EMCSortOrder.Ascending;
		}
	}
	else
	{
		if ( sortColumn == EMCSortColumn.Rank )
		{
			this.SortOrder = EMCSortOrder.Ascending;
		}
		else if ( sortColumn == EMCSortColumn.RankPosition )
		{
			this.SortOrder = EMCSortOrder.Descending;
		}
		else if ( sortColumn == EMCSortColumn.Title )
		{
			this.SortOrder = EMCSortOrder.Descending;
		}
	}
	
    this.SortColumn = sortColumn;

    this.mResults.sort( this.CompareResults );
};

CMCSearchResultSet.prototype.CompareResults	= function( a, b )
{
	var value1	= null;
	var value2	= null;
	var ret		= 0;
	
	if ( gSearchResultSet.SortColumn == EMCSortColumn.Rank )
	{
		value1 = a.Rank;
		value2 = b.Rank;
		
		ret = value1 - value2;
	}
	else if ( gSearchResultSet.SortColumn == EMCSortColumn.RankPosition )
	{
		value1 = a.RankPosition;
		value2 = b.RankPosition;
		
		ret = value1 - value2;
	}
	else if ( gSearchResultSet.SortColumn == EMCSortColumn.Title )
	{
		value1 = a.Title;
		value2 = b.Title;
		
		if ( value1 < value2 )
        {
            ret = -1;
        }
        else if ( value1 == value2 )
        {
            ret = 0;
        }
        else if ( value1 > value2 )
        {
            ret = 1;
        }
	}
	
	if ( gSearchResultSet.SortOrder == EMCSortOrder.Ascending )
	{
		ret *= -1;
	}
	
	return ret;
};

//
//    End class CMCSearchResultSet
//

//
//    Enumeration EMCSortColumn
//

var EMCSortColumn	= new function()
{
}

EMCSortColumn.Rank			= 0;
EMCSortColumn.RankPosition	= 1;
EMCSortColumn.Title			= 2;

//
//    End enumeration EMCSortColumn
//

//
//    Enumeration EMCSortOrder
//

var EMCSortOrder	= new function()
{
}

EMCSortOrder.Ascending	= 0;
EMCSortOrder.Descending = 1;

//
//    End enumeration EMCSortOrder
//

function DoSearchWebHelpPlus( searchString, filterName, OnCompleteFunc )
{
	function OnGetSearchResultsComplete( xmlDoc, args )
	{
		gSearchResultSet = new CMCSearchResultSet();
		
		var results			= xmlDoc.getElementsByTagName( "Result" );
		var resultsLength	= results.length;
		
		for ( var i = 0; i < resultsLength; i++ )
        {
			var resultNode		= results[i];
			var rank			= FMCGetAttributeInt( resultNode, "Rank", -1 );
			var rankPosition	= i + 1;
			var title			= resultNode.getAttribute( "Title" );
			var link			= resultNode.getAttribute( "Link" );
			
			if ( String.IsNullOrEmpty( title ) )
			{
				title = resultNode.getAttribute( "Filename" );
			}
			
			var searchResult	= new CMCSearchResult( rank, rankPosition, title, link );
			
			gSearchResultSet.Add( searchResult );
        }

		//
		
		gSearchResultSet.SortColumn = EMCSortColumn.RankPosition;
		gSearchResultSet.SortOrder = EMCSortOrder.Descending;

		GenerateResultsTable(gSearchResultSet, true, function ()
		{
		    OnCompleteFunc();
		
		    if ( gOnSearchFinishedFunc )
		    {
			    var numResults	= 0;
			
			    if ( gFullSet )
			    {
				    numResults = gFullSet.GetLength();
			    }
			
			    gOnSearchFinishedFunc( numResults, gCallbackFuncArgs );
			    gOnSearchFinishedFunc = null;
			    gCallbackFuncArgs = null;
		    }
		
		    //
		
		    var projectID	= FMCGetHelpSystem().LiveHelpOutputId;
            var userGuid	= null;
            var language	= null;

		    if ( FMCIsLiveHelpEnabled() )
		    {
			    gServiceClient.LogSearch( projectID, userGuid, resultsLength, language, searchString );
		    }
        });
	}

	var xmlDoc		= CMCXmlParser.CallWebService( MCGlobals.RootFolder + "Service/Service.asmx/GetSearchResults?SearchString=" + searchString + "&FilterName=" + filterName, true, OnGetSearchResultsComplete, null );
	var searchTerms	= searchString.split( " " );
	var firstStem	= true;

	gHighlight = "?Highlight=";

	for ( var i = 0; i < searchTerms.length; i++ )
	{
		if ( !firstStem )
		{
			gHighlight += "||";
		}
		else
		{
			firstStem = false;
		}
		
		gHighlight += searchTerms[i];
	}
}

function DoSearch(searchString, OnCompleteFunc)
{
    gParser		= new CMCParser( searchString );
    var root	= null;
    
    try
    {
        root = gParser.ParseExpression();
    }
    catch ( err ) {

        if (err == gInvalidTokenLabel)
            alert("Ensure that the search string is properly formatted.");
        else
            alert(err);
        
        OnCompleteFunc();
    }
    
    if ( !root )
    {
        return;
    }

    if (gDownloadedSynonymXmlDocRootNode != null && gSearchDBs[0].DownloadedSynonymFile == null)
    {
        gSearchDBs[0].DownloadedSynonymFile = new CMCSynonymFile(gDownloadedSynonymXmlDocRootNode);
    }

    root.Evaluate(false, false, function (resultSet)
    {
        gFullSet = resultSet;

        //

        if (gOnSearchFinishedFunc)
        {
            var numResults = 0;

            if (gFullSet)
            {
                numResults = gFullSet.GetLength();
            }

            gOnSearchFinishedFunc(numResults, gCallbackFuncArgs);
            gOnSearchFinishedFunc = null;
            gCallbackFuncArgs = null;
        }

        //

        if (gFullSet)
        {
            gMergedSet = gFullSet.ToMerged();
            ApplySearchFilter(function ()
            {
                var projectID = FMCGetHelpSystem().LiveHelpOutputId;
                var userGuid = null;
                var language = null;

                if (FMCIsLiveHelpEnabled())
                {
                    gServiceClient.LogSearch(projectID, userGuid, gMergedSet.GetLength(), language, searchString);
                }

                OnCompleteFunc();
            });
        }
    });
}

function DoCommunitySearch(searchString, OnCompleteFunc) {
    gServiceClient.GetPulseSearchResults(FMCGetHelpSystem().LiveHelpOutputId, searchString, FMCGetHelpSystem().CommunitySearchResultsCount, 0, function (searchResults) {
        GenerateCommunityResultsTable(searchString, searchResults, OnCompleteFunc);
    });
}

function Sort( col, change )
{
    if ( !gFilteredSet )
    {
        return;
    }
    
    var sortCol     = gFilteredSet.SortColumn;
    var sortOrder   = gFilteredSet.SortOrder;
    
    if ( !sortCol )
    {
        if ( col )
        {
            sortCol = col;
        }
        else
        {
        	sortCol = EMCSortColumn.RankPosition;
        }
        
        sortOrder = 1;
    }
    else if ( sortCol == col )
    {
        sortOrder *= (change ? -1 : 1);
    }
    else
    {
        sortCol = col;
        sortOrder = 1;
    }
    
    gFilteredSet.Sort( sortCol, sortOrder );
}

function GenerateResultsTable(searchResultSet, isWebHelpPlus, OnCompleteFunc)
{
    function OnSetIFrameHeightComplete()
    {
        var trResult = document.createElement("tr");
        var tdRank = document.createElement("td");
        var tdTitle = document.createElement("td");
        //var tdRanking	= document.createElement( "td" );	// Debug

        trResult.style.cursor = (navigator.appVersion.indexOf("MSIE 5.5") == -1) ? "pointer" : "hand";

        trResult.style.fontFamily = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "FontFamily", "Arial");
        trResult.style.fontSize = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "FontSize", "12px");
        trResult.style.fontWeight = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "FontWeight", "normal");
        trResult.style.fontStyle = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "FontStyle", "normal");
        trResult.style.color = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "Color", "#000000");
        trResult.style.backgroundColor = CMCFlareStylesheet.LookupValue("Control", "SearchResults", "BackgroundColor", "Transparent");

        tdRank.style.width = "60px";
        tdTitle.style.width = "auto";

        tdRank.appendChild(document.createTextNode("(" + gNoTopicsFoundLabel + ")"));
        tdTitle.appendChild(document.createTextNode(" "));
        //tdRanking.appendChild( document.createTextNode( " " ) );	// Debug
        trResult.appendChild(tdRank);
        trResult.appendChild(tdTitle);
        //trResult.appendChild( tdRanking );	// Debug

        //

        var resultsLength = searchResultSet.GetLength();

        if (resultsLength == 0)
        {
            var trCurr = trResult.cloneNode(true);

            tbody.appendChild(trCurr);

            if (OnCompleteFunc != null)
            {
                OnCompleteFunc();
            }

            return;
        }

        gTabIndex = 1002; // Set to 1000 (plus 2 for header controls) to allow for community results

        for (var i = 0; i < resultsLength; i++)
        {
            var trCurr = trResult.cloneNode(true);
            var result = searchResultSet.GetResult(i);
            var rank = result.RankPosition;
            var title = null;
            var link = null;

            if (!isWebHelpPlus)
            {
                var searchDBID = result.SearchDB;
                var entry = result.Entry;
                var topicID = entry.TopicID;
                var searchDB = gSearchDBs[searchDBID];
                var title = searchDB.URLTitles[topicID] ? searchDB.URLTitles[topicID] : "";
                var path = searchDB.HelpSystem.GetPath();
                var file = searchDB.URLSources[topicID];

                if (!file.StartsWith("/subsystems/", false))
                    path += "Data/";

                link = path + file;
            }
            else
            {
                title = result.Title;
                link = result.Link;
            }

            //var ranking = result.Ranking;	// Debug

            trCurr.onmouseover = ResultTROnmouseover;
            trCurr.onmouseout = ResultTROnmouseout;
            trCurr.onclick = ResultTROnclick;
            trCurr.onfocus = trCurr.onmouseover;
            trCurr.onblur = trCurr.onmouseout;
            trCurr.onkeyup = Search_ItemOnkeyup;

            trCurr.setAttribute("MadCap:href", link);
            trCurr.firstChild.firstChild.nodeValue = rank;
            trCurr.childNodes[1].firstChild.nodeValue = title;
            trCurr.childNodes[1].setAttribute("title", title);
            //trCurr.lastChild.firstChild.nodeValue = ranking;	// Debug

            trCurr.tabIndex = gTabIndex++;

            tbody.appendChild(trCurr);
        }

        if (!isWebHelpPlus)
        {
            gHighlight = "?SearchType=" + gSearchDBs[0].SearchType + "&Highlight=";

            gParser.GetStemMap(function (stemMap)
            {
                var firstStem = true;

                stemMap.ForEach(function (key, value)
                {
                    if (!firstStem)
                    {
                        gHighlight += "||";
                    }
                    else
                    {
                        firstStem = false;
                    }

                    var firstPhrase = true;

                    value.ForEach(function (key2, value2)
                    {
                        if (!firstPhrase)
                        {
                            gHighlight += "|";
                        }
                        else
                        {
                            firstPhrase = false;
                        }

                        // This was removed in favor of using the actual search term "key"
                        // it'll provide better support for partial word highlighting
                        //gHighlight += (key2);
                        gHighlight += (key);
                        return true;
                    });

                    return true;
                });

                if (OnCompleteFunc != null)
                {
                    OnCompleteFunc();
                }
            });
        }
        else
        {
            OnCompleteFunc();
        }
    }

    gTabIndex = 1000;

	var table = document.getElementById("searchResultsTable");
	var tbody = null;
	var trHeader = null;
	var thRankCol = null;
	var thTitleCol = null;
	var img = null;
	var imgTarget = null;

	if (table)
	{
		var trEls = table.getElementsByTagName("tr");

		for (var i = trEls.length - 1; i >= 0; i--)
		{
			var trEl = trEls[i];

			if (trEl.id != "searchResultsHeadingRow")
			{
				trEl.parentNode.removeChild(trEl);
			}
		}

		tbody = table.getElementsByTagName("tbody")[0];
		trHeader = document.getElementById("searchResultsHeadingRow");
		thRankCol = document.getElementById("searchResultsRankColumn");
		thTitleCol = document.getElementById("searchResultsTitleColumn");
		img = trHeader.getElementsByTagName("img")[0];

		img.parentNode.removeChild(img);
	}
	else
	{
		// Generate results table

		table = document.createElement("table");
		table.id = "searchResultsTable";
		table.setAttribute("summary", gTableSummary);
		table.style.width = FMCGetClientWidth(window, false) - 25 + "px";
		
		tbody = document.createElement("tbody");
		trHeader = document.createElement("tr")
		thRankCol = document.createElement("th");
		thTitleCol = document.createElement("th");
		img = document.createElement("img");

		trHeader.id = "searchResultsHeadingRow";
		thRankCol.id = "searchResultsRankColumn";
		thTitleCol.id = "searchResultsTitleColumn";
		thRankCol.className = "columnHeading";
		thTitleCol.className = "columnHeading";
		thRankCol.style.width = "60px";
		thTitleCol.style.width = "auto";
		thRankCol.tabIndex = gTabIndex++;
		thTitleCol.tabIndex = gTabIndex++;
		thRankCol.appendChild(document.createTextNode(gRankLabel));
		thTitleCol.appendChild(document.createTextNode(gTitleLabel));

		img.style.width = "12px";
		img.style.height = "7px";
		img.style.paddingLeft = "10px";

		thRankCol.onclick = THRankColOnclick;
		thTitleCol.onclick = THTitleColOnclick;
		thRankCol.onkeyup = THRankColOnkeyup;
		thTitleCol.onkeyup = THTitleColOnkeyup;
		thRankCol.onmouseover = ColOnmouseover;
		thTitleCol.onmouseover = ColOnmouseover;
		thRankCol.onmouseout = ColOnmouseout;
		thTitleCol.onmouseout = ColOnmouseout;
		thRankCol.onmousedown = ColOnmousedown;
		thTitleCol.onmousedown = ColOnmousedown;

		trHeader.appendChild(thRankCol);
		trHeader.appendChild(thTitleCol);
		tbody.appendChild(trHeader);
		table.appendChild(tbody);
		document.getElementById("SearchResults").appendChild(table);
	}

	if (searchResultSet.SortColumn == EMCSortColumn.RankPosition) 
    {
	    imgTarget = thRankCol;
	}
	else if (searchResultSet.SortColumn == EMCSortColumn.Title) 
    {
	    imgTarget = thTitleCol;
	}

	img.src = (searchResultSet.SortOrder == EMCSortOrder.Descending) ? "Images/ArrowUp.gif" : "Images/ArrowDown.gif";
	img.alt = (searchResultSet.SortOrder == EMCSortOrder.Descending) ? "Descending" : "Ascending";

	imgTarget.appendChild(img);
    
    //

	FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-nav-pane-height", null, OnSetIFrameHeightComplete, function ()
	{
	    parent.SetIFrameHeight();

	    OnSetIFrameHeightComplete();
	});
}

function THRankColOnclick()
{
	ColOnclick(EMCSortColumn.RankPosition);
}

function THTitleColOnclick()
{
	ColOnclick(EMCSortColumn.Title);
}

function THRankColOnkeyup(e)
{
    e = e || window.event;

    if (e.keyCode == 13)
    {
        this.onclick();
    }
}

function THTitleColOnkeyup(e)
{
    e = e || window.event;

    if (e.keyCode == 13)
    {
        this.onclick();
    }
}

function ColOnclick( colName )
{
	var masterHS = FMCGetHelpSystem();
	
	if ( !masterHS.IsWebHelpPlus )
	{
		Sort(colName, true);

		if (gFullSet)
		{
		    GenerateResultsTable(gFilteredSet, false, function ()
		    {
		    });
		}
	}
	else
	{
		gSearchResultSet.Sort(colName);
		GenerateResultsTable(gSearchResultSet, true, function ()
		{
		});
	}
}

function ColOnmouseover()
{
	this.style.backgroundImage = FMCCreateCssUrl( "Images/SearchGradient_over.jpg" );
}

function ColOnmouseout()
{
	this.style.backgroundImage = FMCCreateCssUrl( "Images/SearchGradient.jpg" );
}

function ColOnmousedown()
{
	this.style.backgroundImage = FMCCreateCssUrl( "Images/SearchGradient_selected.jpg" );
}

function ResultTROnmouseover()
{
	this.setAttribute( "MadCap:altBackgroundColor", this.style.backgroundColor );

	this.style.backgroundColor = "#dddddd";
}

function ResultTROnmouseout()
{
	var bgColor	= FMCGetAttribute( this, "MadCap:altBackgroundColor", "Transparent" );

	this.style.backgroundColor = bgColor;
}

function ResultTROnclick()
{
	parent.parent.frames["body"].location.href = FMCGetMCAttribute( this, "MadCap:href" ) + gHighlight;
}

function Search_ItemOnkeyup( e )
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

function CommunityResultOnclick(e) {
    var url = new CMCUrl(e.target.href);

    if (url.Fragment.indexOf('#pulse-') == 0) {
        var relUrl = url.Fragment.substring("#pulse-".length);
        var fullUrl = gHelpSystem.LiveHelpServer + relUrl;

        FMCPostMessageRequest(parent.parent, "navigate-body", [fullUrl], null, null, true);
    }
    else {
        var relUrl = url.Fragment.substring("#".length);

        FMCPostMessageRequest(parent.parent, "navigate-body-relative", [relUrl], null, null, true);
    }
}

function CommunityShowAllOnclick(e) {
    var url = new CMCUrl(e.target.href);

    if (url.Fragment.indexOf('#communitysearch-') == 0) {
        var searchString = url.Fragment.substring("#communitysearch-".length);

        gServiceClient.GetPulseSearchResults(FMCGetHelpSystem().LiveHelpOutputId, searchString, -1, 0, function (searchResults) {
            GenerateCommunityResultsTable(searchString, searchResults);
        });
    }
}

function GenerateCommunityResultsTable(searchQuery, communityResults, OnCompleteFunc) {
    function OnSetIFrameHeightComplete() {
        if (communityResults != null && communityResults.Activities.length > 0) {
            gTabIndex = 6;
            
            var communityDiv = document.createElement("div");
            communityDiv.setAttribute("id", "community-results");

            var h3 = document.createElement("h3");
            h3.setAttribute("class", "title");
            h3.appendChild(document.createTextNode(gCommunityResultsLabel));

            var communitySearchInfo = document.createElement("span");
            communitySearchInfo.appendChild(document.createTextNode(" (" + communityResults.TotalRecords + ")"));
            h3.appendChild(communitySearchInfo);

            var communityUl = document.createElement("ul");
            communityUl.setAttribute("id", "communityResultList");

            communityDiv.appendChild(h3);
            communityDiv.appendChild(communityUl);

            var now = new Date();
            var utcNow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());

            for (var i = 0; i < communityResults.Activities.length; i++) {
                var communityResult = communityResults.Activities[i];

                var communityLi = document.createElement("li");
                communityUl.appendChild(communityLi);

                var communityLink = document.createElement("a");
                communityLink.setAttribute("class", "activityText");
                communityLink.setAttribute("href", "#pulse-#!streams/" + communityResult.FeedId + "/activities/" + communityResult.Id);
                communityLink.onclick = CommunityResultOnclick;
                communityLink.tabIndex = gTabIndex++;
                communityLink.appendChild(document.createTextNode(communityResult.Text));

                var communityLinkInfo = document.createElement("div");
                communityLinkInfo.setAttribute("class", "activityInfo");

                var createdByA = document.createElement("a");
                createdByA.setAttribute("class", "activityCreator");
                createdByA.setAttribute("href", "#pulse-#!streams/" + communityResult.CreatedBy + "/activities");
                createdByA.onclick = CommunityResultOnclick;
                createdByA.tabIndex = gTabIndex++;
                createdByA.appendChild(document.createTextNode(communityResult.CreatedByDisplayName));

                var toSpan = document.createElement("span");
                toSpan.appendChild(document.createTextNode(" to "));

                var feedUrl = communityResult.FeedUrl != null ? "#" + communityResult.FeedUrl : "#pulse-#!streams/" + communityResult.FeedId + "/activities";

                var pageA = document.createElement("a");
                pageA.setAttribute("class", "activityFeed");
                pageA.setAttribute("href", feedUrl);
                pageA.onclick = CommunityResultOnclick;
                pageA.tabIndex = gTabIndex++;
                pageA.appendChild(document.createTextNode(communityResult.FeedName));

                var postedOn = CMCDateTimeHelpers.GetDateFromJsonString(communityResult.PostedUtc);

                var postedOnSpan = document.createElement("span");
                postedOnSpan.setAttribute("class", "activityTime");
                postedOnSpan.appendChild(document.createTextNode(CMCDateTimeHelpers.ToDurationString(postedOn, utcNow)));

                communityLinkInfo.appendChild(createdByA);
                communityLinkInfo.appendChild(toSpan);
                communityLinkInfo.appendChild(pageA);
                communityLinkInfo.appendChild(postedOnSpan);

                communityLi.appendChild(communityLink);
                communityLi.appendChild(communityLinkInfo);
            }

            if (communityResults.Activities.length < communityResults.TotalRecords) {
                var showAllCommunityResultsLi = document.createElement("li");

                var showAllCommunityResultsLink = document.createElement("a");
                showAllCommunityResultsLink.setAttribute("href", "#communitysearch-" + searchQuery);
                showAllCommunityResultsLink.onclick = CommunityShowAllOnclick;
                showAllCommunityResultsLink.appendChild(document.createTextNode(gShowAllCommunityResultsLabel));

                showAllCommunityResultsLi.appendChild(showAllCommunityResultsLink);

                communityUl.appendChild(showAllCommunityResultsLi);
            }

            var topicResultsTitle = document.createElement("h3");
            topicResultsTitle.setAttribute("id", "topicResultsTitle");
            topicResultsTitle.setAttribute("class", "title");

            topicResultsTitle.appendChild(document.createTextNode(gTopicResultsLabel));

            var searchResultsEl = document.getElementById("SearchResults");

            searchResultsEl.insertBefore(topicResultsTitle, searchResultsEl.firstChild);
            searchResultsEl.insertBefore(communityDiv, searchResultsEl.firstChild);
        }
            
        OnCompleteFunc();
    }

    var communityResultsEl = document.getElementById("community-results");
    if (communityResultsEl != null)
        communityResultsEl.parentNode.removeChild(communityResultsEl);

    var topicResultsTitle = document.getElementById("topicResultsTitle");
    if (topicResultsTitle != null)
        topicResultsTitle.parentNode.removeChild(topicResultsTitle);

    //

    FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-nav-pane-height", null, OnSetIFrameHeightComplete, function () {
        parent.SetIFrameHeight();

        OnSetIFrameHeightComplete();
    });
}

//
//    Class CMCFilters
//

function CMCFilters()
{
    // Private member variables
    
    var mFilterMap  = new CMCDictionary();
    var mConceptMap = new CMCDictionary();

    // Public member functions

    this.Load = function (OnCompleteFunc)
    {
        var masterHS = FMCGetHelpSystem();

        if (masterHS.SearchFilterSetUrl == null)
        {
            OnCompleteFunc();
            return;
        }

        CMCXmlParser.GetXmlDoc(masterHS.SearchFilterSetUrl, true, function (xmlDoc)
        {
            if (xmlDoc)
            {
                LoadFilters(xmlDoc);

                CMCXmlParser.GetXmlDoc(MCGlobals.RootFolder + "Data/Concepts.xml", true, function (xmlDoc)
                {
                    LoadConcepts(xmlDoc);

                    OnCompleteFunc();
                }, null);
            }
        }, null);
    };
    
    this.ApplyFilter            = function( filterName )
    {
        if ( !gFullSet )
        {
            return null;
        }
        
        var filteredSet = new CMCQueryResultSet();
        
        if ( filterName == gUnfilteredLabel )
        {
            for ( var i = 0; i < gMergedSet.GetLength(); i++ )
            {
                filteredSet.Add( gMergedSet.GetResult( i ), false, false, false );
            }
        }
        else
        {
            var concepts    = mFilterMap.GetItem( filterName );
            
            for ( var i = 0; i < gMergedSet.GetLength(); i++ )
            {
                var result      = gMergedSet.GetResult( i );
                var searchDB    = result.SearchDB;
                var topicID     = parseInt( result.Entry.TopicID );
                var topicPath   = gSearchDBs[searchDB].URLSources[topicID];
                var topicFile   = topicPath.substring( "..".length, topicPath.length );
                
                concepts.ForEach( function( key, value )
                {
                    var conceptLinkMap  = mConceptMap.GetItem( key );
                    
                    if ( conceptLinkMap && conceptLinkMap.GetItem( topicFile ) )
                    {
                        filteredSet.Add( result, false, false, false );
                        
                        return false;
                    }
                    
                    return true;
                } );
            }
        }
        
        return filteredSet;
    };
    
    this.CreateFilterCombo    = function()
    {
		var filterNames	= new Array();
		var filterCount	= 0;
		
		mFilterMap.ForEach( function( key, value )
		{
			filterNames[filterCount++] = key;
			
			return true;
		} );
        
        if ( filterCount == 0 )
		{
			return;
		}
        
        FMCSortStringArray( filterNames );
        
        //
        
        var tbody	= document.getElementById( "SearchFormTable" ).getElementsByTagName( "tbody" )[0];
        var tr		= document.createElement( "tr" );
        var td		= document.createElement( "td" );
        var select	= document.createElement( "select" );
        
        td.id = "SearchFilterCell";
        td.colSpan = 3;
        
        gFiltersLabelStyleMap.ForEach( function( key, value )
		{
			td.style[key] = value;
			
			return true;
		} );

        td.appendChild( document.createTextNode( gFiltersLabel ) );
        
        select.id = "SearchFilter";
        select.onchange = function () { ApplySearchFilter(null); };
        
        var option	= document.createElement( "option" );

		option.appendChild( document.createTextNode( gUnfilteredLabel ) );
		select.appendChild( option );
        
        for ( var i = 0; i < filterCount; i++ )
        {
            option = document.createElement( "option" );
            option.appendChild( document.createTextNode( filterNames[i] ) );
            select.appendChild( option );
        }

		select.tabIndex = gTabIndex++;
		
		td.appendChild( select );
        tr.appendChild( td );
        tbody.appendChild( tr );
    };
    
    // Private member functions
    
    function LoadFilters(xmlDoc)
    {
        var filters = xmlDoc.getElementsByTagName("SearchFilter");
        
        for ( var i = 0; i < filters.length; i++ )
        {
            var filter      = filters[i];
            var name        = filter.getAttribute( "Name" );
            
            if ( !filter.getAttribute( "Concepts" ) )
            {
                continue;
            }
            
            var concepts    = filter.getAttribute( "Concepts" ).split( ";" );
            
            mFilterMap.Add( name, new CMCDictionary() );
            
            for ( var j = 0; j < concepts.length; j++ )
            {
                var concept = FMCTrim( concepts[j] );
                
                mFilterMap.GetItem( name ).Add( concept, true );
            }
        }
    }

    function LoadConcepts(xmlDoc)
    {
        var concepts = xmlDoc.getElementsByTagName("ConceptEntry");
        
        for ( var i = 0; i < concepts.length; i++ )
        {
            var concept = concepts[i];
            var term    = concept.getAttribute( "Term" );
            var topics  = concept.getElementsByTagName( "ConceptLink" );
            var linkMap = new CMCDictionary();
            
            mConceptMap.Add( term, linkMap );
            
            for ( var j = 0; j < topics.length; j++ )
            {
                var topic       = topics[j];
                var link        = topic.getAttribute( "Link" );
                var linkPlain   = link.substring( 0, link.lastIndexOf( "#" ) );
                
                linkMap.Add( linkPlain, true );
            }
        }
    }
}

//
//    End class CMCFilters
//

//
//    Class CMCSynonymFile
//

function CMCSynonymFile(rootNode)
{
	// Public properties

	this.WordToStem				= new CMCDictionary();
	this.Directionals			= new CMCDictionary();
	this.DirectionalStems		= new CMCDictionary();
	this.DirectionalStemSources	= new CMCDictionary();
	this.Groups					= new CMCDictionary();
	this.GroupStems				= new CMCDictionary();
	this.GroupStemSources		= new CMCDictionary();

	this.LoadSynonymFile(rootNode);
}

CMCSynonymFile.prototype.LoadSynonymFile = function (rootNode)
{
    var groups = FMCGetChildNodeByTagName(rootNode, "Groups", 0);
    var syns = FMCGetChildNodeByTagName(rootNode, "Directional", 0);
	
	if ( syns != null )
	{
		var childNodesLength	= syns.childNodes.length;
		
		for ( var i = 0; i < childNodesLength; i++ )
		{
			var child	= syns.childNodes[i];
			
			if ( child.nodeName == "DirectionalSynonym" )
			{
				var from		= FMCGetAttribute( child, "From" );
				var to			= FMCGetAttribute( child, "To" );
				var stem		= FMCGetAttributeBool( child, "Stem", false );
				var fromStem	= FMCGetAttribute( child, "FromStem" );
				var toStem		= FMCGetAttribute( child, "ToStem" );
				
				if ( stem )
				{
					if ( fromStem == null )
					{
						fromStem = stemWord( from );
					}
				}

				if ( toStem == null )
				{
					toStem = stemWord( to );
				}

				if ( from != null && to != null )
				{
					if ( stem )
					{
						this.DirectionalStemSources.Add( from, toStem );
						this.DirectionalStems.Add( fromStem, toStem );

						this.WordToStem.Add( from, fromStem );
						this.WordToStem.Add( to, toStem );
					}
					else
					{
						this.Directionals.Add( from, toStem );

						this.WordToStem.Add( to, toStem );
					}
				}
			}
		}
	}

	if ( groups != null )
	{
		var childNodesLength	= groups.childNodes.length;

		for ( var i = 0; i < childNodesLength; i++ )
		{
			var child	= groups.childNodes[i];

			if ( child.nodeName == "SynonymGroup" )
			{
				var words			= new Array();
				var stemmedWords	= new Array();
				var stem			= FMCGetAttributeBool( child, "Stem", false );

				var synGroupChildNodesLength	= child.childNodes.length;
				
				for ( var j = 0; j < synGroupChildNodesLength; j++ )
				{
					var wordNode	= child.childNodes[j];
					
					if ( wordNode.nodeType != 1 )
					{
						continue;
					}
					
					words.push( wordNode.firstChild.nodeValue );
				}

				for ( var j = 0; j < synGroupChildNodesLength; j++ )
				{
					var wordNode	= child.childNodes[j];
					
					if ( wordNode.nodeType != 1 )
					{
						continue;
					}
					
					var stemmed		= FMCGetAttribute( wordNode, "Stem" );

					if ( stemmed == null )
					{
						stemmed = stemWord( wordNode.firstChild.nodeValue );
					}

					this.WordToStem.Add( wordNode.firstChild.nodeValue, stemmed );
	                
					stemmedWords.push( stemmed );
				}
	            

				//

				var wordsLength	= words.length;
				
				for ( var j = 0; j < wordsLength; j++ )
				{
					var word		= words[j];
					var stemmedWord	= stemmedWords[j];
					
					for ( var k = 0; k < wordsLength; k++ )
					{
						var word1	= words[k];
						
						if ( stem )
						{
							var group	= this.GroupStemSources.GetItem( word );
							
							if ( group == null )
							{
								group = new CMCDictionary();
								this.GroupStemSources.Add( word, group );
							}

							group.Add( word1, stemmedWord );
						}
						else
						{
							var group	= this.GroupStemSources.GetItem( word );
							
							if ( group == null )
							{
								group = new CMCDictionary();
								this.Groups.Add( word, group );
							}

							group.Add( word1, stemmedWord );
						}
					}
				}

				//
				
				var stemmedWordsLength	= stemmedWords.length;
				
				for ( var j = 0; j < stemmedWordsLength; j++ )
				{
					var stemmedWord	= stemmedWords[j];
					
					for ( var k = 0; k < stemmedWordsLength; k++ )
					{
						var stemmedWord1	= stemmedWords[k];
						var group			= this.GroupStems.GetItem( stemmedWord );

						if ( group == null )
						{
							group = new CMCDictionary();
							this.GroupStems.Add( stemmedWord, group );
						}

						group.Add( stemmedWord1, stemmedWord );
					}
				}
			}
		}
	}
}

CMCSynonymFile.prototype.AddSynonymStems	= function( term, termStem, stems )
{
	var synonym	= this.Directionals.GetItem( term );

	if ( synonym != null )
	{
		stems.AddUnique( synonym );
	}

	//

	synonym = this.DirectionalStems.GetItem( termStem );

	if ( synonym != null )
	{
		stems.AddUnique( synonym );
	}

	var group	= this.Groups.GetItem( term );

	if ( group != null )
	{
		group.ForEach( function( key, value )
		{
			stems.AddUnique( key );
			
			return true;
		} );
	}

	//

	group = this.GroupStems.GetItem( termStem );

	if ( group != null )
	{
		group.ForEach( function( key, value )
		{
			stems.AddUnique( key );
			
			return true;
		} );
	}
}

//
//    End class CMCSynonymFile
//

//
//    Class CMCSearchDB
//

function CMCSearchDB(helpSystem)
{
	// Public properties

	this.URLSources				= new Array();
	this.URLTitles				= new Array();
	this.SearchDB				= new CMCDictionary();
	this.HelpSystem				= helpSystem;
	this.SearchType				= null;
	this.NGramSize				= 0;
	this.SynonymFile			= null;
	this.DownloadedSynonymFile	= null;
}

CMCSearchDB.prototype.Load = function (dbFile, OnCompleteFunc)
{
    CMCXmlParser.GetXmlDoc(this.HelpSystem.GetPath() + "Data/Synonyms.xml", true, function (xmlDoc)
    {
        if (xmlDoc != null)
        {
            this.SynonymFile = new CMCSynonymFile(xmlDoc.documentElement);
        }

        this.LoadSearchDB(this.HelpSystem.GetPath() + dbFile, OnCompleteFunc);
    }, null, this);
};

CMCSearchDB.prototype.LookupPhrases = function (stem, phrases)
{
    var stemMap	= this.SearchDB.GetItem( stem );
    
    if ( stemMap )
    {
		stemMap.ForEach( function( key, value )
		{
			phrases.Add( key, true );
			
			return true;
		} );
    }
}

CMCSearchDB.prototype.LookupStem	= function( resultSet, stem, dbIndex, buildWordMap, buildPhraseMap )
{
    var stemMap	= this.SearchDB.GetItem( stem );
    
    if ( stemMap )
    {
		stemMap.ForEach( function( key, value )
		{
			var phraseXMLNode = value;
            
            for ( var i = 0; i < phraseXMLNode.length; i++ )
            {
                var entry		= phraseXMLNode[i];
                var result		= new CMCQueryResult( dbIndex, entry, entry.Rank, key );
                
                resultSet.Add( result, buildWordMap, buildPhraseMap, false );
            }
			
			return true;
		} );
    }
}

// (Should be) Private member functions

CMCSearchDB.prototype.LoadSearchDB = function (dbFile, OnCompleteFunc)
{
    CMCXmlParser.GetXmlDoc(dbFile, true, function (xmlDoc)
    {
        var urls = FMCGetChildNodeByTagName(xmlDoc.documentElement, "urls", 0).getElementsByTagName("Url");
        var stems = xmlDoc.getElementsByTagName("stem");
        var root = xmlDoc.documentElement;

        this.SearchType = root.getAttribute("SearchType");
        this.NGramSize = FMCGetAttributeInt(root, "NGramSize", 0);

        // Load URLs
        // Due to a bug in Safari, we can't store the whole URL node. When we try to access it in the future, Safari crashes.
        // Instead, we store the URL sources and titles individually rather than storing the entire URL node.

        for (var i = 0; i < urls.length; i++)
        {
            this.URLSources[i] = urls[i].getAttribute("Source");
            this.URLTitles[i] = urls[i].getAttribute("Title");
        }

        // Load stems

        for (var i = 0; i < stems.length; i++)
        {
            var stem = stems[i];
            var stemName = stem.getAttribute("n");
            var chunk = stem.getAttribute("chunk");

            if (chunk)
            {
                this.SearchDB.Add(stemName, chunk);
            }
            else
            {
                var phrases = stem.getElementsByTagName("phr");
                var phraseMap = new CMCDictionary();

                this.SearchDB.Add(stemName, phraseMap);

                // Load phrases

                for (var j = 0; j < phrases.length; j++)
                {
                    var phrase = phrases[j];
                    var phraseName = phrase.getAttribute("n");
                    var entries = phrase.getElementsByTagName("ent");
                    var entriesArray = new Array(entries.length);

                    phraseMap.Add(phraseName, entriesArray);

                    // Load entries

                    for (var k = 0; k < entries.length; k++)
                    {
                        var phraseNode = entries[k];
                        var r = parseInt(phraseNode.getAttribute("r"));
                        var t = parseInt(phraseNode.getAttribute("t"));
                        var w = parseInt(phraseNode.getAttribute("w"));
                        var entry = new CMCEntry(r, t, w);

                        entriesArray[k] = entry;
                    }
                }
            }
        }

        OnCompleteFunc();
    }, null, this);
}

CMCSearchDB.prototype.LoadChunk = function (stem, OnCompleteFunc)
{
    if (typeof this.SearchDB.GetItem(stem) == "string")
    {
        CMCXmlParser.GetXmlDoc(this.HelpSystem.GetPath() + "Data/" + this.SearchDB.GetItem(stem), true, function (xmlDoc)
        {
            var stems = xmlDoc.getElementsByTagName("stem");

            // Load stems

            for (var i = 0; i < stems.length; i++)
            {
                var stem = stems[i];
                var stemName = stem.getAttribute("n");
                var phrases = stem.getElementsByTagName("phr");
                var phraseMap = new CMCDictionary();

                this.SearchDB.Add(stemName, phraseMap);

                // Load phrases

                for (var j = 0; j < phrases.length; j++)
                {
                    var phrase = phrases[j];
                    var phraseName = phrase.getAttribute("n");
                    var entries = phrase.getElementsByTagName("ent");
                    var entriesArray = new Array(entries.length);

                    phraseMap.Add(phraseName, entriesArray);

                    // Load entries

                    for (var k = 0; k < entries.length; k++)
                    {
                        var phraseNode = entries[k];
                        var r = parseInt(phraseNode.getAttribute("r"));
                        var t = parseInt(phraseNode.getAttribute("t"));
                        var w = parseInt(phraseNode.getAttribute("w"));
                        var entry = new CMCEntry(r, t, w);

                        entriesArray[k] = entry;
                    }
                }
            }

            OnCompleteFunc();
        }, null, this);
    }
    else
    {
        OnCompleteFunc();
    }
}

//
//    End class CMCSearchDB
//

function Search_OnMessage(e)
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

        if (message == "navigation-height-updated")
        {
            var searchResultsTable = document.getElementById("searchResultsTable");
            var searchResultsContainer = document.getElementById("SearchResults").parentNode;
            var searchResultsTableHeight = dataValues[0];
            var currTop = dataValues[1];
            var searchResultsContainerHeight = Math.max(currTop - searchResultsContainer.offsetTop - 2, 0);

            searchResultsContainer.style.height = searchResultsContainerHeight + "px";

            if (searchResultsTable)
            {
                searchResultsTable.style.width = searchResultsTableHeight + "px";
            }

            //

            handled = true;
        }
        else if (message == "do-search")
        {
            var query = dataValues[0];
            var firstPick = FMCStringToBool(dataValues[1]);

            document.forms["search"].searchField.value = query;

            StartSearch(firstPick, null, null);

            //

            handled = true;
        }

        if (handled)
        {
            FMCPostMessageResponse(e.source, message, responseData.length > 0 ? responseData : null, messageID);
        }
    }
}

if ( gRuntimeFileType == "Search" )
{

var gInit						= false;
var gSearchDBs					= new Array();
var gParser						= null;
var gFilters					= null;
var gFullSet					= null;
var gMergedSet					= null;
var gFilteredSet				= null;
var gHighlight					= "";
var gFavoritesEnabled			= true;
var gAddSearchLabel				= "Add search string to favorites";
var gAddSearchIcon				= "Images/AddSearchToFavorites.gif";
var gAddSearchOverIcon			= "Images/AddSearchToFavorites_over.gif";
var gAddSearchSelectedIcon		= "Images/AddSearchToFavorites_selected.gif";
var gAddSearchIconWidth			= 23;
var gAddSearchIconHeight		= 22;
var gFiltersLabel				= "Filters:";
var gFiltersLabelStyleMap		= new CMCDictionary();
var gTableSummary = "This table contains the results of the search that was performed. The first column indicates the search rank and the second column indicates the title of the topic that contains the search result.";
var gRankLabel					= "Rank";
var gTitleLabel                 = "Title";
var gTopicResultsLabel          = "Topic Results";
var gCommunityResultsLabel      = "Community Results";
var gShowAllCommunityResultsLabel = "Show all community results";
var gUnfilteredLabel			= "(unfiltered)";
var gNoTopicsFoundLabel			= "No topics found";
var gInvalidTokenLabel			= "Invalid token.";
var gDownloadedSynonymXmlDocRootNode = null;

gOnloadFuncs.push( Search_WindowOnload );

gReadyFuncs.push(function ()
{
    document.forms["search"].searchField.value = "";
});

if (FMCIsChromeLocal())
{
    window.addEventListener("message", Search_OnMessage, false);
}

var gOnSearchFinishedFunc	= null;
var gCallbackFuncArgs		= null;
var gSearchResultSet		= null;

}
