CollapsePostsExtension.prototype = new ShacknewsExtension;
CollapsePostsExtension.prototype.constructor = ShacknewsExtension;

var collapsePostsExtension = new CollapsePostsExtension();

function CollapsePostsExtension() {
	ShacknewsExtension.call(this, "CollapsePosts");
	this.extendShacknews();
	this.collapsedList;
}

CollapsePostsExtension.prototype.extended = function() {
	var curExtension = this;
	
	if (this.isNewChatty(localStorage.collapsePostChatty)) {
		localStorage.collapsePostChatty = this.getChattyPost();
	}
	
	//Now let's get our stored collapsed list
	try {
		this.collapsedList = window.JSON.parse(localStorage.collapsedList);
	} catch (e) {
		this.collapsedList = new Array();
	}
	
	
	$("a.closepost").bind('click', function(event) {
		curExtension.addCollapsed(this);
	});
	
	$("a.showpost, div.refresh a").bind('click', function(event) {
		curExtension.removeCollapsed(this);
	});
	
	$(document).bind("DOMNodeInserted", function(event) {
		var curElem = $(event.srcElement);
		if (!curElem.hasClass("root")) {
			return;
		}
		
		curElem.find("a.closepost").bind('click', function(event) {
			curExtension.addCollapsed(this);
		});
		
		curElem.find("a.showpost, div.refresh a").bind('click', function(event) {
			curExtension.removeCollapsed(this);
		});
	});
	
	this.collapsePosts();
}

CollapsePostsExtension.prototype.addCollapsed = function(curElem) {
	if (this.collapsedList.indexOf(this.getPostId(curElem)) == -1) {
		this.collapsedList[this.collapsedList.length] = this.getPostId(curElem);
		this.saveCollapsed();
	}
}

CollapsePostsExtension.prototype.removeCollapsed = function(curElem) {
	this.collapsedList.splice(this.collapsedList.indexOf(this.getPostId(curElem)), 1);
	this.saveCollapsed();
}

CollapsePostsExtension.prototype.collapsePosts = function() {
	$.each(this.collapsedList, function() {
		var rootElem = $("#root_" + this);
		rootElem.addClass("collapsed");
		rootElem.find("a.closepost").addClass("hidden");
		rootElem.find("a.showpost").removeClass("hidden");
	});
}

CollapsePostsExtension.prototype.saveCollapsed = function() {
	localStorage.collapsedList = window.JSON.stringify(this.collapsedList);
}

CollapsePostsExtension.prototype.getPostId = function(postElem) {
	return $(postElem).closest("li").attr("id").substr(5);
}