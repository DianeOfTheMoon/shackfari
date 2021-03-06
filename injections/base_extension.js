function ShacknewsExtension(extensionName) {
	this.extension = extensionName;
	this.username = null;
	this.immediate = null;
}

ShacknewsExtension.rootPosts = null;
ShacknewsExtension.newChatty = false;

/**
 *
 * Centralized method to grab all the root posts
 *
 */
ShacknewsExtension.getRootPosts = function() {
	if (ShacknewsExtension.rootPosts == null) {
		ShacknewsExtension.rootPosts = $("div.root");
	}
	
	return ShacknewsExtension.rootPosts;
}

ShacknewsExtension.prototype.extended = function(event) {
	//Your code would extend from here
	alert('Extension ' + this.extension + ' unimplemented');
}

ShacknewsExtension.prototype.extendShacknews = function(immediateExecute, allPages) {
	
	var curExtension = this;
	this.immediate = immediateExecute;
	//Since scripts will run on all calls in shacknews, let's only register and run on the top window by default.
	if (allPages || window == window.top) {
		safari.self.tab.dispatchMessage("canExtendShacknews", curExtension.extension);
		safari.self.addEventListener("message", function extendShacknewsMessageHandler(eventMessage) { curExtension.checkExtended(eventMessage) }, false);
	}
}

ShacknewsExtension.prototype.checkExtended = function(eventMessage) {
	var messageName = eventMessage.name;
	var curExtension = this;
	if ("canExtendShacknews" + this.extension != messageName) {
		return;
	}
	
	if (this.immediate != null) {
		this.immediate();
	}
	
	$(document).ready(function processEnabledShacknewsExtension() {
		curExtension.extended(eventMessage);
	});
}

ShacknewsExtension.prototype.listenForReloads = function() {
	var curExtension = this;
	$(document).bind("DOMNodeInserted", function threadReloadHandler(event) {
		var thread = $(event.srcElement);
		
		if (thread.hasClass("root")) {
			curExtension.threadReloaded(thread);
		}
	});
}

ShacknewsExtension.prototype.threadReloaded = function(thread) {
	console.log("a thread was reloaded with " + this.extension + " listening, but it had no handler defined!");
}


/**
 *
 * Returns the current user's name.
 *
 */
ShacknewsExtension.prototype.getUsername = function() {
	return ShacknewsExtension.getUsername();
}

ShacknewsExtension.getUsername = function() {
	if (this.username == null) {
		this.username = $("#user_posts").text();
	}
	return this.username;
}

/**
 *
 * Determines if the chatty the script is on is a newer chatty than the last known.
 *
 */
ShacknewsExtension.isNewChatty = function() {
	if (localStorage.latestChattyPost == null || ShacknewsExtension.getChattyPost() > localStorage.latestChattyPost) {
		localStorage.latestChattyPost = ShacknewsExtension.getChattyPost();
		ShacknewsExtension.newChatty = true;
	};
	
	return ShacknewsExtension.newChatty;
}

/**
 *
 * Retrieves the current chatty post id. If the post id cannot be found,
 * this function returns null.
 *
 */
ShacknewsExtension.getChattyPost = function() {
	var chattyUrl = $("div.story a[href*=story]").attr("href");
	if (!chattyUrl) {
		return null;
	}
	return chattyUrl.substr(chattyUrl.indexOf("story") + 6);
}


// utility function to make an XMLHttpRequest
ShacknewsExtension.getUrl = function (url, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if (xhr.readyState == 4)
		{
			callback(xhr);
		}
	}
	xhr.open("GET", url, true);
	xhr.send();
}

ShacknewsExtension.putUrl = function (url, data, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4)
		{
			if(xhr != undefined && xhr != null)
			{
				callback(xhr);
			}
		}
	}
	xhr.open("PUT", url, true);
	xhr.send(data);
}

ShacknewsExtension.postUrl = function (url, data, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4)
		{
			if(xhr != undefined && xhr != null)
			{
				callback(xhr);
			}
		}
	}
	xhr.open("POST", url, true);
	xhr.send(data);
}

ShacknewsExtension.postFormUrl = function (url, data, callback)
{
	// It's necessary to set the request headers for PHP's $_POST stuff to work properly
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function()
	{
		if(xhr.readyState == 4)
		{
			if(xhr != undefined && xhr != null)
			{
				callback(xhr);
			}
		}
	}
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xhr.send(data);
}
