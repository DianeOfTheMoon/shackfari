CommentTagsExtension.prototype = new ShacknewsExtension;
CommentTagsExtension.prototype.constructor = CommentTagsExtension;
var commentTags = new CommentTagsExtension();

function CommentTagsExtension() {
	ShacknewsExtension.call(this, "CommentTags");
	this.commentTags = null;
	this.extendShacknews();
}

CommentTagsExtension.prototype.extended = function() {
	var curExtension = this;
	document.addEventListener("DOMNodeInserted", function(event) {
		if ($("#postbox").length > 0) {
			curExtension.replyPosted(event);
		}
	});
}

CommentTagsExtension.prototype.replyPosted = function(event) {
	$("#postform").after(this.getCommentTags());
}

CommentTagsExtension.prototype.getCommentTags = function() {
	if (this.commentTags == null) {
		this.buildCommentTags();
	}
	
	return this.commentTags;
}

CommentTagsExtension.prototype.buildCommentTags = function() {
	this.commentTags = $('<div id="shack_comment_tags"><h4>Comment Tags</h4></div>');
	var colors = $('<dl id="shack_comment_colors"></dl>');
	var styles = $('<dl id="shack_comment_styles"></dl>');
	this.addListItem("red", "r{", "}r", colors);
	this.addListItem("green", "g{", "}g", colors);
	this.addListItem("blue", "b{", "}b", colors);
	this.addListItem("yellow", "y{", "}y", colors);
	this.addListItem("olive", "e[", "]e", colors);
	this.addListItem("limegreen", "l[", "]l", colors);
	this.addListItem("orange", "n[", "]n", colors);
	this.addListItem("pink", "p[", "]p", colors);
	
	this.addListItem("italics", "/[", "]/", styles);
	this.addListItem("bold", "b[", "]b", styles);
	this.addListItem("quote", "q[", "]q", styles);
	this.addListItem("sample", "s[", "]s", styles);
	this.addListItem("underline", "_[", "]_", styles);
	this.addListItem("strike", "-[", "]-", styles);
	this.addListItem("spoiler", "o[", "]o", styles);
	this.addListItem("code", "/{{", "}}/", styles);
	this.commentTags.append(colors).append(styles);
}

CommentTagsExtension.prototype.addListItem = function(name, startTag, closeTag, listItem) {
	var term = $("<span></span>").addClass("jt_" + name).text(name);
	if (name == "pink") {
		term.text("multisync");
	}
	
	if (name == "spoiler") {
		term.get(0).setAttribute("onclick", "return doSpoiler(event);");
	}
	var def = $("<a></a>").text(startTag + " ... " + closeTag).attr("href", "#").bind('click', function(event) {
		insertCommentTag(name, startTag, closeTag);
		event.preventDefault();
	});
	
	listItem.append($("<dt></dt>").append(term));
	listItem.append($("<dd></dd>").append(def));
}

function insertCommentTag(name, opening_tag, closing_tag) {
	var textarea = document.getElementById("frm_body");
	var scrollPosition = textarea.scrollTop;

	var start = textarea.selectionStart;
	var end = textarea.selectionEnd;

	var input;
	if (end > start)
		input = textarea.value.substring(start, end);
	else
		input = prompt("Type in the text you want to be " + name + ".", "");

	if (!input || input.length == 0)
	{
		textarea.focus();
		return;
	}

	// clean up the input
	var whiteSpaceBefore = false;
	var whiteSpaceAfter = false;
	if (name == "code")
	{
		whiteSpaceBefore = /^\s\s*/.test(input);
		whiteSpaceBefore = /\s\s*$/.test(input);
		input = input.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	else
	{
		// break up curly braces that confuse the shack
		input = input.replace(/^{/, '\n{').replace(/}$/, '}\n');
	}

	textarea.value = textarea.value.substring(0, start)
		+ (whiteSpaceBefore ? ' ' : '')
		+ opening_tag
		+ input
		+ closing_tag
		+ (whiteSpaceAfter ? ' ' : '')
		+ textarea.value.substring(end, textarea.value.length);

	var offset = whiteSpaceBefore ? 1 : 0;
	if (end > start)
	{
		offset += start + opening_tag.length;
		textarea.setSelectionRange(offset, offset + input.length);
	}
	else
	{
		offset += start + input.length + opening_tag.length + closing_tag.length;
		offset += (whiteSpaceAfter ? 1 : 0);
		textarea.setSelectionRange(offset, offset);
	}

	textarea.focus();
	textarea.scrollTop = scrollPosition;
}