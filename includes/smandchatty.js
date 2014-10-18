$(document).ready(function() {
  
		var xhr = new XMLHttpRequest();
		
		initialize();
		
		xhr.onreadystatechange = function(event) {
			if (xhr.readyState == 4 && xhr.status == 200) {
				var data = xhr.responseText;
				xhr.abort();
				updateLinks(data);
				data = null;
				event = null;
			}
		}
		
		setInterval(function () {
			xhr.open("GET", "http://www.shacknews.com/chatty");
		//	xhr.withCredentials = "true";
			xhr.send();
		}, 36000);
		
		xhr.open("GET", "http://www.shacknews.com/chatty");
	//	xhr.withCredentials = "true";
		xhr.send();
			
	});
	
	function initialize() {
	
		/**
		 *
		 * Bind to the latest chatty button to handle new tab/old tab functionality.
		 *
		 */
		$("#latestChatty").bind('click', function(event) {
			$(this).removeClass("newChatty");
			var tabFound = false;
			if (safari.extension.settings.getItem("barSmartOpen")) {
				$.each(safari.self.browserWindow.tabs, function () {
				    if (typeof this.url != 'undefined' &&this.url.indexOf("http://www.shacknews.com/chatty") > -1) {
						this.activate();
						tabFound = true;
				    }
				});
				console.log(tabFound);
				console.log(safari.self.browserWindow.activeTab.url);
				if (!tabFound && safari.self.browserWindow.activeTab.url != "") {
					console.log('here');
					var tab = safari.self.browserWindow.openTab();
					tab.activate();
				}
			}
			
			safari.self.browserWindow.activeTab.url = $("#latestChatty").attr("href");
			
			event.preventDefault();
		});
		
		if (safari.extension.settings.getItem("enableBarButtons")) {
			createBarButtons();
		}
	}
	
	function createBarButtons() {
		var bookmarks = $("<img id='bookmarks' prefix='BookmarksButton' src='../images/buttons/BookmarksButton.png' />");
		var topsites = $("<img id='topsites' prefix='TopSitesButton' src='../images/buttons/TopSitesButton.png' />");
		
		bookmarks.add(topsites).mouseover(function() {
			this.src = "../images/buttons/" + this.getAttribute("prefix") + "_Rollover.png";
		}).mouseout(function () {
			this.src = "../images/buttons/" + this.getAttribute("prefix") + ".png";
		});
		
		bookmarks.click(function () {
			safari.self.browserWindow.activeTab.url = "bookmarks://";
		});
		
		topsites.click(function () {
			safari.self.browserWindow.activeTab.url = "topsites://";
		});
		
		
		$("#latestChatty").before(bookmarks);
		$("#latestChatty").before(topsites);
	}
	
	function updateLinks(data) {
		//var curChattyLink = getLatestChattyLink(data);
		var username = getUsername(data);
		data = null;
		delete data;
		
		//if (curChattyLink == null) {
			//return;
		//}

		if (username != null) {
			var encodedName = encodeURIComponent(username);
			"http://www.shacknews.com/search?&chatty_filter=all&result_sort=postdate_desc&chatty=1&type=4&chatty_term=&chatty_user=" + encodedName + "&chatty_author="
			$("#profile").attr("href", "http://chattyprofil.es/p/" + encodedName);
			$("#vanity").attr("href", "http://www.shacknews.com/search?&chatty_filter=all&result_sort=postdate_desc&chatty=1&type=4&chatty_term=" + encodedName + "&chatty_user=&chatty_author=");
			$("#parent").attr("href", "http://www.shacknews.com/search?&chatty_filter=all&result_sort=postdate_desc&chatty=1&type=4&chatty_term=&chatty_user=&chatty_author=" + encodedName);
			$("#comments").attr("href", "http://www.shacknews.com/search?&chatty_filter=all&result_sort=postdate_desc&chatty=1&type=4&chatty_term=&chatty_user=" + encodedName + "&chatty_author=");
		}
		
		//var curChattyArticle = curChattyLink.replace(/.*href=".*onearticle.x\/(\d+).*/, "$1");
		//var curChattyText = curChattyLink.replace(/.*>(.*?)<.*/, "$1");
		
		//if ($("#latestChatty").attr("href") != "http://www.shacknews.com/laryn.x?story=" + curChattyArticle) {
		//	$("#latestChatty").addClass("newChatty");
		//}
		
		//$("#latestChatty").attr("href", "http://www.shacknews.com/laryn.x?story=" + curChattyArticle).text(curChattyText);
		
		
		return true;
	}
	
	/**
	 *
	 * Returns the username from the latest chatty page.
	 *
	 */
	function getUsername(data) {
		var linkMatches = data.match(/\<li class="user.*\<a href=.*\>.*?<\/a>/i);
		for (var i = 0; i < linkMatches.length; i++) {
			if (linkMatches[i].substr(0,2) == '<l') {
				return linkMatches[i].replace(/.*\>([^\>]*)<\/a.*/i, "$1");
			}
		}

		return null;
	}
	
	function getMessages(data) {
	}