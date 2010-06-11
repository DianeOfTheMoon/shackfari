ProfileExtension.prototype = new ShacknewsExtension;
ProfileExtension.prototype.constructor = ProfileExtension;

var profileExtension = new ProfileExtension();

function ProfileExtension() {
	ShacknewsExtension.call(this, "Profile");
	
	if (location.pathname.indexOf('/profile/') > -1) {
		this.extendShacknews();
	}
}

/**
 *
 * We're looking for a different username than the base option,
 * so have to redefine it here.
 *
 */
ProfileExtension.prototype.getUsername = function() {
	return $("h3:first").text();
}

/**
 *
 * Now that we are extended, add in the profile options.
 *
 */
ProfileExtension.prototype.extended = function(eventMessage) {
	var person = this.getUsername();
	var lols = document.createElement("a");
	var enableWinChatty = eventMessage.message;
	
	lols.style.color = 'white';
	lols.innerHTML = ' [<span style="color: orange; font-size: inherit; font-weight: bold; margin: 0; padding: 0 4px;">lol</span>]';
	lols.href = ShacknewsExtension.LOL_URL + "user.php?authoredby=" + escape(person);
	lols.target = "_blank";

	$("h3:first").append(lols);

	var status = $('ul.status:first');

	if (enableWinChatty) {
		$("ul.status li:last").attr("href", "http://winchatty.com/search.php?author=" + escape(person));
	}

	var search = document.createElement("li");
	search.innerHTML = '<a href="http://winchatty.com/search.php?terms=' + escape(person) + '">Vanity Search</a>';
	status.appendChild(search);

	var parent_author = document.createElement("li");
	parent_author.innerHTML = '<a href="http://winchatty.com/search.php?parentAuthor=' + escape(person) + '">Parent Author</a>';
	status.appendChild(parent_author);
}