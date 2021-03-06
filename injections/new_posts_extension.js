NewPostsExtension.prototype = new ShacknewsExtension;
NewPostsExtension.prototype.constructor = ShacknewsExtension;
var newPostsExtension = new NewPostsExtension();

/**
 *
 * This Extension highlights all new posts since your last viewing of the thread,
 * maintaining state across thread refreshes.
 *
 */
function NewPostsExtension() {
	ShacknewsExtension.call(this, "NewPosts");
	this.extendShacknews();
	this.rootManagerList = new Object();
	this.newPostList;
}


/**
 *
 * Extension hook for the New Posts routine.
 *
 */
NewPostsExtension.prototype.extended = function(message) {
	var curExtension = this;
	
	//Let's key off of the chatty as a breakpoint to clear our data.
	if (ShacknewsExtension.isNewChatty()) {
		localStorage.removeItem("newPostList");
	}
	
	//Now let's get our stored postings list
	try {
		this.newPostList = window.JSON.parse(localStorage.newPostList);
	} catch (e) {
		this.newPostList = new Object();
	}
	
	
	//Fire off a manager for the root posts!
	ShacknewsExtension.getRootPosts().each(function fireOffNewPostManager() {
		var manager = new NewPostRootManager(this, curExtension.getUsername(), curExtension.newPostList);
		curExtension.rootManagerList[this.id] = manager;
	});
	
	//Finally, let's wait for thread refreshes so everything can update correctly
	this.listenForReloads();
	
	this.saveNewPosts();
}

/**
 *
 * Callback for when a thread is reloaded.
 *
 */
NewPostsExtension.prototype.threadReloaded = function(thread) {
	this.rootManagerList[thread.attr("id")].reloaded();
	this.saveNewPosts();
}

/**
 *
 * Saves the new post into HTML 5 storage.
 *
 */
NewPostsExtension.prototype.saveNewPosts = function() {
	localStorage.setItem("newPostList", window.JSON.stringify(this.newPostList));
}

/**
 *
 * New post manager for specific root posts in the chatty.  This should find out what
 * new posts there are and update the list accordingly.
 *
 */
function NewPostRootManager(post, username, postList) {
	this.postId = post.id.substr(5);
	this.latestPost = null;
	this.user = username;
	this.newPostList = postList;
	this.reloaded();

}

/**
 *
 * Event handler for when a thread is reloaded or we are initialized.
 *
 */
NewPostRootManager.prototype.reloaded = function() {
	var postList = this.checkPosts();
	var curManager = this;
	$(postList).each(function() {
	
		//Make sure to set this as a reply to us if needed!
		$(this).addClass("shack_new_post");
		//TODO: Re-enable.
		//if ($(this).parent().closest("li").find('a[href^=/profile]:first').text().trim() == curManager.user) {
		//	$(this).addClass("shack_user_reply");
		//}
		
		//Make sure to unset our newness when clicked!
		$(this).find("span.oneline_body").bind("click.new_post", function unsetNewPostMarker(event) {
			$(this).parents("li.shack_new_post, li.shack_user_reply").andSelf().removeClass("shack_new_post shack_user_reply").unbind("click.new_post");
		});
	});
	
	this.newPostList[this.postId] = this.latestPost;
}

/**
 *
 * Checks all the posts we manage to find any new ones, setting which was the latest in the process.
 *
 */
NewPostRootManager.prototype.checkPosts = function() {
	var newerPosts = [];
	var curManager = this;
    $("#root_" + curManager.postId).find("li").each(function findNewestPostInThread() {
    	var newPostId = this.id.substr(5);
    	if (typeof curManager.newPostList[curManager.postId] == 'undefined' || newPostId > curManager.newPostList[curManager.postId]) {
    		newerPosts.push(this);
    	}
    	
    	if (newPostId > curManager.latestPost) {
    		curManager.latestPost = newPostId;
    	}
    });
    
    return newerPosts;
}