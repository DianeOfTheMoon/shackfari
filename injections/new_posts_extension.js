NewPostsExtension.prototype = new ShacknewsExtension;
NewPostsExtension.prototype.constructor = ProfileExtension;

var newPostsExtension = new NewPostsExtension();

NewPostsExtension.newPostList;

function NewPostsExtension() {
	ShacknewsExtension.call(this, "NewPosts");
	this.extendShacknews();
	this.rootManagerList = new Object();
}

NewPostsExtension.prototype.extended = function(message) {
	var curExtension = this;
	
	if ($("span.date:first").text() != localStorage.chattyDate) {
		localStorage.removeItem("newPostList");
		localStorage.chattyDate = $("span.date:first").text();
	}
	
	try {
		NewPostsExtension.newPostList = window.JSON.parse(localStorage.newPostList);
	} catch (e) {
		NewPostsExtension.newPostList = new Object();
	}
	
	
	$(".root").each(function() {
		var manager = new NewPostRootManager(this, curExtension.getUsername());
		curExtension.rootManagerList[this.id] = manager;
	});
	

	$(document).bind("DOMNodeInserted", function(event) {
		var element = $(event.srcElement);
		if (element.hasClass("root")) {
			curExtension.rootManagerList[element.attr("id")].reloaded();
			curExtension.saveNewPosts();
		}
	});
	
	this.saveNewPosts();
}

NewPostsExtension.prototype.saveNewPosts = function() {
	localStorage.setItem("newPostList", window.JSON.stringify(NewPostsExtension.newPostList));
}

function NewPostRootManager(post, username) {
	this.postId = post.id.substr(5);
	this.latestPost = null;
	this.user = username
	this.reloaded();

}

NewPostRootManager.prototype.reloaded = function() {
	var postList = this.checkPosts();
	var curManager = this;
	$(postList).each(function() {
		$(this).addClass("shack_new_post");
		if ($(this).parent().parent().find("a[href^=/profile]:first").text().trim() == curManager.user) {
			$(this).addClass("shack_user_reply");
		}
		
		$(this).bind("click.new_post", function(event) {
			$(this).parents("li.shack_new_post, li.shack_user_reply").andSelf().removeClass("shack_new_post shack_user_reply").unbind("click.new_post");
		});
	});
	
	NewPostsExtension.newPostList[this.postId] = this.latestPost;
}

NewPostRootManager.prototype.checkPosts = function() {
	var newerPosts = [];
	var curManager = this;
    $("#root_" + curManager.postId).find("li").each(function() {
    	var newPostId = this.id.substr(5);
    	if (typeof NewPostsExtension.newPostList[curManager.postId] == 'undefined' || newPostId > NewPostsExtension.newPostList[curManager.postId]) {
    		newerPosts.push(this);
    	}
    	
    	if (newPostId > curManager.latestPost) {
    		curManager.latestPost = newPostId;
    	}
    });
    
    return newerPosts;
}