ProfileExtension.prototype = new ShacknewsExtension;
var profileExtension = new ProfileExtension();

function ProfileExtension() {
	ShacknewsExtension.call(this, "Profile");
	
	if (location.pathname.indexOf('/profile/') > -1 || location.search.indexOf('chatty_user=') > -1) {
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
	return $("input#chatty_user").val();
}

/**
 *
 * Now that we are extended, add in the profile options.
 *
 */
ProfileExtension.prototype.extended = function(eventMessage) {
	var person = this.getUsername();
	if (person.length > 0) {
	  var lols = document.createElement("a");
  	var enableWinChatty = eventMessage.message;
  	
  	lols.innerHTML = ' [<span style="color: orange; font-size: inherit; font-weight: bold; margin: 0; padding: 0 4px;">lol</span>]';
  	lols.href = LOL.URL + "user.php?authoredby=" + escape(person);
  	lols.target = "_blank";
  
  	$("ul.search-nav").append("<li></li>");
  	$("ul.search-nav li:last").append(lols);
  
  	var status = $('ul.search-nav:first');
  
  	if (enableWinChatty) {
  		$("ul.search-nav li.on a").attr("href", "http://winchatty.com/nusearch?a=" + escape(person));
  	}
  
  	var search = $("<li></li>");
  	if (enableWinChatty) {
    	search.html('<a href="http://winchatty.com/nusearch?q=' + escape(person) + '">Vanity Search</a>');
  	} else {
      search.html('<a href="http://www.shacknews.com/search?chatty=1&type=4&chatty_term=' + escape(person) + '&chatty_user=&chatty_author=&chatty_filter=all&result_sort=postdate_desc">Vanity Search</a>');  	
  	}
  	status.append(search);
  
  	var parent_author = $("<li></li>");
  	if (enableWinChatty) {
    	parent_author.html('<a href="http://winchatty.com/nusearch?pa=' + escape(person) + '">Parent Author</a>');
  	} else {
    	parent_author.html('<a href="http://www.shacknews.com/search?chatty=1&type=4&chatty_term=&chatty_user=&chatty_author=' + escape(person) + '&chatty_filter=all&result_sort=postdate_desc">Parent Author</a>');
  	}
  	
  	status.append(parent_author);
	}
}