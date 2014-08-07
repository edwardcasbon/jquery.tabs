/**
* tabs: A jQuery plugin for adding tabs
* Author: Edward Casbon
* Email: edward@edwardcasbon.co.uk
* URL: http://www.edwardcasbon.co.uk
* Version: 1.3
* Date: 7th August 2014
*
* Example usage:
* $(".tabbable-component").tabs(options);
*
* Options:
* activeClass: "active" // HTML class for active elements.
* containerClass: "container" // HTML class for the tabbed container (Dynamically added).
* tabClass: "tab" // HTML class for a tabbed piece of content.
* animationSpeed: 180 // Speed at which the tabs animate.
* scrollTo: true // Scroll to the selected tab.
* scrollToOffset: 0 // Offset for scroll to.
* pagination: true // Display pagination at the bottom of each article.
* reloadAjax: false // Reload the ajax content. False to only load content once.
* cacheAjax: false // Tell the browser whether to cache ajax requests.
* ajaxContainerClass: "ajax-container" // HTML class for ajax content container.
*
**/
window.tabs = (function($){
	
	// Tabs elements.
	var tabs = [];
	
	// Global plugin settings.
	var settings = {
		activeClass: 			"active",
		containerClass: 		"container",
		tabClass: 				"tab",
		animationSpeed: 		180,
		scrollTo: 				true,
		scrollToOffset: 		0,
		pagination: 			true,
		reloadAjax: 			false,
		cacheAjax: 				false,
		ajaxContainerClass: 	"ajax-container"
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
				$first = $this.find("." + settings.tabClass).first(),
				tabType = $first.get(0).nodeName,
				randomString = generateRandomString(4),
				counter = 1;
				
			// Add empty containers for the ajax'ed tabs, if any.
			$this.find("nav a").each(function(){
				var $tabNav = $(this),
					$lastTab = $this.find("." + settings.tabClass).last();
					
				if($tabNav.attr("href").charAt(0) !== "#") {
					// Not an internal link, must be ajaxed.
					var id = $tabNav.attr("data-tab-id") || "tab-" + randomString + "-" + counter, // Unique ID for the tab.
						$container = $("<" + tabType + "/>").html("<div class=\"" + settings.ajaxContainerClass + "\"></div>").attr("id", id).addClass(settings.tabClass);
					counter++;
					$tabNav.attr("data-tab-id", id);
					$lastTab.after($container);
				}
			});
				
			// Wrap all the tabs in a container			
			$this.find("." + settings.tabClass).wrapAll($("<div class=\"" + settings.containerClass + "\"/>")
								.css("overflow", "hidden")
								.css("height", $first.outerHeight(true))
								.css("clear", "both"));
								
			var $container = $this.find("." + settings.containerClass).first();
					
			// Hide all tabs and show the first.
			$this.find("." + settings.tabClass).hide().first().show();
			
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
					if($this.attr("href").charAt(0) !== "#") {
						e.preventDefault(); // Stop the loading of the new page.
						window.location.hash = $this.attr("data-tab-id"); // Update the hash to the ajax tab ID.
					}
				} else {
					// Stop re-loading of current tab.
					e.preventDefault();
				}
			});	
			
			// Add pagination.
			if(settings.pagination) {
				var tabCount = $this.find("." + settings.tabClass).length,
					$navigation = $this.find("nav");
				
				$this.find("." + settings.tabClass).each(function(index){
					var $tab = $(this),
						$pagination = $("<nav/>").addClass("pagination"),
						$navItem,
						prevUrl, nextUrl;
					
					if(index !== 0) {
						// Prev link
						$navItem = $navigation.find("a").eq(index-1);
						prevUrl = ($navItem.attr("href").charAt(0) === "#") ? $navItem.attr("href") : "#" + $navItem.attr("data-tab-id");
						var $prevLink = $("<a/>")
										.addClass("prev")
										.attr("href", prevUrl)
										.html($navItem.html());
						$prevLink.appendTo($pagination);
					}
					
					if(index !== (tabCount-1)) {
						// Next link
						$navItem = $navigation.find("a").eq(index+1);
						nextUrl = ($navItem.attr("href").charAt(0) === "#") ? $navItem.attr("href") : "#" + $navItem.attr("data-tab-id");
						var $nextLink = $("<a/>")
										.addClass("next")
										.attr("href", nextUrl)
										.html($navItem.html());
						$nextLink.appendTo($pagination);
					}
				
					// Append the pagination to the article.
					$tab.append($pagination);
				});
			}
			
			// Recalculate the height after the window has loaded.
			$(window).load(function(){
				$container.css("height", $this.find("." + settings.tabClass).first().outerHeight(true));
			});
		});
	};
	
	// Switch to a tab.
	var toggleTab = function(hash){
		$.each(tabs, function(){	
			var $this = $(this); // $this = the tabbed element containing the tabs.
			
			if($this.find(hash).length > 0) {
				var $container 		= $this.find("." + settings.containerClass),
					$activeTabNav	= $this.find("nav ." + settings.activeClass),
					$activeTab 		= $this.find("." + settings.tabClass + ":visible"),
					$thisTabNav		= ($this.find("nav").first().find("a[href=\"" + hash + "\"]").length !== 0) ? $this.find("nav").first().find("a[href=\"" + hash + "\"]") : $this.find("nav a[data-tab-id=\"" + hash.replace("#", "") + "\"]"),
					$thisTab 		= $this.find(hash);
				
				// Scroll to the correct location on the page.
				if(settings.scrollTo) {
					$("html, body").animate({
						scrollTop: $this.position().top + parseInt(settings.scrollToOffset)
					});
				}
							
				// Reset tabs
				$activeTabNav.removeClass(settings.activeClass);
				$thisTabNav.addClass(settings.activeClass);
			
				// Fade out current article
				$activeTab.fadeOut(settings.animationSpeed, function(){
				
					// If Ajax, load in content.
					if($thisTabNav.attr("href").charAt(0) !== "#") {
						if(settings.reloadAjax || ($thisTab.find("." + settings.ajaxContainerClass).html() === "")) {
							$.ajax({
								url: $thisTabNav.attr("href"),
								cache: settings.cacheAjax,
								success: function(data) {
									$thisTab.find("." + settings.ajaxContainerClass).html(data);
								},
								error: function(request, status, error) {
									window.console.log("Error: " + error);
								}
							});
						}
					}
				
					// Hide next article (opacity 0)
					$thisTab.fadeTo(settings.animationSpeed, 0, function(){
						$thisTab.show();
					
						// Animate height difference on container
						$container.animate({
							height: $thisTab.outerHeight(true) + "px"
						}, {
							complete: function(){
								$thisTab.fadeTo(settings.animationSpeed, 1);
							},
							duration: settings.animationSpeed
						});
					});
				});
			}
		});
	};
	
	var generateRandomString = function(length) {
		var string = "",
			possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i=0; i<length; i++) {
			string += possible.charAt(Math.floor(Math.random() * possible.length));
		}
		
		return string;
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