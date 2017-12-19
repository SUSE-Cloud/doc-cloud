/// <reference path="MadCapUtilities.js" />

// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function CalcVisibleItems( y )
{
    var accordionTop  = (gVisibleItems + 1) * gcAccordionItemHeight;
    var itemOffset    = (y - accordionTop >= 0) ? Math.floor( (y - accordionTop) / gcAccordionItemHeight ) : Math.ceil( (y - accordionTop) / gcAccordionItemHeight );
    
    gVisibleItems = Math.max( Math.min( gVisibleItems + itemOffset, gcMaxVisibleItems ), 0 );
    
    // Debug
    //window.status = accordionTop + ", " + y + ", " + itemOffset + ", " + gVisibleItems;
}

function RefreshAccordion()
{
    SetIFrameHeight();
    
    for ( var i = 0; i < gAccordionItems.length; i++ )
    {
        gAccordionItems[i].style.display = (i < gVisibleItems) ? "block" : "none";
        gAccordionIcons[i].style.visibility = (i < gVisibleItems) ? "hidden" : "visible";
    }
}

function ExpandAccordionDrag( e )
{
    // Debug
    //window.status += "d";
    
    if ( !e ) { e = window.event; }
    
    var currY = FMCGetClientHeight( window, false ) - e.clientY;
    
    CalcVisibleItems( currY );
    RefreshAccordion();
}

function ExpandAccordionEnd( e )
{
    // Debug
    //window.status += "e";
    
    if ( document.body.releaseCapture )
    {
        document.body.releaseCapture();
        
        document.body.onmousemove = null;
        document.body.onmouseup = null;
    }
    else if ( document.removeEventListener )
    {
        document.removeEventListener( "mouseover", ExpandAccordionMouseover, true );
        document.removeEventListener( "mousemove", ExpandAccordionDrag, true );
        document.removeEventListener( "mouseup", ExpandAccordionEnd, true );
        frames[gActiveIFrame.id].document.removeEventListener( "mousemove", ExpandAccordionDrag, true );
        frames[gActiveIFrame.id].document.removeEventListener( "mouseup", ExpandAccordionEnd, true );
    }
    
    var accordionExpander	= document.getElementById( "AccordionExpander" );
    
    AccordionItemOnmouse( accordionExpander, accordionExpander, "MadCap:outImage" );
    
    for ( var i = 0; i < gAccordionItems.length; i++ )
    {
        gAccordionItems[i].style.cursor = (navigator.appVersion.indexOf( "MSIE 5.5" ) == -1) ? "pointer" : "hand" ;
    }
    
    SetupAccordion();
}

function ExpandAccordionMouseover( e )
{
    e.stopPropagation();
}

function ExpandAccordionStart()
{
    // Debug
    //window.status += "s";
    
    if ( document.body.setCapture )
    {
        document.body.setCapture();
        
        document.body.onmousemove = ExpandAccordionDrag;
        document.body.onmouseup = ExpandAccordionEnd;
    }
    else if ( document.addEventListener )
    {
        document.addEventListener( "mouseover", ExpandAccordionMouseover, true );
        document.addEventListener( "mousemove", ExpandAccordionDrag, true );
        document.addEventListener( "mouseup", ExpandAccordionEnd, true );
        frames[gActiveIFrame.id].document.addEventListener( "mousemove", ExpandAccordionDrag, true );
        frames[gActiveIFrame.id].document.addEventListener( "mouseup", ExpandAccordionEnd, true );
    }
    
    var accordionExpander	= document.getElementById( "AccordionExpander" );
    
    AccordionItemOnmouse( accordionExpander, accordionExpander, "MadCap:selectedImage" );
    
    for ( var i = 0; i < gAccordionItems.length; i++ )
    {
        gAccordionItems[i].style.cursor = "n-resize";
    }
    
    SetupAccordion();
}

function SetupAccordion() {
    for (var i = 0; i < gAccordionItems.length; i++) {
        var accordionItem = gAccordionItems[i];
        var accordionIcon = gAccordionIcons[i];

        if (accordionItem != gActiveItem) {
            accordionItem.onmouseover = AccordionItemOnmouseover;
            accordionItem.onmouseout = AccordionItemOnmouseout;
            accordionIcon.onmouseover = AccordionIconOnmouseover;
            accordionIcon.onmouseout = AccordionIconOnmouseout;
        }
    }
}


function AccordionItemOnmouseover()
{
	AccordionItemOnmouse( this, this.getElementsByTagName( "td" )[0], "MadCap:overImage" );
}

