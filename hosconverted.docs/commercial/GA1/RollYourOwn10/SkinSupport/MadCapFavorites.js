/// <reference path="MadCapUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Favorites_WindowOnload()
{
	if ( MCGlobals.NavigationFrame != null )
	{
		Favorites_WaitForPaneActive();
	}
	else
	{
		Favorites_Init( null );
	}
}

function Favorites_WaitForPaneActive()
{
    function OnGetActivePane(activePane)
    {
        if (activePane == window.name)
        {
            //MCGlobals.NavigationFrame.SetIFrameHeight();

            Favorites_Init(null);
        }
        else
        {
            window.setTimeout(Favorites_WaitForPaneActive, WAIT_FOR_PANE_ACTIVE_INTERVAL);
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

function Favorites_Init( OnCompleteFunc )
{
	if ( gInit )
	{
		if ( OnCompleteFunc )
		{
			OnCompleteFunc();
		}
		
		return;
	}
    
    //

    var loadingLabel = CMCFlareStylesheet.LookupValue("Control", "Messages", "Loading", "LOADING");
    var loadingAlternateText = CMCFlareStylesheet.LookupValue("Control", "Messages", "LoadingAlternateText", "Loading");

    StartLoading(window, document.body, loadingLabel, loadingAlternateText, null);

	window.setTimeout( Init2, 0 );

	function Init2()
	{
	    Favorites_LoadSkin(function ()
	    {
	        Favorites_LoadStyles();

	        //

	        if (gDeleteSearchFavoritesIcon == null) { gDeleteSearchFavoritesIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete.gif"; }
	        if (gDeleteSearchFavoritesOverIcon == null) { gDeleteSearchFavoritesOverIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete_over.gif"; }
	        if (gDeleteSearchFavoritesSelectedIcon == null) { gDeleteSearchFavoritesSelectedIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete_selected.gif"; }

	        if (gDeleteTopicFavoritesIcon == null) { gDeleteTopicFavoritesIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete.gif"; }
	        if (gDeleteTopicFavoritesOverIcon == null) { gDeleteTopicFavoritesOverIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete_over.gif"; }
	        if (gDeleteTopicFavoritesSelectedIcon == null) { gDeleteTopicFavoritesSelectedIcon = MCGlobals.RootFolder + MCGlobals.SkinTemplateFolder + "Images/Delete_selected.gif"; }

	        FMCLoadSearchFavorites();
	        document.body.insertBefore(document.createElement("br"), document.getElementById("searchFavorites").nextSibling);
	        FMCLoadTopicsFavorites();

	        //

	        gInit = true;

	        EndLoading(window, null);

	        if (OnCompleteFunc)
	        {
	            OnCompleteFunc();
	        }
	    });
	}
}

function Favorites_LoadSkin(OnCompleteFunc)
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

function Favorites_LoadStyles()
{
    var label = CMCFlareStylesheet.LookupValue("AccordionItem", "Favorites", "Label", null);

    if (label != null)
    {
        document.title = label;
    }

    var backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "AccordionFavorites", "BackgroundColor", null);

    if (backgroundColor != null)
    {
        document.body.style.backgroundColor = backgroundColor;
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "EmptySearchFavoritesLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gEmptySearchFavoritesLabel = value;
        }
        else if (name == "Tooltip")
        {
            if (value.toLowerCase() == "none")
            {
                value = "";
            }

            gEmptySearchFavoritesTooltip = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

            gEmptySearchFavoritesStyleMap.Add(name, value);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "EmptyTopicFavoritesLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gEmptyTopicFavoritesLabel = value;
        }
        else if (name == "Tooltip")
        {
            if (value.toLowerCase() == "none")
            {
                value = "";
            }

            gEmptyTopicFavoritesTooltip = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

            gEmptyTopicFavoritesStyleMap.Add(name, value);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchFavoritesDeleteButton");

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

            gDeleteSearchFavoritesTooltip = value;
        }
        else if (name == "Icon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var width = CMCFlareStylesheet.GetResourceProperty(value, "Width", null);
            var height = CMCFlareStylesheet.GetResourceProperty(value, "Height", null);

            if (width)
            {
                gDeleteSearchFavoritesIconWidth = width;
            }

            if (height)
            {
                gDeleteSearchFavoritesIconHeight = height;
            }

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteSearchFavoritesIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "PressedIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteSearchFavoritesSelectedIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "HoverIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteSearchFavoritesOverIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "SearchFavoritesLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gSearchFavoritesLabel = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

            gSearchFavoritesLabelStyleMap.Add(name, value);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "TopicFavoritesDeleteButton");

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

            gDeleteTopicFavoritesTooltip = value;
        }
        else if (name == "Icon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var width = CMCFlareStylesheet.GetResourceProperty(value, "Width", null);
            var height = CMCFlareStylesheet.GetResourceProperty(value, "Height", null);

            if (width)
            {
                gDeleteTopicFavoritesIconWidth = width;
            }

            if (height)
            {
                gDeleteTopicFavoritesIconHeight = height;
            }

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteTopicFavoritesIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "PressedIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteTopicFavoritesSelectedIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
        else if (name == "HoverIcon")
        {
            value = FMCStripCssUrl(value);
            value = decodeURIComponent(value);

            var imgPath = MCGlobals.RootFolder + MCGlobals.SkinFolder + escape(value);

            gDeleteTopicFavoritesOverIcon = imgPath;
            FMCPreloadImage(imgPath);
        }
    }

    //

    var props = CMCFlareStylesheet.LookupProperties("Control", "TopicFavoritesLabel");

    for (var i = 0, length = props.length; i < length; i++)
    {
        var prop = props[i];
        var name = prop.Name;
        var value = prop.Value;

        if (name == "Label")
        {
            gTopicFavoritesLabel = value;
        }
        else
        {
            name = name.charAt(0).toLowerCase() + name.substring(1, name.length);

            gTopicFavoritesLabelStyleMap.Add(name, value);
        }
    }
}

function FMCSetSearchTabIndexes()
{
	gTabIndex = 1;
	
	//
	
	var searchTable	= document.getElementById( "searchFavorites" );
	var trs	= searchTable.getElementsByTagName( "tr" );
	
	if ( trs[1].getElementsByTagName( "td" ).length == 1 )
	{
		return;
	}
	
	for ( var i = 1; i < trs.length; i++ )
	{
		var tr	= trs[i];
		
		tr.firstChild.firstChild.tabIndex = gTabIndex++;
		tr.lastChild.firstChild.tabIndex = gTabIndex++;
	}
	
	//
	
	FMCSetTopicsTabIndexes();
}

function FMCSetTopicsTabIndexes()
{
	var topicTable	= document.getElementById( "topicsFavorites" );
	
	if ( !topicTable )
	{
		return;
	}
	
	//
	
	var searchTable	= document.getElementById( "searchFavorites" );
	var trs			= searchTable.getElementsByTagName( "tr" );
	
	if ( trs.length > 0 )
	{
		gTabIndex = 1 + ((trs.length - 1) * 2) + 1;
	}
	else
	{
		gTabIndex = 2;
	}
	
	//
	
	var trs	= topicTable.getElementsByTagName( "tr" );
	
	if ( trs[1].getElementsByTagName( "td" ).length == 1 )
	{
		return;
	}
	
	for ( var i = 1; i < trs.length; i++ )
	{
		var tr	= trs[i];
		
		tr.firstChild.firstChild.tabIndex = gTabIndex++;
		tr.lastChild.firstChild.tabIndex = gTabIndex++;
	}
}

function Favorites_FMCAddToFavorites( section, value )
{
    value = FMCTrim( value );
    
    if ( !value )
    {
        return;
    }
    
    var cookie  = FMCReadCookie( section );
    
    if ( cookie )
    {
        var favorites   = cookie.split( "||" );
        
        for ( var i = 0; i < favorites.length; i++ )
        {
            if ( favorites[i] == value )
            {
                return;
            }
        }
        
        value = cookie + "||" + value;
    }
    
    FMCSetCookie( section, value, 36500 );
}

function FMCDeleteFavorites( id )
{
    var checkBoxes  = document.getElementById( id ).getElementsByTagName( "input" );
    var deleteQueue = new Array();
    
    for ( var i = 0; i < checkBoxes.length; i++ )
    {
        var checkBox    = checkBoxes[i];
        
        if ( checkBox.checked )
        {
            var value = checkBox.parentNode.parentNode.childNodes[0].childNodes[0].innerText;

            if (typeof (value) == 'undefined') {
                value = checkBox.parentNode.parentNode.childNodes[0].childNodes[0].textContent;
            }
            
            if ( id == "topicsFavorites" )
            {
                value = value + "|" + FMCGetMCAttribute( checkBox.parentNode.parentNode.childNodes[0].childNodes[0], "MadCap:content" );
            }
            
            FMCRemoveFromFavorites( id, value );
            deleteQueue[deleteQueue.length] = checkBox.parentNode.parentNode;
        }
    }
    
    for ( var i = 0; i < deleteQueue.length; i++ )
    {
        deleteQueue[i].parentNode.removeChild( deleteQueue[i] );
    }
    
    var table   = document.getElementById( id );
    var tbody   = table.childNodes[0];
    
    if ( tbody.childNodes.length == 1 )
    {
        var tr      = document.createElement( "tr" );
        var td      = document.createElement( "td" );
        var img     = document.createElement( "img" );

        var rtl = document.documentElement.dir == "rtl";
        
        img.src = "Images/FavoritesBlank.gif";
        img.alt = gEmptySearchFavoritesTooltip;
        img.style.width = "12px";
        img.style.height = "12px";

        if (rtl) {
            img.style.marginLeft = "5px";
        }
        else {
            img.style.marginRight = "5px";
        }
        
        td.colSpan = 2;
        td.style.textIndent = "15px";
        
        gEmptySearchFavoritesStyleMap.ForEach( function( key, value )
		{
			td.style[key] = value;
			
			return true;
		} );
        
        td.appendChild( img );
        
        var label	= null;
        
        if ( id == "topicsFavorites" )
        {
            label = gEmptyTopicFavoritesLabel;
        }
        else if ( id == "searchFavorites" )
        {
			label = gEmptySearchFavoritesLabel;
        }

		td.appendChild( document.createTextNode( label ) );
        tr.appendChild( td );
        tbody.appendChild( tr );
    }
}

function FMCRemoveFromFavorites( section, value )
{
    section = section.substring( 0, section.indexOf( "Favorites" ) );
    
    var cookie  = FMCReadCookie( section );
    
    if ( cookie )
    {
        var valuePosition   = cookie.indexOf( value );
        
        if ( valuePosition != -1 )
        {
            var backOffset      = 0;
            var forwardOffset   = 0;
            
            if ( cookie.substring( valuePosition - 2, valuePosition ) == "||" )
            {
                backOffset = 2;
            }
            if ( cookie.substring( valuePosition + value.length, valuePosition + value.length + 2 ) == "||" )
            {
                forwardOffset = 2;
            }
            
            if ( backOffset == 2 && forwardOffset == 2 )
            {
                backOffset = 0;
            }
            
            cookie = cookie.substring( 0, valuePosition - backOffset ) +
                     cookie.substring( valuePosition + value.length + forwardOffset, cookie.length );
        }
        
        FMCSetCookie( section, cookie, 36500 );
    }
}

function Favorites_ItemOnkeyup( e )
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

function FMCLoadSearchFavorites()
{
    var search  = FMCReadCookie( "search" );
    var searchFavorites;
    
    if ( !search )
    {
        searchFavorites = new Array();
    }
    else
    {
        searchFavorites = search.split( "||" );
    }
    
    var table   = document.getElementById( "searchFavorites" );
    
    if ( !table )
    {
        table = document.createElement( "table" );
        document.body.insertBefore( table, document.body.firstChild );
    }
    else
    {
        table.removeChild( table.childNodes[0] )
    }
    
    var tbody	= document.createElement( "tbody" );
    var tr		= document.createElement( "tr" );
    var td		= document.createElement( "td" );
    var h1 = document.createElement("h1");

    h1.appendChild(document.createTextNode(gSearchFavoritesLabel));
    td.appendChild(h1);
    
	gSearchFavoritesLabelStyleMap.ForEach( function( key, value )
	{
		td.style[key] = value;
			
		return true;
	} );
    
    tr.appendChild( td );
    
    td = document.createElement( "td" );
    
    tr.appendChild( td );
    tbody.appendChild( tr );

    MakeButton(td, gDeleteSearchFavoritesTooltip, gDeleteSearchFavoritesIcon, gDeleteSearchFavoritesOverIcon, gDeleteSearchFavoritesSelectedIcon, gDeleteSearchFavoritesIconWidth, gDeleteSearchFavoritesIconHeight, null);
    td.getElementsByTagName("button")[0].onclick = function () { FMCDeleteFavorites("searchFavorites"); };
    td.getElementsByTagName("button")[0].onkeyup = Favorites_ItemOnkeyup;

    var rtl = document.documentElement.dir == "rtl";
    
    if ( searchFavorites.length == 0 )
    {
        tr = document.createElement( "tr" );
        td = document.createElement( "td" );
        
        var img	= document.createElement( "img" );
        
        img.src = "Images/FavoritesBlank.gif";
        img.alt = gEmptySearchFavoritesTooltip;
        img.style.width = "12px";
        img.style.height = "12px";

        if (rtl) {
            img.style.marginLeft = "5px";
        }
        else {
            img.style.marginRight = "5px";
        }
        
        td.colSpan = 2;
        td.style.textIndent = "15px";
        
        gEmptySearchFavoritesStyleMap.ForEach( function( key, value )
		{
			td.style[key] = value;
			
			return true;
		} );
        
        td.appendChild( img );
        td.appendChild( document.createTextNode( gEmptySearchFavoritesLabel ) );
        tr.appendChild( td );
        tbody.appendChild( tr );
    }
    
    for ( var i = 0; i < searchFavorites.length; i++ )
    {
        var span    = document.createElement( "span" );
        
        tr = document.createElement( "tr" );
        td = document.createElement( "td" );
        
        var img	= document.createElement( "img" );
        
        img.src = "Images/FavoritesSearch.gif";
        img.alt = "Search favorite";
        img.style.width = "16px";
        img.style.height = "16px";

        if (rtl) {
            img.style.marginLeft = "5px";
        }
        else {
            img.style.marginRight = "5px";
        }
        
        span.style.cursor = (navigator.appVersion.indexOf( "MSIE 5.5" ) == -1) ? "pointer" : "hand" ;
        span.onclick = function ()
        {
            FMCPostMessageRequest(MCGlobals.NavigationFrame, "set-active-iframe-by-name", ["search"], null, function ()
            {
                var navigationFrame = parent;

                navigationFrame.SetActiveIFrameByName("search");
                navigationFrame.SetIFrameHeight();
            });

            var query = this.childNodes[1].firstChild.nodeValue;

            FMCPostMessageRequest(MCGlobals.NavigationFrame.frames["search"], "do-search", [query, false], null, function ()
            {
                var navigationFrame = parent;

                navigationFrame.frames["search"].document.forms["search"].searchField.value = query;
                navigationFrame.frames["search"].document.forms["search"].onsubmit();
            });
        };
        span.onkeyup = Favorites_ItemOnkeyup;
        
        td.style.textIndent = "15px";

        var favoriteEntryId = "SearchFavorite" + i;
        var label = document.createElement("label");
        label.setAttribute("for", favoriteEntryId);
        label.appendChild(document.createTextNode(searchFavorites[i]));

        span.appendChild(img);
        span.appendChild(label);
        td.appendChild( span );
        tr.appendChild( td );
        
        td = document.createElement( "td" );
        
        var checkBox = document.createElement( "input" );
        checkBox.id = favoriteEntryId;
        checkBox.type = "checkbox";
        
        td.style.width = "16px";
        
        td.appendChild( checkBox );
        tr.appendChild( td );
        tbody.appendChild( tr );
    }
    
    table.id = "searchFavorites";
    table.setAttribute("role", "presentation");
    
    table.appendChild( tbody );
    
    //
    
    FMCSetSearchTabIndexes();
}

function FMCLoadTopicsFavorites()
{
    var topics  = FMCReadCookie( "topics" );
    var topicsFavorites;
    
    if ( !topics )
    {
        topicsFavorites = new Array();
    }
    else
    {
        topicsFavorites = topics.split( "||" );
    }
    
    var table   = document.getElementById( "topicsFavorites" );
    
    if ( !table )
    {
        table = document.createElement( "table" );
        document.body.appendChild( table );
    }
    else
    {
        table.removeChild( table.childNodes[0] )
    }
    
    var tbody	= document.createElement( "tbody" );
    var tr		= document.createElement( "tr" );
    var td		= document.createElement( "td" );
    var h1 = document.createElement("h1");

    h1.appendChild(document.createTextNode(gTopicFavoritesLabel));
    td.appendChild(h1);
    
	gTopicFavoritesLabelStyleMap.ForEach( function( key, value )
	{
		td.style[key] = value;
			
		return true;
	} );
    
    tr.appendChild( td );
    
    td = document.createElement( "td" );
    
    tr.appendChild( td );
    tbody.appendChild( tr );

    MakeButton(td, gDeleteTopicFavoritesTooltip, gDeleteTopicFavoritesIcon, gDeleteTopicFavoritesOverIcon, gDeleteTopicFavoritesSelectedIcon, gDeleteTopicFavoritesIconWidth, gDeleteTopicFavoritesIconHeight, null);
    td.getElementsByTagName("button")[0].onclick = function () { FMCDeleteFavorites("topicsFavorites"); };
    td.getElementsByTagName("button")[0].onkeyup = Favorites_ItemOnkeyup;

    var rtl = document.documentElement.dir == "rtl";

    if ( topicsFavorites.length == 0 )
    {
        tr = document.createElement( "tr" );
        td = document.createElement( "td" );
        
        var img	= document.createElement( "img" );
        
        img.src = "Images/FavoritesBlank.gif";
        img.alt = gEmptyTopicFavoritesTooltip;
        img.style.width = "12px";
        img.style.height = "12px";

        if (rtl) {
            img.style.marginLeft = "5px";
        }
        else {
            img.style.marginRight = "5px";
        }
        
        td.colSpan = 2;
        td.style.textIndent = "15px";
        
		gEmptyTopicFavoritesStyleMap.ForEach( function( key, value )
		{
			td.style[key] = value;
			
			return true;
		} );
        
        td.appendChild( img );
        td.appendChild( document.createTextNode( gEmptyTopicFavoritesLabel ) );
        tr.appendChild( td );
        tbody.appendChild( tr );
    }
    
    for ( var i = 0; i < topicsFavorites.length; i++ )
    {
        var span    = document.createElement( "span" );
        
        tr = document.createElement( "tr" );
        td = document.createElement( "td" );
        
        var img	= document.createElement( "img" );
        
        img.src = "Images/FavoritesTopic.gif";
        img.alt = "Topic favorite";
        img.style.width = "12px";
        img.style.height = "14px";

        if (rtl) {
            img.style.marginLeft = "5px";
        }
        else {
            img.style.marginRight = "5px";
        }
        
        var title   = topicsFavorites[i].split( "|" )[0];
        var content = topicsFavorites[i].split( "|" )[1];
        
        span.style.cursor = (navigator.appVersion.indexOf( "MSIE 5.5" ) == -1) ? "pointer" : "hand" ;
        span.setAttribute( "MadCap:content", content );
        span.onclick = function (e)
        {
            var topicURL = FMCGetMCAttribute(this, "MadCap:content");

            FMCPostMessageRequest(MCGlobals.BodyFrame, "navigate", [topicURL], null, function ()
            {
                parent.parent.frames["body"].document.location.href = topicURL;
            });
        };
        span.onkeyup = Favorites_ItemOnkeyup;
        
        td.style.textIndent = "15px";

        var favoriteEntryId = "TopicFavorite" + i;
        var label = document.createElement("label");
        label.setAttribute("for", favoriteEntryId);

        var hrefNode = document.createElement("a");
        hrefNode.setAttribute("href", content);

        label.appendChild(hrefNode);
        label.appendChild(document.createTextNode(title));

        span.appendChild(img);
        span.appendChild(label);
        td.appendChild( span );
        tr.appendChild( td );
        
        td = document.createElement( "td" );
        
        var checkBox    = document.createElement( "input" );
        
        checkBox.type = "checkbox";
        checkBox.id = favoriteEntryId;
        td.style.width = "16px";
        
        td.appendChild( checkBox );
        tr.appendChild( td );
        tbody.appendChild( tr );
    }
    
    table.id = "topicsFavorites";
    table.setAttribute("role", "presentation");
    
    table.appendChild( tbody );
    
    //
    
    FMCSetTopicsTabIndexes();
}

function Favorites_OnMessage(e)
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

        if (message == "add-topic-favorite")
        {
            var value = dataValues[0];

            Favorites_Init(function ()
            {
                Favorites_FMCAddToFavorites("topics", value);
                FMCLoadTopicsFavorites();
            });

            //

            handled = true;
        }
        else if (message == "add-search-favorite")
        {
            var value = dataValues[0];

            Favorites_FMCAddToFavorites("search", value);
            FMCLoadSearchFavorites();

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

if ( gRuntimeFileType == "Favorites" )
{

var gInit								= false;
var gSearchFavoritesLabel				= "Favorite Searches";
var gSearchFavoritesLabelStyleMap		= new CMCDictionary();
var gEmptySearchFavoritesLabel			= "(there are no saved searches)";
var gEmptySearchFavoritesTooltip		= "No search favorites";
var gEmptySearchFavoritesStyleMap		= new CMCDictionary();
var gTopicFavoritesLabel				= "Favorite Topics";
var gTopicFavoritesLabelStyleMap		= new CMCDictionary();
var gEmptyTopicFavoritesLabel			= "(there are no saved topics)";
var gEmptyTopicFavoritesTooltip			= "No topic favorites";
var gEmptyTopicFavoritesStyleMap		= new CMCDictionary();
var gDeleteSearchFavoritesTooltip		= "Delete selected favorite searches";
var gDeleteSearchFavoritesIcon			= null;
var gDeleteSearchFavoritesOverIcon		= null;
var gDeleteSearchFavoritesSelectedIcon	= null;
var gDeleteSearchFavoritesIconWidth		= 23;
var gDeleteSearchFavoritesIconHeight	= 22;
var gDeleteTopicFavoritesTooltip		= "Delete selected favorite topics";
var gDeleteTopicFavoritesIcon			= null;
var gDeleteTopicFavoritesOverIcon		= null;
var gDeleteTopicFavoritesSelectedIcon	= null;
var gDeleteTopicFavoritesIconWidth		= 23;
var gDeleteTopicFavoritesIconHeight		= 22;

gEmptySearchFavoritesStyleMap.Add( "color", "#999999" );
gEmptySearchFavoritesStyleMap.Add( "fontSize", "10px" );
gEmptyTopicFavoritesStyleMap.Add( "color", "#999999" );
gEmptyTopicFavoritesStyleMap.Add( "fontSize", "10px" );

//

gOnloadFuncs.push( Favorites_WindowOnload );

if (FMCIsChromeLocal())
{
    window.addEventListener("message", Favorites_OnMessage, false);
}

}
