TagExtension.prototype = new ShacknewsExtension;
TagExtension.prototype.constructor = TagExtension;

function TagExtension() {
	ShacknewsExtension.call(this, "Tag");
	
	this.extendShacknews();
	this.tags = ['lol', 'inf', 'unf', 'tag', 'wtf', 'ugh'];
}

/**
 *
 * Now that we are extended, install the lol link and wait
 * for posts and the lols to roll in.
 *
 */
TagExtension.prototype.extended = function(eventMessage) {
	if (document.getElementById("lollink") != null) {
		return;
	}
	this.installLink();
	this.initializeTagBars();
	this.listenForChanges();
	this.listenForPosts();
	
}
/**
 *
 * Installs the Lol link in the comment bar for easy checking.
 *
 */
TagExtension.prototype.installLink = function() {
	$("<a>[ L O L ` d ]</a>")
			.attr("id", "lollink")
			.attr("title", "Check out what got the [lol]s")
			.attr("href", ShacknewsExtension.LOL.URL + "?user=" + encodeURIComponent(this.getUsername()))
			.appendTo("div.commentstools:first");
}

/**
 *
 * Finds all the root posts and adds tag links to them
 *
 */
TagExtension.prototype.initializeTagBars = function() {
	//Let's grab all the root posts.
	var curExtension = this;
	
	ShacknewsExtension.getRootPosts().each(function(i, post) {
		curExtension.createTagBar(post);
	});
}

/**
 *
 * Creates a bar to be inserted into a root or fullpost
 *
 */
TagExtension.prototype.createTagBar = function(parentNode) {
	parentNode = $(parentNode);
	if ($("#lol_" + parentNode.attr("id").substr(5)).length != 0) {
		return;
	}
	
	var bar = $("<div></div>").attr("id", "lol_" + parentNode.attr("id").substr(5)).addClass("lol");
	for (var tag in this.tags) {
		bar.append(this.createButton(this.tags[tag], parentNode));
	}
	
	try {
		$(parentNode).find(".author:first").append(bar);
	} catch (e) {
		console.log("Unable to locate author element for node " + parentNode.id);
	}
}

/**
 *
 * Creates an individual tag for use in a tag bar.
 *
 */
TagExtension.prototype.createButton = function(tag, parentNode) {
	var curExtension = this;
	var button = $("<a></a>")
			.attr("id", tag + parentNode.attr("id").substr(5))
			.attr("href", "#")
			.text(tag)
			.addClass("lol_button " + tag)
			.bind("click", function(event) {
					curExtension.tagThread(tag, parentNode);
					event.preventDefault();
			});
			
	var tag_button = $("<span></span>").append("[").append(button).append("]");
	return tag_button;
}


/**
 *
 * Simple event handler to monitor node changes for when someone clicks on a new post to view.
 *
 */
TagExtension.prototype.listenForChanges = function() {
	var curExtension = this;
	
	document.addEventListener("DOMNodeInserted", function(event) {
	
		var element = $(event.srcElement);
		
		if (element.hasClass("fullpost")) {
			curExtension.createTagBar(element.parent());
			return;
		} else if (element.hasClass("root")) {
			//Do any fullposts
			element.find(".fullpost").each(function(elemIndex, post) {
				curExtension.createTagBar($(post).parent());
			});
		}
	});
}

/**
 *
 * Listener for the global file, since we can't hit lmnopc.com directly.
 *
 */
TagExtension.prototype.listenForPosts = function() {
	var curExtension = this;
	safari.self.addEventListener("message", function (eventMessage) { 
		if (eventMessage.name == "shackLolPosted") {
			curExtension.handlePostResponse(eventMessage.message);
		}
	}, false);
}

/**
 *
 * Receives the LolScript tag response and either removes the ability to retag it
 * or logs an error
 *
 */
TagExtension.prototype.handlePostResponse = function(returnProps) {

	if (typeof returnProps == "string") {
		console.log("Unable to parse response for tagging.");
		console.log(returnProps);
		return;
	}
	
	//Otherwise, change the tag.
	$("#" + returnProps.tag + returnProps.what)
			.attr("href", ShacknewsExtension.LOL.URL + "?user=" + encodeURIComponent(returnProps.who))
			.unbind("click")
			.text("* " + returnProps.tag.toUpperCase() + " ' D *");
			
	//TODO: Add code to store tag+post so that reloads still respect the tags.
}

TagExtension.prototype.tagThread = function(tagName, parentNode) {
	parentNode = $(parentNode);
	props = {
		who: this.getUsername(),
		what: parentNode.attr("id").substr(5),
		tag: tagName,
		version: ShacknewsExtension.LOL.VERSION,
		moderation: this.getModeration(parentNode)
	};
	
	safari.self.tab.dispatchMessage("shacknewsTagThread", props);
}

TagExtension.prototype.getModeration = function(parentNode) {
	var tags = ["fpmod_offtopic", "fpmod_nws", "fpmod_stupid", "fpmod_informative", "fpmod_political"];
	var fullpost = parentNode.find(".fullpost:first");
	for (var i = 0 in tags) {
	    if (fullpost.hasClass(tags[i])) {
	        return tags[i];
	    }
	}
	
	return "";
}

var tagExtension = new TagExtension();