function AccordionItemOnmouseout()
{
	AccordionItemOnmouse( this, this.getElementsByTagName( "td" )[0], "MadCap:outImage" );
}

function AccordionItemOnmouse( accordionItem, backgroundImageNode, attributeName )
{
	var image = FMCGetMCAttribute( accordionItem, attributeName );
			
	if ( image == null )
	{
		image = "";
	}
	
	backgroundImageNode.style.backgroundImage = FMCCreateCssUrl( image );
}

function AccordionIconOnmouseover()
{
	AccordionItemOnmouse( this, this, "MadCap:overImage" );
}

function AccordionIconOnmouseout()
{
	AccordionItemOnmouse( this, this, "MadCap:outImage" );
}

function AccordionItemClick( node )
{
    SetActiveIFrame( parseInt( FMCGetMCAttribute( node, "MadCap:itemID" ) ), node.getElementsByTagName( "span" )[0].firstChild.nodeValue );
    SetIFrameHeight();
}

function AccordionIconClick( node )
{
    SetActiveIFrame( parseInt( FMCGetMCAttribute( node, "MadCap:itemID" ) ), node.title );
    SetIFrameHeight();
}

function Navigation_ItemOnkeyup( e )
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

function Navigation_Init()
{
	if ( FMCIsWebHelpAIR() )
	{
		frames["search"].parentSandboxBridge = window.parentSandboxBridge;
	}
	
	document.body.tabIndex = 1;

    Navigation_LoadSkin(function ()
    {
        SetIFrameHeight();
        SetupAccordion();
    
        //
    
        gInit = true;
    });
}

function SetupMouseEffectDefaults()
{
	var accordionExpander	= document.getElementById( "AccordionExpander" );
	
	if ( String.IsNullOrEmpty( accordionExpander.style.backgroundImage ) )
	{
		accordionExpander.style.backgroundImage = FMCCreateCssUrl( "Images/NavigationBottomGradient.jpg" );
		accordionExpander.setAttribute( "MadCap:outImage", "Images/NavigationBottomGradient.jpg" );
	}
	
	if ( FMCGetAttribute( accordionExpander, "MadCap:selectedImage" ) == null )
	{
		accordionExpander.setAttribute( "MadCap:selectedImage", "Images/NavigationBottomGradient_selected.jpg" );
		
		FMCPreloadImage( "Images/NavigationBottomGradient_selected.jpg" );
    }
    
    for ( var i = 0; i < gAccordionItems.length; i++ )
    {
		var accordionItem	= gAccordionItems[i];
		var id				= accordionItem.id;
		var name			= id.charAt( 0 ).toUpperCase() + id.substring( 1 );
		var td				= accordionItem.getElementsByTagName( "td" )[0];
		
		if ( String.IsNullOrEmpty( td.style.backgroundImage ) )
		{
			accordionItem.getElementsByTagName( "td" )[0].style.backgroundImage = FMCCreateCssUrl( "Images/" + name + "Background.jpg" );
			accordionItem.setAttribute( "MadCap:outImage", "Images/" + name + "Background.jpg" );
		}
		
		if ( FMCGetAttribute( accordionItem, "MadCap:overImage" ) == null )
		{
			accordionItem.setAttribute( "MadCap:overImage", "Images/" + name + "Background_over.jpg" );
			
			FMCPreloadImage( "Images/" + name + "Background_over.jpg" );
		}
    }
    
    for ( var i = 0; i < gAccordionIcons.length; i++ )
    {
		var accordionIcon	= gAccordionIcons[i];
		var id				= accordionIcon.id;
		var name			= id.charAt( 0 ).toUpperCase() + id.substring( 1, id.length - "Icon".length ) + "Accordion";
		
		if ( String.IsNullOrEmpty( accordionIcon.style.backgroundImage ) )
		{
			accordionIcon.style.backgroundImage = FMCCreateCssUrl( "Images/" + name + "Background.jpg" );
			accordionIcon.setAttribute( "MadCap:outImage", "Images/" + name + "Background.jpg" );
		}
		
		if ( FMCGetAttribute( accordionIcon, "MadCap:overImage" ) == null )
		{
			accordionIcon.setAttribute( "MadCap:overImage", "Images/" + name + "Background_over.jpg" );
			
			FMCPreloadImage( "Images/" + name + "Background_over.jpg" );
		}
    }
}

