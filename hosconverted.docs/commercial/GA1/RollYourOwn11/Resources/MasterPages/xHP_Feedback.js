//Modified: January 15, 2013
document.write('<div id=\"hp-feedbackDimmedDiv\" style="background-color: #003366; position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; z-index: 3; display: none; filter: alpha(opacity = 25); opacity: .25;">&nbsp;</div>');
					
function sendFeedback() {
	
	//call MadCap function to clear search highlights
	//remmed out for HTML5, works fine for WebHelp too
	//FMCClearSearch(window);

	var feedbackVariables = document.getElementById("hp-feedback-variables");
	var productName = feedbackVariables.getAttribute("productName");
	var productVersion = feedbackVariables.getAttribute("productVersion");
	var commentsEmailAddress = feedbackVariables.getAttribute("commentsEmailAddress");
	
	//Sivia added the next few lines
	//check for non-Latin characters in topic title
	var string = feedbackVariables.getAttribute("topicTitle");
	result=/[^\u0000-\u00ff]/.test(string);
	if (result)
		var firstheading = '';
	else
		var firstheading = feedbackVariables.getAttribute("topicTitle");
	//end of added lines
	
	var productAcronym = feedbackVariables.getAttribute("productAcronym");


	
	if (productAcronym.length > 0)
		productAcronym = " (" + productAcronym + ")";
	
	topicURL = document.URL.match(/\w+\.chm.+/);
	if (!topicURL) topicURL = document.URL.match(/[\w-]*\.htm\w?|[\w-_]*\.xsl/i);
	topicURL = topicURL.toString().replace(/[\?&=#]/g, "");
	
	line = '_______________________________________________________________%0D%0A';
	
	emailBody = document.getElementById('hp-feedbackBody').innerHTML;
	emailBody = emailBody.replace(/<span id="?hp-feedbackURL"?><\/span>/i, topicURL);
	emailBody = emailBody.replace(/<span id="?hp-feedbackProduct"?><\/span>/i, productName);
	emailBody = emailBody.replace(/<span id="?hp-feedbackVersion"?><\/span>/i, productVersion);
	emailBody = emailBody.replace(/<span id="?hp-feedbackTopic"?><\/span>/i, firstheading);
	emailBody = emailBody.replace(/<span id="?hp-feedbackAcronym"?><\/span>/i, productAcronym);
	//	emailBody = emailBody.replace(//,"");
	
	document.getElementById('hp-feedbackBody').innerHTML = emailBody;
			
	emailBody = emailBody.replace(/<br>/gi, "%0D%0A");
	emailBody = emailBody.replace(/&nbsp;/g, " ");
	
	document.getElementById('hp-feedbackOpen').href = 'mailto:' + commentsEmailAddress + '?subject=Feedback on ' + productName + " " + productVersion + " documentation: " + firstheading + '&body=' + line + emailBody + line; <!-- Localizable -->	
	
	dimDiv = document.getElementById('hp-feedbackDimmedDiv');
	dimDiv.style.display = "block";
	dimDiv.onclick = closeFeedback;
	
	fbDiv = document.getElementById('hp-feedbackDiv');
	fbDiv.className = "hp-feedbackDiv";
	fbDiv.style.position = "fixed";
	fbDiv.style.zIndex = "4";
	fbDiv.style.backgroundColor = "white";
	fbDiv.style.borderWidth = "thin";
	fbDiv.style.borderColor = "black";
	fbDiv.style.borderStyle = "solid";
	fbDiv.style.padding = "10px";
	fbDiv.style.width = "70%";

	fbDiv.style.left = "15%";
	fbDiv.style.top = "15%";
	fbDiv.style.display = "block";	
}

function closeFeedback()
{
	document.getElementById('hp-feedbackDiv').className = "MCTextPopupBody";
	document.getElementById('hp-feedbackDiv').style.display = "none";
	document.getElementById('hp-feedbackDimmedDiv').style.display = "none";	
}