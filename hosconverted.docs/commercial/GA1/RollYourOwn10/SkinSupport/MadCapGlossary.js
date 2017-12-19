// {{MadCap}} //////////////////////////////////////////////////////////////////
// Copyright: MadCap Software, Inc - www.madcapsoftware.com ////////////////////
////////////////////////////////////////////////////////////////////////////////
// <version>10.0.0.0</version>
////////////////////////////////////////////////////////////////////////////////

function Glossary_Init()
{
    if ( gInit )
    {
        return;
    }

    var label = CMCFlareStylesheet.LookupValue("AccordionItem", "Glossary", "Label", null);

    if (label != null)
    {
        document.title = label;
    }

    var backgroundColor = CMCFlareStylesheet.LookupValue("Frame", "AccordionGlossary", "BackgroundColor", null);

    if (backgroundColor != null)
    {
        document.body.style.backgroundColor = backgroundColor;
    }

    //

    var masterHS = FMCGetHelpSystem();
    
    masterHS.LoadGlossary( LoadGlossaryOnComplete, null );
    
    //
    
    gInit = true;
}

function LoadGlossaryOnComplete( xmlDoc, args )
{
	if ( xmlDoc == null )
	{
		return;
	}
	
	var glossaryDoc	= MCGlobals.NavigationFrame.frames["glossary"].document;
	var body1		= glossaryDoc.getElementsByTagName( "body" )[0];
    
	if ( window.ActiveXObject )
	{
		var body2   = xmlDoc.getElementsByTagName( "body" )[0];
		
		if ( body2 == null )
		{
			return;
		}
        
		body1.innerHTML = body2.xml;
	}
	else if ( window.XMLSerializer )
	{
		var document1   = glossaryDoc;
		var serializer  = new XMLSerializer();
		var xmlAsString = serializer.serializeToString( xmlDoc );
        
		body1.innerHTML = xmlAsString;
	}

	// IE 6.0+ bug. When loading the glossary, we replace the document's body with XML. For some reason, this causes
    // the 11th line of the document to not render in IE. This works around that issue.
    
    var masterHS = FMCGetHelpSystem();
    
    if ( document.body.currentStyle && masterHS.IsMerged() )
    {
        setTimeout( SetGlossaryIFrameWidth, 50 );
    }
}

function SetGlossaryIFrameWidth()
{
    parent.document.getElementById( "glossary" ).style.width = "100%";
}

function DropDownTerm( anchorName )
{
    var anchors = document.getElementsByTagName( "a" );
    
    for ( var i = 0; i < anchors.length; i++ )
    {
        var anchor  = anchors[i];
        
        if ( anchor.name == anchorName )
        {
            if ( FMCGetChildNodesByTagName( anchor.parentNode.parentNode, "DIV" )[1].style.display == "none" )
            {
                FMCDropDown( anchor.parentNode.getElementsByTagName( "a" )[0] );
            }
            
            break;
        }
    }
    
    FMCScrollToVisible( window, anchor.parentNode.parentNode );
}

if ( gRuntimeFileType == "Glossary" )
{

//

if ( FMCIsDotNetHelp() || FMCIsHtmlHelp() )
{
	window.name = "glossary";
}

//

var gInit   = false;

if ( !FMCIsDotNetHelp() && !FMCIsHtmlHelp() )
{
	gOnloadFuncs.push( Glossary_Init );
}

}