function Navigation_LoadSkin(OnCompleteFunc) {
    function LoadSkin(pulseEnabled) {
        CMCXmlParser.GetXmlDoc(FMCGetSkinFolderAbsolute() + "Skin.xml", true, function (xmlDoc) {
            var xmlHead = xmlDoc.documentElement;
            var tabsAttribute = xmlHead.getAttribute("Tabs");
            var tabs = null;

            if (tabsAttribute && tabsAttribute != "") {
                tabs = xmlHead.getAttribute("Tabs").split(",");
            }
            else {
                OnCompleteFunc();
                return;
            }

            var defaultTab = (xmlHead.getAttribute("Tabs").indexOf(xmlHead.getAttribute("DefaultTab")) == -1) ? tabs[0] : xmlHead.getAttribute("DefaultTab");
            var accordionID = null;
            var iconID = null;
            var iframeID = null;

            if (!pulseEnabled) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i] == 'Community') {
                        tabs.splice(i, 1);
                    }
                }
            }

            gcMaxVisibleItems = tabs.length;

            Navigation_LoadWebHelpOptions(xmlDoc);

            //

            gTabIndex = 3;

            //

            for (var i = 0; i < tabs.length; i++) {
                var id = null;
                var title = null;

                switch (tabs[i]) {
                    case "TOC":
                        id = "toc";
                        title = "Table of Contents";

                        break;
                    case "Index":
                        id = "index";
                        title = "Index";

                        break;
                    case "Search":
                        id = "search";
                        title = "Search";

                        break;
                    case "Glossary":
                        id = "glossary";
                        title = "Glossary";

                        break;
                    case "Favorites":
                        id = "favorites";
                        title = "Favorites";

                        break;
                    case "BrowseSequences":
                        id = "browsesequences";
                        title = "Browse Sequences";

                        break;
                    case "Community":
                        id = "community";
                        title = "Community";

                        break;
                    default:
                        // This handles any deprecated panes such as TopicComments and RecentComments. They could be in the skin from older projects.
                        continue;
                }

                gAccordionItems[i] = document.getElementById(id + "Accordion");
                gAccordionItems[i].setAttribute("MadCap:itemID", i);
                gAccordionItems[i].getElementsByTagName("a")[0].tabIndex = gTabIndex++;

                var currIcon = document.getElementById(id + "Icon");
                var trAccordionIcons = currIcon.parentNode;
                var currIconClone = currIcon.cloneNode(true);

                currIconClone.setAttribute("MadCap:itemID", i);
                gAccordionIcons[i] = currIconClone;
                trAccordionIcons.removeChild(currIcon);
                trAccordionIcons.appendChild(currIconClone);
                gAccordionIcons[i].tabIndex = 0;

                gIFrames[i] = document.getElementById(id);

                if (i < gVisibleItems) {
                    gAccordionItems[i].style.display = "block";
                }
                else {
                    gAccordionIcons[i].style.visibility = "visible";
                }

                gAccordionIcons[i].style.display = (document.defaultView && document.defaultView.getComputedStyle) ? "table-cell" : "block";

                if (!defaultTab) {
                    defaultTab = tabs[i];
                }

                if (tabs[i] == defaultTab) {
                    accordionID = id + "Accordion";
                    iconID = id + "Icon";
                    iframeID = id;

                    gcDefaultID = i;
                    gcDefaultTitle = title;
                }
            }

            gActiveItem = document.getElementById(accordionID);
            gActiveIcon = document.getElementById(iconID);
            gActiveIFrame = document.getElementById(iframeID);

            //

            Navigation_LoadStyles(xmlDoc, function () {
                //SetupMouseEffectDefaults();

                OnCompleteFunc();
            });
        }, null);
    }

    LoadSkin(false);

    if (FMCIsLiveHelpEnabled()) {
        gServiceClient.Init(function () {
            LoadSkin(gServiceClient.PulseActive);
        });
    }
}

function Navigation_LoadWebHelpOptions( xmlDoc )
{
    var webHelpOptions  = xmlDoc.getElementsByTagName( "WebHelpOptions" )[0];
    
    if ( webHelpOptions )
    {
        var visibleItems    = webHelpOptions.getAttribute( "VisibleAccordionItemCount" );
        
        if ( visibleItems )
        {
            gVisibleItems = parseInt( visibleItems );
        }
    }
}

