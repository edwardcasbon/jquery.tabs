/**
* tabs: A jQuery plugin for adding tabs
* Author: Edward Casbon
* Email: edward@edwardcasbon.co.uk
* URL: http://www.edwardcasbon.co.uk
* Version: 1.4
* Date: 18th March 2015
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
		animationSpeed: 		180,
		scrollTo: 				true,
		scrollToOffset: 		0,
		pagination: 			true,
		reloadAjax: 			false,
		cacheAjax: 				false,
		template: {
			container: {
				atts: {},
				classes: ["container"]
			},
			nav: {
				links: {
					activeClass: "active"
				}
			},
			tab: {
				container: {
					classes: ["tab"]
				},
				ajaxContainer: {
					classes: ["ajax-container"]
				}
			},
			pagination: {
				container: {
					atts: {},
					classes: []
				},
				links: {
					prev: {
						atts: {},
						classes: [],
						preHtml: "",
						postHtml: ""
					},
					next: {
						atts: {},
						classes: [],
						preHtml: "",
						postHtml: ""
					}
				}
			}
		}
	};

	// IE8 check.
	var isIE8 = function() {
		// In IE8 positioned elements don't fade. We need to add filter:inherit css to rectify.
		return (window.navigator.userAgent.match("IE 8")) ? true : false;
	};

	// Set up the tabs.
	var initTabs = function(options){

		// Merge user options into settings.
		$.extend(true, settings, options);

		// Loop through the tabbed elements.
		return this.each(function(){
			// Add this tabbed element to the tabs stack.
			tabs.push(this);

			// Set up variables.
			var $this = $(this),
				$first = $this.find("." + settings.template.tab.container.classes.join(".")).first(),
				tabType = $first.get(0).nodeName,
				randomString = generateRandomString(4),
				counter = 1;

			// Add empty containers for the ajax'ed tabs, if any.
			$this.find("nav").first().find("a").each(function(){
				var $tabNav = $(this),
					$lastTab = $this.find("." + settings.template.tab.container.classes.join(".")).last();

				if($tabNav.attr("href").charAt(0) !== "#") {
					// Not an internal link, must be ajaxed.
					var id = $tabNav.attr("data-tab-id") || "tab-" + randomString + "-" + counter, // Unique ID for the tab.
						$container = $("<" + tabType + "/>").html("<div class=\"" + settings.template.tab.ajaxContainer.classes.join(" ") + "\"></div>").attr("id", id).addClass(settings.template.tab.container.classes.join(" "));
					counter++;
					$tabNav.attr("data-tab-id", id);
					$lastTab.after($container);
				}
			});

			// Wrap all the tabs in a container
			$this.find("." + settings.template.tab.container.classes.join(".")).wrapAll($("<div class=\"" + settings.template.container.classes.join(" ") + "\"/>")
				.css("height", $first.outerHeight(true))
				.css("clear", "both"));

			var $container = $this.find("." + settings.template.container.classes.join(".")).first();

			// Hide all tabs and show the first.
			$this.find("." + settings.template.tab.container.classes.join(".")).hide().first().show();

			// Set active tab.
			$this.find("nav li").first().addClass(settings.template.nav.links.activeClass);

			// IE8 bug fix
			if(isIE8()) {
				$this.find("*").css("filter", "inherit");
			}

			// Add listener for tab anchors
			$this.find("nav").first().find("a").on("click", function(e){
				var $this = $(this);

				if(!$this.parent('li').hasClass(settings.template.nav.links.activeClass)) {
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
				buildPagination($this);
			}

			$container.css("height", "auto");
		});
	};

	// Switch to a tab.
	var toggleTab = function(hash){
		$.each(tabs, function(){
			var $this = $(this); // $this = the tabbed element containing the tabs.

			if(($this.find(hash).length > 0) && ($this.find(hash).is("." + settings.template.tab.container.classes.join(".")))) {
				var $container 		= $this.find("." + settings.template.container.classes.join(".")),
					$activeTabNav	= $this.find("nav ." + settings.template.nav.links.activeClass),
					$activeTab 		= $this.find("." + settings.template.tab.container.classes.join(".") + ":visible"),
					$thisTabNav		= ($this.find("nav").first().find("a[href=\"" + hash + "\"]").length !== 0) ? $this.find("nav").first().find("a[href=\"" + hash + "\"]") : $this.find("nav a[data-tab-id=\"" + hash.replace("#", "") + "\"]"),
					$thisTab 		= $this.find(hash);

				// Scroll to the correct location on the page.
				if(settings.scrollTo) {
					$("html, body").animate({
						scrollTop: $this.offset().top + parseInt(settings.scrollToOffset)
					});
				}

				// Reset tabs
				$activeTabNav.removeClass(settings.template.nav.links.activeClass);
				$thisTabNav.parent('li').addClass(settings.template.nav.links.activeClass);

				// set fixed height before animating
				$activeTab.parent().css("height", $activeTab.outerHeight(true) + "px");

				// Fade out current article
				$activeTab.fadeOut(settings.animationSpeed, function(){

					// If Ajax, load in content.
					if($thisTabNav.attr("href").charAt(0) !== "#") {
						if(settings.reloadAjax || ($thisTab.find("." + settings.template.tab.ajaxContainer.classes.join(".")).html() === "")) {
							$.ajax({
								url: $thisTabNav.attr("href"),
								cache: settings.cacheAjax,
								success: function(data) {
									$thisTab.find("." + settings.template.tab.ajaxContainer.classes.join(".")).html(data);
								},
								error: function(request, status, error) {
									window.console.log("Error: " + error);
								}
							});
						}
					}

					// Hide next article (opacity 0)
					$thisTab.css({
						'filter': 'alpha(opacity=0)',
						'zoom': '1',
						'opacity': '0'
					});
					$thisTab.show();

					// run callback
					if(settings.onTabChange && typeof settings.onTabChange === 'function') {
						settings.onTabChange.call();
					}

					// Animate height difference on container
					$container.animate({
						height: $thisTab.outerHeight(true) + "px"
					}, {
						complete: function(){
							$thisTab.fadeTo(settings.animationSpeed, 1);

							// unset fixed height afer animating
							$thisTab.parent().css("height", "auto");
						},
						duration: settings.animationSpeed
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

	var buildPagination = function($container) {
		var tabCount = $container.find("." + settings.template.tab.container.classes.join(".")).length,
			$navigation = $container.find("nav");

		$container.find("." + settings.template.tab.container.classes.join(".")).each(function(index){
			var $tab = $(this),
				$pagination = $("<nav/>").addClass(settings.template.pagination.container.classes.join(" ")),
				$navItem,
				prevUrl, nextUrl;

			// Add pagination container attributes.
			for(var att in settings.template.pagination.container.atts) {
				$pagination.attr(att, settings.template.pagination.container.atts[att]);
			}

			if(index !== 0) {
				// Prev link
				$navItem = $navigation.find("a").eq(index-1);
				prevUrl = ($navItem.attr("href").charAt(0) === "#") ? $navItem.attr("href") : "#" + $navItem.attr("data-tab-id");
				var $prevLink = $("<a/>")
								.addClass("prev")
								.addClass(settings.template.pagination.links.prev.classes.join(" "))
								.attr("href", prevUrl)
								.html(settings.template.pagination.links.prev.preHtml + $navItem.html() + settings.template.pagination.links.prev.postHtml);
				$prevLink.appendTo($pagination);
			}

			if(index !== (tabCount-1)) {
				// Next link
				$navItem = $navigation.find("a").eq(index+1);
				nextUrl = ($navItem.attr("href").charAt(0) === "#") ? $navItem.attr("href") : "#" + $navItem.attr("data-tab-id");
				var $nextLink = $("<a/>")
								.addClass("next")
								.addClass(settings.template.pagination.links.next.classes.join(" "))
								.attr("href", nextUrl)
								.html(settings.template.pagination.links.next.preHtml + $navItem.html() + settings.template.pagination.links.next.postHtml);
				$nextLink.appendTo($pagination);
			}

			// Append the pagination to the article.
			$tab.append($pagination);
		});
	};

	// Return an object.
	return {
		initTabs: initTabs,
		toggleTab: toggleTab
	};

})(jQuery);

// Init the tabs functionality.
jQuery.fn.tabs = function(options) {
	window.tabs.initTabs.apply(this, [options]);
};

// Utility function to add a listener to an element.
window.addListener = function(el, event, callback) {
	if(el.addEventListener) {
		el.addEventListener(event, callback);
	} else if(el.attachEvent) {
		el.attachEvent('on' + event, callback);
	}
};

// If the hash changes then toggle the tab.
window.addListener(window, 'hashchange', function(){
	window.tabs.toggleTab(location.hash);
});

// Check to see if page has loaded with a hashed URL.
window.addListener(window, 'load', function(){
	if(location.hash !== '') {
		window.tabs.toggleTab(location.hash);
	}
});
