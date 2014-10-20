LOL =
{
	counts: null,
	processed_posts: false,
	tags: [
		{name: "lol", color: "#f80"},
		{name: "inf", color: "#09c"},
		{name: "unf", color: "#f00"},
		{name: "tag", color: "#7b2"},
		{name: "wtf", color: "#c000c0"},
		{name: "ugh", color: "#0b0"}
	],
	URL: "http://www.lmnopc.com/greasemonkey/shacklol/",
	VERSION: "20110419",
	COUNT_URL: "http://www.lmnopc.com/greasemonkey/shacklol/api.php?special=getcounts"
};

TagExtension.prototype = new ShacknewsExtension;
TagExtension.prototype.constructor = TagExtension;

function TagExtension() {
	ShacknewsExtension.call(this, "Tag");
	
	this.extendShacknews();
}

/**
 *
 * Now that we are extended, install the lol link and wait
 * for posts and the lols to roll in.
 *
 */
TagExtension.prototype.extended = function(eventMessage) {
	console.log('lol extension enabled.');
	if (document.getElementById("lollink") != null) {
		console.log('lol already installed. Skipping insertion');
		return;
	}

	this.listenForPosts();

	safari.self.tab.dispatchMessage("shacknewsGetLolCounts", LOL.COUNT_URL);
}

/**
 *
 * Installs the Lol link in the comment bar for easy checking.
 *
 */
TagExtension.prototype.installLinkAndCSS = function() {
	$("<a>[ L O L ` d ]</a>")
			.attr("id", "lollink")
			.attr("title", "Check out what got the [lol]s")
			.attr("href", LOL.URL + "?user=" + encodeURIComponent(this.getUsername()))
			.attr('target', '_blank')
			.appendTo("div.commentstools:first");

	var css = '';
	for (var i = 0; i < LOL.tags.length; i++)
	{
		css += '.oneline_tags .oneline_' + LOL.tags[i].name + ' { background-color: ' + LOL.tags[i].color + '; }\n';
	}

	var styleBlock = document.createElement('style');
	styleBlock.type = 'text/css';
	styleBlock.appendChild(document.createTextNode(css));

	document.getElementsByTagName('body')[0].appendChild(styleBlock);
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
	for (var tag in LOL.tags) {
		bar.append(TagExtension.createButton(LOL.tags[tag], parentNode));
	}

	try {
		$(parentNode).find(".author:first").append(bar);
	} catch (e) {
		console.log("Unable to locate author element for node " + parentNode.id);
		return; //No point in continuing.
	}

	var rootId = parentNode.closest('.root').attr('id').replace('root_', '');
	TagExtension.showThreadCounts(rootId);
}

/**
 *
 * Creates an individual tag for use in a tag bar.
 *
 */
TagExtension.createButton = function(tag, parentNode) {
	var curExtension = this;
	var button = $("<a></a>")
			.attr("id", tag.name + parentNode.attr("id").substr(5))
			.attr("href", "#")
			.text(tag.name)
			.addClass("lol_button " + tag.name)
			.bind("click", function(event) {
					TagExtension.tagThread(tag.name, parentNode);
					event.preventDefault();
			});
			
	var tag_button = $("<span></span>").append("[").append(button).append("]");
	return tag_button;
}