function Navigation_LoadStyles(xmlDoc, OnCompleteFunc)
{
    var styleSheet	= xmlDoc.getElementsByTagName( "Stylesheet" )[0];
    
    if ( !styleSheet )
    {
		return;
	}
	
    var styleSheetLink	= styleSheet.getAttribute( "Link" );
    
    if ( !styleSheetLink )
    {
		return;
	}

	CMCXmlParser.GetXmlDoc(FMCGetSkinFolderAbsolute() + styleSheetLink, true, function (styleDoc)
	{
	    var styles = styleDoc.getElementsByTagName("Style");

	    for (var i = 0; i < styles.length; i++)
	    {
	        var styleName = styles[i].getAttribute("Name");

	        if (styleName == "AccordionItem")
	        {
	            Navigation_LoadAccordionItemStyle(styles[i]);
	        }
	        else if (styleName == "Frame")
	        {
	            Navigation_LoadFrameStyle(styles[i]);
	        }
	        else if (styleName == "Control")
	        {
	            Navigation_LoadControlStyle(styles[i]);
	        }
	    }

	    OnCompleteFunc();
	}, null);
}

function LoadAccordionIconsStyle( properties )
{
	var accordionIcons				= document.getElementById( "AccordionIcons" );
	var accordionIconsOuterTable	= FMCGetChildNodeByTagName( accordionIcons, "TABLE", 0 );
	var accordionIconsInnerTable	= accordionIconsOuterTable.getElementsByTagName( "table" )[0];

	for ( var j = 0; j < properties.length; j++ )
	{
		var cssName		= properties[j].getAttribute( "Name" );
		var cssValue	= FMCGetPropertyValue( properties[j], null );

		cssName = cssName.charAt( 0 ).toLowerCase() + cssName.substring( 1, cssName.length );

		if ( cssName == "itemHeight" )
		{
			accordionIcons.style.height = FMCConvertToPx( document, cssValue, null, 28 ) + "px";
		}
        else if ( cssName == "backgroundGradient" )
        {
			accordionIcons.getElementsByTagName( "td" )[0].style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + "AccordionIconsBackground.jpg" );
        }
        else if ( cssName == "backgroundImage" )
        {
			if ( cssValue != "none" )
			{
				cssValue = FMCStripCssUrl( cssValue );
				cssValue = decodeURIComponent( cssValue );

				accordionIcons.getElementsByTagName( "td" )[0].style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + cssValue );
			}
        }
        else if ( cssName.substring( 0, "border".length ) == "border" )
        {
			accordionIconsOuterTable.style[cssName] = FMCConvertBorderToPx( document, cssValue );
        }
        else
        {
            accordionIcons.style[cssName] = cssValue;
        }
	}

	var borderTopWidth		= FMCParseInt( FMCGetComputedStyle( accordionIconsOuterTable, "borderTopWidth" ), 0 );
	var borderBottomWidth	= FMCParseInt( FMCGetComputedStyle( accordionIconsOuterTable, "borderBottomWidth" ), 0 );
	var currHeight			= parseInt( FMCGetComputedStyle( accordionIcons, "height" ) );

	accordionIconsOuterTable.style.height = currHeight + "px";
	accordionIconsInnerTable.style.height = (currHeight - borderTopWidth - borderBottomWidth) + "px";
}

