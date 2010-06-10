ProfileExtension.prototype = new ShacknewsExtension;
ProfileExtension.prototype.constructor = ProfileExtension;

function ProfileExtension() {
	ShacknewsExtension.call(this, "Profile");
	
	if (location.pathname.indexOf('/profile/') > -1) {
		this.extendShacknews();
	}
}

ProfileExtension.prototype.getUsername = function() {
	var header = document.getElementsByTagName("h3");
	return header[0].innerText;
}

ProfileExtension.prototype.extended = function(eventMessage) {
	var person = this.getUsername();
	var lols = document.createElement("a");
	var enableWinChatty = eventMessage.message;
	
	lols.style.color = 'white';
	lols.innerHTML = ' [<span style="color: orange; font-size: inherit; font-weight: bold; margin: 0; padding: 0 4px;">lol</span>]';
	lols.href = this.LOL_URL + "user.php?authoredby=" + escape(person);
	lols.target = "_blank";

	document.getElementsByTagName("h3")[0].appendChild(lols);

	var status = document.getElementsByClassName('status')[0];

	if (enableWinChatty) {
		var comments = status.lastElementChild.firstElementChild;
		comments.href = "http://winchatty.com/search.php?author=" + escape(person);
	}

	var search = document.createElement("li");
	search.innerHTML = '<a href="http://winchatty.com/search.php?terms=' + escape(person) + '">Vanity Search</a>';
	status.appendChild(search);

	var parent_author = document.createElement("li");
	parent_author.innerHTML = '<a href="http://winchatty.com/search.php?parentAuthor=' + escape(person) + '">Parent Author</a>';
	status.appendChild(parent_author);
}

var profileExtension = new ProfileExtension();