/**
 *
 * Simple event handler to monitor node changes for when someone clicks on a new post to view.
 * TODO: Change this to be aware of retrieved counts and show them in createTagBar
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
		if (eventMessage.name == "shackLolsGot") {
			curExtension.countsRetrieved(eventMessage.message);
		}
	}, false);
}

TagExtension.prototype.countsRetrieved = function (counts) {
	console.log('holy crap we got something!');

	this.installLinkAndCSS();
	this.initializeTagBars();
	this.listenForChanges();

	// Store original LOL.counts
	var oldLolCounts = LOL.counts;

	LOL.counts = JSON.parse(counts);

	// Call displayCounts again only if the counts have actually changed
	if (LOL.counts != oldLolCounts) {
		ShacknewsExtension.getRootPosts().each(function() {
			TagExtension.showThreadCounts(this.id.replace('root_', ''));
		})
	}
}

TagExtension.showThreadCounts = function(threadId)
{
	//Haven't gotten lol counts yet, so there's nothing to do here.
	if(LOL.counts === null) {
		return;
	}

	var rootId = -1;

	// Make sure this is a rootId
	if ($(document).find('#root_' + threadId))
	{
		rootId = threadId;
	}
	else
	{
		// If this is a subthread, the root needs to be found
		var liItem = $(document).find('#item_' + threadId);
		if (liItem.length != 0)
		{
			do
			{
				liItem = liItem.parentNode;

				if (liItem.className == 'root')
				{
					rootId = liItem.id.split('_')[1];
					break;
				}
			}
			while (liItem.parentNode != null)
		}
	}

	if (rootId == -1)
	{
		console.log('Could not find root for ' + threadId);
		return;
	}

	// If there aren't any tagged threads in this root there's no need to proceed
	if (!LOL.counts[rootId])
	{
		console.log('No lols for ' + rootId);
		return;
	}

	// Store the tag names in an array for easy comparisons in the loop
	var tag_names = [];
	for (var i = 0; i < LOL.tags.length; i++)
		tag_names.push(LOL.tags[i].name);

	// Update all the ids under the rootId we're in
	for (id in LOL.counts[rootId])
	{
		for (tag in LOL.counts[rootId][id])
		{
/*
TODO: Re-enable ughs.  This code needs help.  It probably won't work as-is
			// Evaluate [ugh]s
			// Must be root post, ughThreshold must be enabled, tag must be ugh, and counts have to be gte the ughThreshold
			if ((id == rootId) && (threadId == rootId) && (LOL.ughThreshold > 0) && (tag == 'ugh') && (LOL.counts[rootId][id][tag] >= LOL.ughThreshold)) {
				var root = $(document).find('#root_' + id);
				if (root.className.indexOf('collapsed') == -1)
				{
					var close = $(root).children('a.closepost');
					var show = $(root).children('a.showpost');
					close.click(function() { Collapse.close(id); });
					show.click(function() { Collapse.show(id); });
					root.className += " collapsed";
					show.className = "showpost";
					close.className = "closepost hidden";
				}
			}
*/

			//TODO: None of these options exist in shackfari.

			// If showCounts is configured as limited and this tag isn't in the user's list of tags, skip it
			if (((LOL.showCounts == 'limited') || (LOL.showCounts == 'short')) && (tag_names.indexOf(tag) == -1))
				continue;

			// Add * x indicators in the fullpost
			var tgt = $(document).find('#' + tag + id);

			//TODO: Dunno if this'll work.  But we should already have the lol div so it doesn't matter.
			//if (tgt.length === 0 && id == rootId)
			//{
			//	// create the button if it doesn't exist
			//	var lol_button = LOL.createButton(tag, id, '#ddd');
			//	var lol_div = $(document).find('#' + 'lol_' + id);
			//	lol_div.appendChild(lol_button);
            //
			//	// get the link
			//	tgt = $(document).find('#' + tag + id);
			//}

			if (tgt.length !== 0)
			{
				if (LOL.showCounts == 'short')
				{
					tgt.html(LOL.counts[rootId][id][tag]);
				}
				else
				{
					tgt.html(tag + ' &times; ' + LOL.counts[rootId][id][tag]);
				}
			}

			// Add (lol * 3) indicators to the onelines
			if ($(document).find('#' + 'oneline_' + tag + 's_' + id).length == 0)
			{
				tgt = $(document).find('#' + 'item_' + id);
				if (tgt.length !== 0)
				{
					tgt = $(tgt).children('div.oneline');
					if (tgt.length !== 0)
					{
						divOnelineTags = document.createElement('div');
						divOnelineTags.id = 'oneline_' + tag + 's_' + id;
						divOnelineTags.className = 'oneline_tags';
						tgt.append(divOnelineTags);

						// add the button
						spanOnelineTag = document.createElement('span');
						spanOnelineTag.id = 'oneline_' + tag + '_' + id;
						spanOnelineTag.className = 'oneline_' + tag;
						if (LOL.showCounts == 'short')
						{
							spanOnelineTag.appendChild(document.createTextNode(LOL.counts[rootId][id][tag]));
						}
						else
						{
							spanOnelineTag.appendChild(document.createTextNode(tag + ' × ' + LOL.counts[rootId][id][tag]));
						}
						divOnelineTags.appendChild(spanOnelineTag);
					}
				}
			}
			else
			{
				var span = $(document).find('#' + 'oneline_' + tag + '_' + id);
				if (span.length !== 0)
				{
					if (LOL.showCounts == 'short')
					{
						span.text(LOL.counts[rootId][id][tag]);
					}
					else
					{
						span.text(tag + ' × ' + LOL.counts[rootId][id][tag]);
					}
				}
			}
		}
	}
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
			.attr("href", LOL.URL + "?user=" + encodeURIComponent(returnProps.who))
			.unbind("click")
			.text("* " + returnProps.tag.toUpperCase() + " ' D *");
			
	//TODO: Add code to store tag+post so that reloads still respect the tags.
}

TagExtension.tagThread = function(tagName, parentNode) {
	parentNode = $(parentNode);
	props = {
		who: ShacknewsExtension.getUsername(),
		what: parentNode.attr("id").substr(5),
		tag: tagName,
		version: LOL.VERSION,
		moderation: TagExtension.getModeration(parentNode)
	};
	
	safari.self.tab.dispatchMessage("shacknewsTagThread", props);
}

TagExtension.getModeration = function(parentNode) {
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