function Navigation_LoadAccordionItemStyle( accordionItemStyle )
{
    var styleClasses	= accordionItemStyle.getElementsByTagName( "StyleClass" );
    
    for ( var i = 0; i < styleClasses.length; i++ )
    {
        var styleName	= styleClasses[i].getAttribute( "Name" );
        var properties	= styleClasses[i].getElementsByTagName( "Property" );
        
        if ( styleName == "IconTray" )
        {
			LoadAccordionIconsStyle( properties );
			
			continue;
        }
        else if ( styleName == "BrowseSequence" )
        {
			styleName = "BrowseSequences";
        }
        
        var accordionItem			= document.getElementById( styleName.toLowerCase() + "Accordion" );

        // This handles any deprecated panes such as TopicComments and RecentComments. They could be in the skin from older projects.
        if (accordionItem == null)
        {
            continue;
        }

        var accordionItemOuterTable	= FMCGetChildNodeByTagName( accordionItem, "TABLE", 0 );
        var accordionItemInnerTable	= accordionItemOuterTable.getElementsByTagName( "table" )[0];
        var accordionANode = accordionItem.getElementsByTagName("a")[0];
        var accordionSpanNode = accordionANode.getElementsByTagName("span")[0];
        var accordionIcon			= document.getElementById( styleName.toLowerCase() + "Icon" );
        
        for ( var j = 0; j < properties.length; j++ )
        {
            var cssName		= properties[j].getAttribute( "Name" );
            var cssValue	= FMCGetPropertyValue( properties[j], null );
            
            cssName = cssName.charAt( 0 ).toLowerCase() + cssName.substring( 1, cssName.length );
            
            if ( cssName == "label" )
            {
                accordionSpanNode.firstChild.nodeValue = cssValue;
                accordionIcon.title = cssValue;

                if (accordionIcon.firstChild != null)
                    accordionIcon.firstChild.alt = cssValue;
                
                if ( FMCGetMCAttribute( accordionItem, "MadCap:itemID" ) == gcDefaultID )
                {
                    gcDefaultTitle = cssValue;
                }
            }
            else if ( cssName == "icon" )
            {
                var accordionItemImg    = accordionItem.getElementsByTagName( "img" )[0];
                var iconImg             = document.getElementById( styleName.toLowerCase() + "Icon" ).getElementsByTagName( "img" )[0];
                
                if ( cssValue == "none" )
                {
					if ( accordionItemImg )
					{
						accordionItemImg.parentNode.removeChild( accordionItemImg );
                    }
                }
                else
                {
					cssValue = FMCStripCssUrl( cssValue );
					cssValue = decodeURIComponent( cssValue );
					
					var width	= CMCFlareStylesheet.GetResourceProperty( cssValue, "Width", "auto" );
					var height	= CMCFlareStylesheet.GetResourceProperty( cssValue, "Height", "auto" );
					
					if ( width != "auto" )
					{
						width += "px";
					}
					
					if ( height != "auto" )
					{
						height += "px";
					}
					
                    accordionItemImg.src = FMCGetSkinFolderAbsolute() + escape( cssValue );
                    accordionItemImg.style.width = width;
                    accordionItemImg.style.height = height;
                    
                    iconImg.src = FMCGetSkinFolderAbsolute() + escape( cssValue );
                    iconImg.style.width = width;
                    iconImg.style.height = height;
                }
            }
            else if ( cssName == "itemHeight" )
            {
                accordionItem.style.height = FMCConvertToPx( document, cssValue, null, 28 ) + "px";
            }
            else if ( cssName == "backgroundImage" )
            {
				if ( cssValue != "none" )
				{
					cssValue = FMCStripCssUrl( cssValue );
					cssValue = decodeURIComponent( cssValue );

					accordionItem.getElementsByTagName( "td" )[0].style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + cssValue );
					accordionItem.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + cssValue );
					accordionIcon.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + cssValue );
					accordionIcon.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + cssValue );
                }
            }
            else if ( cssName == "backgroundImageHover" )
            {
				if ( cssValue != "none" )
				{
					cssValue = FMCStripCssUrl( cssValue );
					cssValue = decodeURIComponent( cssValue );

					accordionItem.setAttribute( "MadCap:overImage", FMCGetSkinFolderAbsolute() + cssValue );
					accordionIcon.setAttribute( "MadCap:overImage", FMCGetSkinFolderAbsolute() + cssValue );
	                
					FMCPreloadImage( FMCGetSkinFolderAbsolute() + cssValue );
				}
            }
            else if ( cssName == "backgroundGradient" )
            {
				var id		= accordionItem.id;
				var name	= id.charAt( 0 ).toUpperCase() + id.substring( 1 );
				
				accordionItem.getElementsByTagName( "td" )[0].style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + name + "Background.jpg" );
                accordionItem.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + name + "Background.jpg" );
                accordionIcon.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + name + "Background.jpg" );
                accordionIcon.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + name + "Background.jpg" );
            }
            else if ( cssName == "backgroundGradientHover" )
            {
				var id		= accordionItem.id;
				var name	= id.charAt( 0 ).toUpperCase() + id.substring( 1 );
				
				accordionItem.setAttribute( "MadCap:overImage", FMCGetSkinFolderAbsolute() + name + "Background_over.jpg" );
                accordionIcon.setAttribute( "MadCap:overImage", FMCGetSkinFolderAbsolute() + name + "Background_over.jpg" );
                
                FMCPreloadImage( FMCGetSkinFolderAbsolute() + name + "Background_over.jpg" );
            }
            else if ( cssName == "color" || cssName == "fontSize" )
            {
                accordionANode.style[cssName] = cssValue;
            }
            else if ( cssName.substring( 0, "border".length ) == "border" )
            {
				accordionItemOuterTable.style[cssName] = FMCConvertBorderToPx( document, cssValue );
            }
            else
            {
                accordionItem.style[cssName] = cssValue;
            }
        }
        
		var borderTopWidth		= FMCParseInt( FMCGetComputedStyle( accordionItemOuterTable, "borderTopWidth" ), 0 );
		var borderBottomWidth	= FMCParseInt( FMCGetComputedStyle( accordionItemOuterTable, "borderBottomWidth" ), 0 );
		var currHeight			= parseInt( FMCGetComputedStyle( accordionItem, "height" ) );

		accordionItemOuterTable.style.height = currHeight + "px";
		accordionItemInnerTable.style.height = (currHeight - borderTopWidth - borderBottomWidth) + "px";
    }
}

