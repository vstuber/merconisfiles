(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	el_showAndHideOptionsIcon: null,
	
	str_displayStyleFilterOptions: 'block',
	
	start: function() {
		this.registerElements(this.__el_container, 'main');
		
		if (this.__autoElements.main.optionsBox_filterOption === undefined) {
			this.__autoElements.main.optionsBox_filterOption = new Elements();
		}
		this.prepare();
		this.hideAllPossibleOptions();
	},
	
	prepare: function() {
		var self = this;
		
		this.__el_container.addClass('usingJS');
		this.el_showAndHideOptionsIcon = new Element('div.showAndHideOptionsIcon');
		
		this.el_showAndHideOptionsIcon.addEvent('click', function() {
			if (this.hasClass('currentlyHiding')) {
				self.showAllOptions();
			} else {
				self.hideAllPossibleOptions();
			}
		});
		
		if (this.__autoElements.main.optionsBox_filterOptionsWrapper !== undefined) {
			this.__autoElements.main.optionsBox_filterOptionsWrapper.adopt(this.el_showAndHideOptionsIcon);
		} else {
			this.__autoElements.main.optionsBox_content.adopt(this.el_showAndHideOptionsIcon);
		}
		
		this.hideShowAndHideOptionsIconIfUnneeded();
		
		Array.each(this.__el_container.getElements('[data-lsjs-element="optionsBox_filterOption"] input'), function(el_filterOptionInput) {
			self.markInputFieldSelectStatus(el_filterOptionInput);
			el_filterOptionInput.addEvent('change', function() {
				self.hideShowAndHideOptionsIconIfUnneeded();
				self.markInputFieldSelectStatus(this);
			});
		});
		
		var el_firstFilterOption = this.__autoElements.main.optionsBox_filterOption[0];
		if (typeOf(el_firstFilterOption) === 'element') {
			this.str_displayStyleFilterOptions = el_firstFilterOption.getStyle('display');
		}
		
		this.initializeCheckAllField();
		
		lsjs.__moduleHelpers.unfold.start({
			str_initialToggleStatus: 'open',
			bln_toggleOnInitialization: this.__el_container.hasClass('startClosedIfNothingSelected') && this.check_noOptionIsChecked() ? true : false,
			bln_skipAnimationWhenTogglingOnInitialization: this.__el_container.hasClass('startClosedIfNothingSelected') && this.check_noOptionIsChecked() ? true : false,
			var_togglerSelector: this.__autoElements.main.optionsBox_label,
			var_contentBoxSelector: this.__autoElements.main.optionsBox_content,
			var_wrapperSelector: this.__el_container,
			obj_morphOptions: {
				'duration': 600
			}
		});
	},
	
	initializeCheckAllField: function() {
		var self = this;
		
		if (this.__autoElements.main.optionsBox_checkAll === undefined) {
			return;
		}
		
		this.__autoElements.main.optionsBox_checkAll.setStyle('display', this.str_displayStyleFilterOptions);
		
		this.__autoElements.main.optionsBox_checkAll.getElement('input').addEvent('change', function() {
			Array.each(self.__autoElements.main.optionsBox_filterOption.filter(':not(.checkAll)'), function(el_filterOption) {
				var el_filterOptionInput;
				
				if (el_filterOption.hasClass('hidden')) {
					return;
				}
				
				el_filterOptionInput = el_filterOption.getElement('input');
				el_filterOptionInput.setProperty('checked', this.getProperty('checked'));
				el_filterOptionInput.fireEvent('change');
			}.bind(this));
		});
	},
	
	markInputFieldSelectStatus: function(el_input) {
		if (el_input.getProperty('checked')) {
			el_input.getParent('[data-lsjs-element="optionsBox_filterOption"]').addClass('checked');
			el_input.getParent('[data-lsjs-element="optionsBox_filterOption"]').removeClass('unchecked');
		} else {
			el_input.getParent('[data-lsjs-element="optionsBox_filterOption"]').removeClass('checked');
			el_input.getParent('[data-lsjs-element="optionsBox_filterOption"]').addClass('unchecked');
		}
		
		if (el_input.getProperty('type') == 'radio') {
			/*
			 * If we have an input field of the radio type, we have to
			 * look for the other radio button that has been selected
			 * previously but did not trigger a change event and therefore
			 * still has the checked class. In fact we look for the currently
			 * clicked radio button's parent container, walk through all of
			 * the contained radio buttons and reset the class status
			 * of all currently unchecked radio buttons
			 */
			Array.each(el_input.getParent('[data-lsjs-element="filterOptionsBox"]').getElements('[data-lsjs-element="optionsBox_filterOption"] input'), function(el_inputRadio) {
				if (!el_inputRadio.getProperty('checked')) {
					el_inputRadio.getParent('[data-lsjs-element="optionsBox_filterOption"]').removeClass('checked');
					el_inputRadio.getParent('[data-lsjs-element="optionsBox_filterOption"]').addClass('unchecked');
				}
			});
		}
	},
	
	hideShowAndHideOptionsIconIfUnneeded: function() {
		var obj_numOptions = this.getNumOptions();
		
		if (obj_numOptions.hideableOptions <= 0) {
			this.el_showAndHideOptionsIcon.addClass('hidden');
		} else {
			this.el_showAndHideOptionsIcon.removeClass('hidden');
		}
		
		if (obj_numOptions.hiddenOptions <= 0) {
			this.el_showAndHideOptionsIcon.removeClass('currentlyHiding');
			this.el_showAndHideOptionsIcon.addClass('currentlyShowing');
		} else {
			this.el_showAndHideOptionsIcon.addClass('currentlyHiding');
			this.el_showAndHideOptionsIcon.removeClass('currentlyShowing');
		}
	},
	
	getNumOptions: function() {
		var obj_return = {
			'allOptions': 0,
			'hiddenOptions': 0,
			'displayedOptions': 0,
			'importantOptions': 0,
			'unimportantOptions': 0,
			'checkedOptions': 0,
			'uncheckedOptions': 0,
			'hideableOptions': 0,
			'unhideableOptions': 0
		}
		Array.each(this.__autoElements.main.optionsBox_filterOption, function(el_filterOption) {
			obj_return.allOptions++;
			
			var bln_isImportant = false;
			var bln_isChecked = false;
			
			if (el_filterOption.hasClass('important')) {
				obj_return.importantOptions++;
				bln_isImportant = true;
			} else {
				obj_return.unimportantOptions++;
			}
			
			if (el_filterOption.getElement('input').getProperty('checked')) {
				obj_return.checkedOptions++;
				bln_isChecked = true;
			} else {
				obj_return.uncheckedOptions++;
			}
			
			if (bln_isImportant || bln_isChecked) {
				obj_return.unhideableOptions++;
			} else {
				obj_return.hideableOptions++;
			}
			
			if (el_filterOption.hasClass('hidden')) {
				obj_return.hiddenOptions++;
			} else {
				obj_return.displayedOptions++;
			}
		});
		
		/*
		 * If there are no options marked as important, we can't know
		 * which options should be considered hideable, so we set the
		 * number of hideableOptions to 0.
		 */
		if (obj_return.importantOptions <= 0) {
			obj_return.hideableOptions = 0;
			obj_return.unhideableOptions = obj_return.unimportantOptions;
		}
		return obj_return;
	},
	
	check_noOptionIsChecked: function() {
		var int_numChecked = 0;
		Array.each(this.__autoElements.main.optionsBox_filterOption, function(el_filterOption) {
			if (el_filterOption.getElement('input').getProperty('checked')) {
				int_numChecked++;
			}
		});
		
		if (int_numChecked <= 0) {
			return true;
		} else {
			return false;
		}		
	},
	
	hideAllPossibleOptions: function() {
		/*
		 * Don't hide anything if there are no important options
		 */
		var arr_importantOptions = this.__autoElements.main.optionsBox_filterOption.filter('.important');
		if (arr_importantOptions.length <= 0) {
			return;
		}
		
		Array.each(this.__autoElements.main.optionsBox_filterOption, function(el_filterOption) {
			if (el_filterOption.hasClass('important') || el_filterOption.getElement('input').getProperty('checked')) {
				return;
			}
			
			el_filterOption.addClass('hidden');
		});
		this.el_showAndHideOptionsIcon.addClass('currentlyHiding');
		this.el_showAndHideOptionsIcon.removeClass('currentlyShowing');
	},
	
	showAllOptions: function() {
		Array.each(this.__autoElements.main.optionsBox_filterOption, function(el_filterOption) {
			el_filterOption.removeClass('hidden');
		});
		this.el_showAndHideOptionsIcon.removeClass('currentlyHiding');
		this.el_showAndHideOptionsIcon.addClass('currentlyShowing');
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();