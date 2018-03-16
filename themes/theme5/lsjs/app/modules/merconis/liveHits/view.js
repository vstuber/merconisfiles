(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_input: null,
	
	start: function() {
		this.el_input = typeOf(this.__models.options.data.var_inputField) === 'element' ? this.__models.options.data.var_inputField : $$(this.__models.options.data.var_inputField)[0];
		if (typeOf(this.el_input) !== 'element') {
			return;
		}
		
		/*
		 * Initialize __autoElements because we need to check it even before
		 * the first template is actually rendered and only after that if would
		 * have been created automatically.
		 */
		this.__autoElements = {
			hitselector: {}
		};
		
		this.el_input.setProperty('autocomplete', 'off');
		this.el_input.addEvent('keyup', this.handleKeyup.bind(this));
		this.el_input.addEvent('keydown', this.handleKeydown.bind(this));
		this.el_input.addEvent('click', this.__models.hits.getPossibleHits.bind(this.__models.hits));
		
		if (this.__models.configuration.data.liveHitsNoAutoPosition === false) {
			window.addEvent('resize', this.reactOnWindowResize.bind(this));
			window.addEvent('scroll', this.reactOnWindowResize.bind(this));
		}
	},
	
	reactOnWindowResize: function() {
		this.setHitSelectorPosition();
	},
	
	handleKeydown: function(event) {
		switch (event.key) {
			case 'up':
				this.focusPreviousOrNextHitElement('previous');
				break;
				
			case 'down':
				this.focusPreviousOrNextHitElement('next');
				break;
				
			case 'enter':
				if (this.fireCurrentlyFocusedHitElement()) {
					event.stop();
				}
				break;
		}
	},
	
	handleKeyup: function(event) {
		switch (event.key) {
			case 'up':
			case 'down':
				/*
				 * Do not do anything if the currently pressed key was the up or down key and if there already is
				 * a hit selector because in this case a hit has been selected and a new getPossibleHits request would create a
				 * new hit selector.
				 */
				if (this.__autoElements.hitselector.hitSelector != undefined && this.__autoElements.hitselector.hitSelector != null) {
					return;
				} else {
					this.__models.hits.getPossibleHits();
				}
				break;
				
			case 'esc':
				this.closeHitSelector();		
				break;
				
			default:
				this.__models.hits.getPossibleHits();
				break;
		}
	},
	
	focusPreviousOrNextHitElement: function(str_what) {
		if (this.__autoElements.hitselector.hitSelector === undefined || this.__autoElements.hitselector.hitSelector === null) {
			return;
		}
		
		var el_previousOrNextHitElement = null
		var el_currentlyFocusedHit = this.__autoElements.hitselector.hitSelector.getChildren('.hit.active')[0];
		
		if (el_currentlyFocusedHit === undefined || el_currentlyFocusedHit === null) {
			el_currentlyFocusedHit = this.__autoElements.hitselector.hitSelector.getChildren('.hit')[0];
		} else {
			switch (str_what) {
				case 'previous':
					el_previousOrNextHitElement = el_currentlyFocusedHit.getPrevious();
					break;
					
				case 'next':
				default:
					el_previousOrNextHitElement = el_currentlyFocusedHit.getNext();
					break;
			}
		}
		
		if (el_currentlyFocusedHit == undefined || el_currentlyFocusedHit == null) {
			return;
		}
		
		if (el_previousOrNextHitElement == undefined || el_previousOrNextHitElement == null) {
			el_previousOrNextHitElement = el_currentlyFocusedHit;
		}
		
		el_currentlyFocusedHit.removeClass('active');
		el_previousOrNextHitElement.addClass('active');
	},
	
	fireCurrentlyFocusedHitElement: function() {
		var el_currentlyFocusedHit = this.__autoElements.hitselector.hitSelector.getChildren('.hit.active')[0];
		if (el_currentlyFocusedHit !== undefined && el_currentlyFocusedHit !== null) {
			el_currentlyFocusedHit.fireEvent('click');
			return true;
		} else {
			return false;
		}
	},
	
	showHitSelector: function() {
		var self = this,
			el_parentForHitSelector;

		/*
		 * Close the hit selector if it is already opened
		 */
		this.closeHitSelector();
		
		$$('body')[0].addEvent('click', this.closeHitSelector.bind(this));

		if (this.__models.configuration.data.liveHitsNoAutoPosition) {
			el_parentForHitSelector = $$(this.__models.configuration.data.DOMSelector)[0];
		} else {
			el_parentForHitSelector = this.el_input.getParent();
		}
		
		this.tplAdd({
 			parent: el_parentForHitSelector,
			name: 'hitselector'
		});
		
		this.__autoElements.hitselector.hit.addEvent('click', function() {
			var str_fieldValueToSubmit,
				obj_hitValue;
				
			obj_hitValue = self.__models.hits.data[this.getProperty('data-hit-key')];
			
			if (obj_hitValue._linkToProduct != undefined && obj_hitValue._linkToProduct != null) {
				/*
				 * Redirect directly to the product details page if the link to the product is available
				 */
				window.location = obj_hitValue._linkToProduct;
			} else {
				/*
				 * If the hit is clicked, the hit title will be written into the
				 * input field and the input field or rather its form will be
				 * submitted.
				 * 
				 * If there is no hit title, the next best field value will be used.
				 */
				str_fieldValueToSubmit = obj_hitValue._title;
				if (str_fieldValueToSubmit === undefined || str_fieldValueToSubmit === null) {
					Object.each(obj_hitValue, function(value, str_fieldName) {
						if (str_fieldValueToSubmit !== undefined || str_fieldValueToSubmit !== null) {
							return;
						}
						str_fieldValueToSubmit = value;
					});
				}

				self.el_input.setProperty('value', str_fieldValueToSubmit);
				self.el_input.getParent('form').submit();
			}
		});
		
		this.setHitSelectorPosition();
	},
	
	setHitSelectorPosition: function() {
		if (
				this.__autoElements.hitselector.hitSelector === undefined || this.__autoElements.hitselector.hitSelector === null
			||	this.__autoElements.hitselector.hitSelectorOutside === undefined || this.__autoElements.hitselector.hitSelectorOutside === null
		) {
			return;
		}

		if (this.__models.configuration.data.liveHitsNoAutoPosition == true) {
			return;
		}
		this.__autoElements.hitselector.hitSelectorOutside.setPosition({
			x: this.el_input.getPosition().x - window.getScroll().x,
			y: (this.el_input.getPosition().y + this.el_input.getSize().y) - window.getScroll().y
		});
	},
	
	closeHitSelector: function() {
		$(document.body).removeEvent('click', this.closeHitSelector.bind(this));
		
		if (this.__autoElements.hitselector.hitSelector === undefined || this.__autoElements.hitselector.hitSelector === null) {
			return;
		}
		
		this.__autoElements.hitselector.hitSelectorOutside.getParent('.hitselector.liveHits').destroy();
		this.__autoElements.hitselector = {};
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();