function Navigation_LoadFrameStyle( frameStyle )
{
    var styleClasses	= frameStyle.getElementsByTagName( "StyleClass" );
    
    for ( var i = 0; i < styleClasses.length; i++ )
    {
        var styleName	= styleClasses[i].getAttribute( "Name" );
        
        if ( styleName == "NavigationTopDivider" )
        {
			var navigationTop	= document.getElementById( "NavigationTop" );
			var properties		= styleClasses[i].getElementsByTagName( "Property" );
			
            for ( var j = 0; j < properties.length; j++ )
			{
				var cssName     = properties[j].getAttribute( "Name" );
				var cssValue    = FMCGetPropertyValue( properties[j], null );
	            
				if ( cssName == "Height" )
				{
					navigationTop.style.height = cssValue;
				}
				else if ( cssName == "BackgroundGradient" )
				{
					navigationTop.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + "NavigationTopGradient.jpg" );
				}
				else if ( cssName == "BackgroundImage" )
				{
					if ( cssValue != "none" )
					{
						cssValue = FMCStripCssUrl( cssValue );
						cssValue = decodeURIComponent( cssValue );

						navigationTop.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + cssValue );
					}
				}
			}
        }
        else if ( styleName == "NavigationDragHandle" )
        {
			var accordionExpander	= document.getElementById( "AccordionExpander" );
			var properties			= styleClasses[i].getElementsByTagName( "Property" );
			
            for ( var j = 0; j < properties.length; j++ )
			{
				var cssName     = properties[j].getAttribute( "Name" );
				var cssValue    = FMCGetPropertyValue( properties[j], null );
	            
				if ( cssName == "Height" )
				{
					accordionExpander.style.height = cssValue;
				}
				else if ( cssName == "BackgroundGradient" )
				{
					accordionExpander.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + "NavigationBottomGradient.jpg" );
					accordionExpander.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + "NavigationBottomGradient.jpg" );
				}
				else if ( cssName == "BackgroundGradientPressed" )
				{
					accordionExpander.setAttribute( "MadCap:selectedImage", FMCGetSkinFolderAbsolute() + "NavigationBottomGradient_selected.jpg" );
					
					FMCPreloadImage( FMCGetSkinFolderAbsolute() + "NavigationBottomGradient_selected.jpg" );
				}
				else if ( cssName == "BackgroundImage" )
				{
					if ( cssValue != "none" )
					{
						cssValue = FMCStripCssUrl( cssValue );
						cssValue = decodeURIComponent( cssValue );

						accordionExpander.style.backgroundImage = FMCCreateCssUrl( FMCGetSkinFolderAbsolute() + cssValue );
						accordionExpander.setAttribute( "MadCap:outImage", FMCGetSkinFolderAbsolute() + cssValue );
					}
				}
				else if ( cssName == "BackgroundImagePressed" )
				{
					if ( cssValue != "none" )
					{
						cssValue = FMCStripCssUrl( cssValue );
						cssValue = decodeURIComponent( cssValue );

						accordionExpander.setAttribute( "MadCap:selectedImage", FMCGetSkinFolderAbsolute() + cssValue );
						
						FMCPreloadImage( FMCGetSkinFolderAbsolute() + cssValue );
					}
				}
			}
        }
    }
}

function Navigation_LoadControlStyle( style )
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

			    try
			    {
			        if ( cssName == "Loading" )
			        {
			            parent.parent.gLoadingLabel = cssValue;
			        }
			        else if ( cssName == "LoadingAlternateText" )
			        {
			            parent.parent.gLoadingAlternateText = cssValue;
			        }
			    }
                catch (e)
			    {
                }
            }
		}
	}
}

function SetActiveIFrameByName( name )
{
    for ( var i = 0; i < gAccordionItems.length; i++ )
    {
        var accordionItem   = gAccordionItems[i];
        var id              = accordionItem.id;
        
        if ( id.substring( 0, id.lastIndexOf( "Accordion" ) ) == name )
        {
            var itemID  = parseInt( FMCGetMCAttribute( accordionItem, "MadCap:itemID" ) );
            var title   = accordionItem.getElementsByTagName( "a" )[0].firstChild.nodeValue;
            
            SetActiveIFrame( itemID, title );
            SetIFrameHeight();
            
            break;
        }
    }
}

