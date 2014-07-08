/**
* tabs: A jQuery plugin for adding tabs
* Author: Edward Casbon
* Email: edward@edwardcasbon.co.uk
* URL: http://www.edwardcasbon.co.uk
* Version: 1.1
* Date: 8th July 2014
*
* Example usage:
* $(".tabbable-component").tabs(options);
*
* Options:
* activeClass: "active" // HTML class for active elements.
* containerClass: "container" // HTML class for the tabbed container (Dynamically added).
* animationSpeed: 180 // Speed at which the tabs animate.
* scrollTo: true // Scroll to the selected tab.
* scrollToOffset: 0 // Offset for scroll to.
* pagination: true // Display pagination at the bottom of each article.
*
**/
window.tabs = (function($){
	
	// Tabs elements.
	var tabs = [];
	
	// Global plugin settings.
	var settings = {
		activeClass: 	"active",
		containerClass: "container",
		animationSpeed: 180,
		scrollTo: 		true,
		scrollToOffset: 0,
		pagination: 	true
	}; 
	
	// IE8 check.
	var isIE8 = function() {
		// In IE8 positioned elements don't fade. We need to add filter:inherit css to rectify.
		return (window.navigator.userAgent.match("IE 8")) ? true : false;
	};
	
	// Set up the tabs.
	var initTabs = function(options){
		
		// Merge user options into settings.
		$.extend(settings, options);
		
		// Loop through the tabbed elements.
		return this.each(function(){
			// Add this tabbed element to the tabs stack.
			tabs.push(this);
			
			// Set up variables.
			var $this = $(this),
				$first = $this.find("article").first();
				
			// Wrap all the articles in a container			
			$this.find("article").wrapAll($("<div class=\"" + settings.containerClass + "\"/>")
								.css("overflow", "hidden")
								.css("height", $first.outerHeight())
								.css("clear", "both"));
								
			var $container = $this.find("." + settings.containerClass).first();
					
			// Hide all articles and show the first.
			$this.find("article").hide().first().show();
			
			// Set active tab.
			$this.find("nav a").first().addClass(settings.activeClass);
			
			// IE8 bug fix
			if(isIE8()) {
				$this.find("*").css("filter", "inherit");
			}
			
			// Add listener.
			$this.find("nav a").on("click", function(e){
				var $this = $(this);
				if(!$this.hasClass(settings.activeClass)) {
					toggleTab($this.attr("href"));
				} else {
					// Stop re-loading of current tab.
					e.preventDefault();
				}
			});	
			
			// Add pagination.
			if(settings.pagination) {
				var articleCount = $this.find("article").length,
					$navigation = $this.find("nav");
				
				$this.find("article").each(function(index){
					var $article = $(this),
						$pagination = $("<nav/>").addClass("pagination"),
						$navItem;
					
					if(index !== 0) {
						// Prev link
						$navItem = $navigation.find("a").eq(index-1);
						var $prevLink = $("<a/>")
										.addClass("prev")
										.attr("href", $navItem.attr("href"))
										.html($navItem.html());
						$prevLink.appendTo($pagination);
					}
					
					if(index !== (articleCount-1)) {
						// Next link
						$navItem = $navigation.find("a").eq(index+1);
						var $nextLink = $("<a/>")
										.addClass("next")
										.attr("href", $navItem.attr("href"))
										.html($navItem.html());
						$nextLink.appendTo($pagination);
					}
				
					// Append the pagination to the article.
					$article.append($pagination);
				});
			}
			
			// Recalculate the height after the window has loaded.
			$(window).load(function(){
				$container.css("height", $this.find("article").first().outerHeight());
			});
		});
	};
	
	// Switch to a tab.
	var toggleTab = function(hash){
		$.each(tabs, function(){	
			var $this = $(this);
			if($this.find(hash).length > 0) {
				// $this = the tabbed element.
				var $container 		= $this.find("." + settings.containerClass),
					$activeTab 		= $this.find("nav ." + settings.activeClass),
					$activeArticle 	= $this.find("article:visible"),
					$thisTab 		= $this.find("nav a[href=\"" + hash + "\"]"),
					$thisArticle 	= $this.find(hash);
				
				// Scroll to the correct location on the page.
				if(settings.scrollTo) {
					$("html, body").animate({
						scrollTop: $this.position().top + parseInt(settings.scrollToOffset)
					});
				}
							
				// Reset tabs
				$activeTab.removeClass(settings.activeClass);
				$thisTab.addClass(settings.activeClass);
			
				// Fade out current article
				$activeArticle.fadeOut(settings.animationSpeed, function(){
				
					// Hide next article (opacity 0)
					$thisArticle.fadeTo(settings.animationSpeed, 0, function(){
						$thisArticle.show();
					
						// Animate height difference on container
						$container.animate({
							height: $thisArticle.outerHeight() + "px"
						}, {
							complete: function(){
								$thisArticle.fadeTo(settings.animationSpeed, 1);
							},
							duration: settings.animationSpeed
						});
					});
				});
			}
		});
	};
	
	// Return an object.	
	return {
		initTabs: initTabs,
		toggleTab: toggleTab
	};
	
})(jQuery);

// Init the tabs functionality.
$.fn.tabs = function(options) {
	window.tabs.initTabs.apply(this, [options]);
};

// If the hash changes then toggle the tab.
window.onhashchange = function(){
	window.tabs.toggleTab(location.hash);
};

// Check to see if page has loaded with a hashed URL.
window.onload = function() {
	if(location.hash !== "") {
		window.tabs.toggleTab(location.hash);
	}
};