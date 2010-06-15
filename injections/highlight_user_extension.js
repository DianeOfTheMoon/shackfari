HighlightUsersExtension.prototype = new ShacknewsExtension;

var highlightUsersExtension = new HighlightUsersExtension();

function HighlightUsersExtension() {
	ShacknewsExtension.call(this, "HighlightUsers");
	this.extendShacknews(attachHighlightUsersCss);
}

HighlightUsersExtension.prototype.extended = function(message) {

	var curExtension = this;
	var cssText = '';
	
	
	ShacknewsExtension.getRootPosts().each(function initialUserHighlighting() {
		curExtension.threadReloaded(this);
	});
	
	this.listenForReloads();
}


HighlightUsersExtension.prototype.threadReloaded = function(thread) {
	var poster = $(thread).find("div.fullpost:first").attr("class").replace(/.*fpauthor_(\d+).*/, "$1");
	$(thread).find("div.olauthor_" + poster + " a.oneline_user").addClass("original_poster");
}

function attachHighlightUsersCss() {
	document.write('<link rel="stylesheet" type="text/css"  href="' + safari.extension.baseURI + 'user_highlight.css" />');
}