function SetActiveIFrame(id, title)
{
    if (!gActiveItem)
    {
        return;
    }

    if (gInit)
    {
        FMCPostMessageRequest(MCGlobals.ToolbarFrame, "current-navigation-pane-changed", [title], null, function ()
        {
            var accordionTitle = parent.frames["mctoolbar"].document.getElementById("AccordionTitleLabel");

            if (accordionTitle != null)
            {
                accordionTitle.firstChild.nodeValue = title;
            }
        });
    }

    AccordionItemOnmouse(gActiveItem, gActiveItem.getElementsByTagName("td")[0], "MadCap:outImage");
    gActiveItem.onmouseout = AccordionItemOnmouseout;
    AccordionItemOnmouse(gActiveIcon, gActiveIcon, "MadCap:outImage");
    gActiveIcon.onmouseout = AccordionIconOnmouseout;
    gActiveIFrame.style.display = "none";
    gActiveIFrame.scrolling = "no";

    gActiveItem = gAccordionItems[id];
    gActiveItem.onmouseout = null;
    AccordionItemOnmouse(gActiveItem, gActiveItem.getElementsByTagName("td")[0], "MadCap:overImage");
    gActiveIcon = gAccordionIcons[id];
    gActiveIcon.onmouseout = null;
    AccordionItemOnmouse(gActiveIcon, gActiveIcon, "MadCap:overImage");
    gActiveIFrame = gIFrames[id];
    gActiveIFrame.style.display = "block";
    gActiveIFrame.scrolling = "auto";

    //

    var itemID = parseInt(FMCGetMCAttribute(gActiveItem, "MadCap:itemID"));
    var name = gIFrames[itemID].id;

    gActivePane = name;

    //

    // Do this to work around issue with setting focus to text fields in Firefox 1.5. This breaks IE so don't do it there.

    if (gActiveIFrame.focus && !gActiveIFrame.currentStyle)
    {
        gActiveIFrame.focus();
    }

    // -EVALUATE-
//    var searchFilter = frames["search"].document.getElementById("SearchFilter");

    if (gActiveIFrame.id == "index")
    {
        // -EVALUATE-
//        frames["index"].document.getElementById("searchField").focus();
    }
    else if (gActiveIFrame.id == "search")
    {
        // If focus() is called on searchField when its display is set to "none", IE throws an exception, so put it in a try block

        // -EVALUATE-
//        try
//        {
//            var searchForm = frames["search"].document.forms["search"];
//            searchForm.searchField.focus();
//        }
//        catch (err)
//        {
//        }

        // -EVALUATE-
//        if (searchFilter)
//        {
//            searchFilter.style.display = "inline";
//        }
    }
    else if (gActiveIFrame.id == "community")
    {
        gServiceClient.Init(function ()
        {
            if (!gActiveIFrame.src)
                gActiveIFrame.setAttribute("src", gServiceClient.PulseServer + "streams/my?frame=community");
        }, null, null);
    }

    //

    // -EVALUATE-
//    if (gActiveIFrame.id != "search")
//    {
//        if (searchFilter)
//        {
//            searchFilter.style.display = "none";
//        }
//    }

    SetupAccordion();
}

