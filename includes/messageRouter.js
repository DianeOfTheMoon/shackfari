safari.application.addEventListener("message", canExtendShacknews, false);


/**
 *
 * Basic Message processor.
 *
 */
function canExtendShacknews(eventMessage) {
	if (eventMessage.name == "canExtendShacknews") {
		shacknewsExtensions(eventMessage);
	} else if (eventMessage.name == "shacknewsTagThread") {
		shackLolPost(eventMessage);
	}
}

function shacknewsExtensions(eventMessage) {
	var extendOption = eventMessage.message;
	
	if (safari.extension.settings.getItem("enable" + extendOption)) {
		var retData = extendOption;
		switch (extendOption) {
			case "Profile":
				retData = safari.extension.settings.enableWinChatty;
				break;
				
		}
		eventMessage.target.page.dispatchMessage("canExtendShacknews" + extendOption, retData);
	}
}


function shackLolPost(eventMessage) {
	var request = new XMLHttpRequest();
	var props = eventMessage.message;
	request.onreadystatechange = function() {
		if (request.readyState == 4) {
			if (request.status == 200) {
				eventMessage.target.page.dispatchMessage("shackLolPosted", eventMessage.message);
			} else {
				eventMessage.target.page.dispatchMessage("shackLolPosted", "Bad Return");
			}
		}
	};
	var url = "http://www.lmnopc.com/greasemonkey/shacklol/report.php?who=" + 
			props.who + "&what=" + props.what + "&tag=" + props.tag + "&version=" + props.version +  props.moderation;
			
	console.log("connecting to " + url);		
	request.open("GET", url, true);
	request.send("");
}
