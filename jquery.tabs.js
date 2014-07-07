(function($){
	
	// Global plugin settings.
	var settings = {
		activeClass: "active",
		containerClass: "container",
		animationSpeed: 180
	};
	
	// Plugin starts here.
	$.fn.tabs = function(options) {
		
		// Merge user options into settings.
		$.extend(settings, options);
		
		return this.each(function(){
					
			var $this = $(this),
				$first = $this.find("article").first(),
				activeTab = $this.find("nav a").first().get(0),
				activeArticle = $this.find("article").first().get(0),
				$activeArticle = $(activeArticle);
				
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
								
			// Attach event listener
			$this.on("click", "nav a", function(e){
				e.preventDefault();
				toggle.apply(e.target);
			});
												
			function toggle() {
				$this = $(this);
				if(activeTab !== this) {
					
					// Reset tabs
					$(activeTab).removeClass(settings.activeClass);
					activeTab = false;
					$this.addClass(settings.activeClass);
					activeTab = $this.get(0);
					
					// Fade out current article
					$(activeArticle).fadeOut(130, function(){
						// Reset active article.
						activeArticle = false;
						
						// Hide next article (opacity 0)
						activeArticle = $($this.attr('href')).get(0);
						$activeArticle = $(activeArticle);
						$activeArticle.fadeTo(settings.animationSpeed, 0, function(){
							$(this).show();
							
							// Animate height difference on container
							$container.animate({
								height: $activeArticle.outerHeight() + "px"
							}, {
								complete: function(){
									$activeArticle.fadeTo(settings.animationSpeed, 1);
								},
								duration: settings.animationSpeed
							});
						});
					});
				}								
			}
			
			function isIE8() {
				// In IE8 positioned elements don't fade. We need to add filter:inherit css to rectify.
				return (window.navigator.userAgent.match("IE 8")) ? true : false;
			}
			
			// IE8 bug fix
			if(isIE8()) {
				$this.find("*").css("filter", "inherit");
			}	
			
			// Recalculate the height after the window has loaded.
			$(window).load(function(){
				$container.css("height", $this.find("article").first().outerHeight());
				
			});		
		});		
	};
})(jQuery);