function SetIFrameHeight()
{
    var height  = FMCGetClientHeight( window, true );
    var currTop = height;
    
    var accordionIcons	= document.getElementById( "AccordionIcons" );
    
    currTop -= parseInt( FMCGetComputedStyle( accordionIcons, "height" ) );
    accordionIcons.style.top = currTop + "px";
    
    for ( var i = gAccordionItems.length - 1; i >= 0; i-- )
    {
        if ( i > gVisibleItems - 1 )
        {
            continue;
        }
        
        var accordionItem	= gAccordionItems[i];
        
        currTop -= (accordionItem.style.height ? parseInt( accordionItem.style.height ) : gcAccordionItemHeight);
        accordionItem.style.top = currTop + "px";
    }
    
    var accordionExpander	= document.getElementById( "AccordionExpander" );
    
    currTop -= parseInt( FMCGetComputedStyle( accordionExpander, "height" ) );
    accordionExpander.style.top = currTop + "px";
    
    var navigationTop	= document.getElementById( "NavigationTop" );
    
    currTop -= parseInt( FMCGetComputedStyle( navigationTop, "height" ) );
    
    for ( var i = 0; i < gIFrames.length; i++ )
    {
        var iframe	= gIFrames[i];
        
        if ( iframe == gActiveIFrame )
        {
            iframe.style.height = Math.max( currTop, 0 ) + "px";
            iframe.tabIndex = "2";
        }
        else
        {
            iframe.style.height = "1px";
            iframe.tabIndex = "-1";
        }
    }

    var indexFrame = frames["index"];

    FMCPostMessageRequest(indexFrame, "navigation-height-updated", [Math.max(currTop - 20, 0)], null, function ()
    {
        indexFrame.document.getElementById("CatapultIndex").parentNode.style.height = Math.max(currTop - 20, 0) + "px";
        indexFrame.RefreshIndex();
    });

    var searchFrame = frames["search"];
    var searchResultsTableHeight = Math.max(FMCGetClientWidth(window, false) - 25, 0);

    FMCPostMessageRequest(searchFrame, "navigation-height-updated", [searchResultsTableHeight, currTop], null, function ()
    {
        var searchResultsTable = searchFrame.document.getElementById("searchResultsTable");
        var searchResultsContainer = searchFrame.document.getElementById("SearchResults").parentNode;
        var searchResultsContainerHeight = Math.max(currTop - searchResultsContainer.offsetTop - 2, 0);

        searchResultsContainer.style.height = searchResultsContainerHeight + "px";

        if (searchResultsTable)
        {
            searchResultsTable.style.width = searchResultsTableHeight + "px";
        }
    });
}

function Navigation_OnMessage(e)
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

        if (message == "gActivePane")
        {
            responseData[responseData.length] = gActivePane;

            //

            handled = true;
        }
        else if (message == "set-default-pane-active")
        {
            SetActiveIFrame(gcDefaultID, gcDefaultTitle);

            //

            handled = true;
        }
        else if (message == "set-active-iframe")
        {
            var id = dataValues[0];
            var title = dataValues[1];

            SetActiveIFrame(id, title);
            SetIFrameHeight();

            if (MCGlobals.RootFrame.gNavigationState == "hidden")
            {
                MCGlobals.RootFrame.Default_ShowHideNavigation(true);
            }

            //

            handled = true;
        }
        else if (message == "set-active-iframe-by-name")
        {
            var name = dataValues[0];

            SetActiveIFrameByName(name);

            //

            handled = true;
        }
        else if (message == "get-client-width")
        {
            responseData[responseData.length] = document.documentElement.clientWidth;

            //

            handled = true;
        }
        else if (message == "get-client-height")
        {
            responseData[responseData.length] = document.documentElement.clientHeight;

            //

            handled = true;
        }
        else if (message == "set-nav-pane-height")
        {
            SetIFrameHeight();

            //

            handled = true;
        }
        else if (message == "forward-ajax-open-success")
        {
            var data = dataValues[0];
            var status = parseInt(dataValues[1]);
            var dest = dataValues[2];

            FMCPostMessageRequest(MCGlobals.BodyFrame, "ajax-open-success", [data, status, dest], null, null, true);

            //

            handled = true;
        }
        else if (message == "reload-community") {
            var communityFrame = frames["community"];
            if (communityFrame)
                FMCPostMessageRequest(communityFrame, "reload", null, null, null, true);

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

if ( gRuntimeFileType == "Navigation" )
{

var gInit					= false;
var gVisibleItems			= 7;
var gcMaxVisibleItems		= 7;
var gcAccordionItemHeight	= 28;
var gActivePane				= null;
var gActiveItem				= null;
var gActiveIcon				= null;
var gActiveIFrame			= null;
var gAccordionItems			= new Array();
var gAccordionIcons			= new Array();
var gIFrames				= new Array();
var gcDefaultID				= 0;
var gcDefaultTitle			= "Table of Contents";

window.onresize = function ()
{
    var width = Math.max(FMCGetClientWidth(window, true), 0);

    FMCPostMessageRequest(parent.frames["mctoolbar"], "navigation-resized", [width], function ()
    {
        SetIFrameHeight();
    }, function ()
    {
        var accordionTitle = parent.frames["mctoolbar"].document.getElementById("AccordionTitle");

        if (accordionTitle != null)
        {
            accordionTitle.style.width = width + "px";
        }

        SetIFrameHeight();
    });
};

gOnloadFuncs.push( Navigation_Init );

if (window.postMessage) {
    if (window.addEventListener)
        window.addEventListener("message", Navigation_OnMessage, false);
    else if (window.attachEvent)
        window.attachEvent("onmessage", Navigation_OnMessage);    
}

}
