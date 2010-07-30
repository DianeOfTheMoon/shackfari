HighlightUsersExtension.prototype = new ShacknewsExtension;

var highlightUsersExtension = new HighlightUsersExtension();

function HighlightUsersExtension() {
	ShacknewsExtension.call(this, "HighlightUsers");
	this.extendShacknews();
}

HighlightUsersExtension.prototype.extended = function(message) {

	attachHighlightUsersCss();

	var curExtension = this;
	var cssText = '';
	
	
	ShacknewsExtension.getRootPosts().each(function initialUserHighlighting() {
		curExtension.threadReloaded($(this));
	});
	
	this.listenForReloads();
}


HighlightUsersExtension.prototype.threadReloaded = function(thread) {
	var classArray = $(thread).find("div.fullpost:first").attr("class").split(" ");
	var poster = '';
	for (var i = 0; i < classArray.length; i++) {
		if (classArray[i].substr(0, 9) == 'fpauthor_') {
			poster = classArray[i].substr(9);
			break;
		}
	}
	$(thread).find("div.olauthor_" + poster + " a.oneline_user").addClass("original_poster");
}

function attachHighlightUsersCss() {
	$('<link rel="stylesheet" type="text/css"  href="' + safari.extension.baseURI + 'user_highlight.css" />').appendTo("head");
}