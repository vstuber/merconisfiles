(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
		this.__el_container = $$(this.__models.options.data.str_containerSelector)[0];
		if (typeOf(this.__el_container) !== 'element') {
			return;
			// console.error('__el_container is not an element');
		}
		
		/* ->
		 * Make sure not to handle the filter form more than once
		 */
		if (!this.__el_container.retrieve('alreadyHandledBy_' + str_moduleName)) {
			this.__el_container.store('alreadyHandledBy_' + str_moduleName, true);
		} else {
			return;
		}
		/*
		 * <-
		 */
		
		this.registerElements(this.__el_container, 'main', true);
		
		this.prepareHeadlineToggler();
		this.prepareFilterOptionBoxes();
	},
	
	prepareHeadlineToggler: function() {
		if (
				this.__autoElements.main.filterFormHeadline === undefined
			||	this.__autoElements.main.filterFormContent === undefined
		) {
			return;
		}
		
		lsjs.__moduleHelpers.unfold.start({
			str_initialToggleStatus: 'open',
			bln_toggleOnInitialization: false,
			bln_skipAnimationWhenTogglingOnInitialization: false,
			var_togglerSelector: this.__autoElements.main.filterFormHeadline,
			var_contentBoxSelector: this.__autoElements.main.filterFormContent,
			var_wrapperSelector: this.__el_container,
			str_cookieIdentifierName: this.__models.options.data.bln_storeToggleStatusInCookie ? 'lsUnfold_filterBox' : '',
			str_initialCookieStatus: this.__models.options.data.str_initialToggleStatus,
			obj_morphOptions: {
				'duration': 600
			}
		});
	},
	
	prepareFilterOptionBoxes: function() {
		if (this.__autoElements.main.filterOptionsBox !== undefined) {
			Array.each(this.__autoElements.main.filterOptionsBox, function(el_filterOptionsBox) {
				lsjs.createModule({
					__name: 'filterFormOptionsBox',
					__parentModule: this.__module,
					__el_container: el_filterOptionsBox
				});
			}.bind(this));
		}
		
		if (this.__autoElements.main.filterPriceBox !== undefined) {
			Array.each(this.__autoElements.main.filterPriceBox, function(el_filterPriceBox) {
				lsjs.createModule({
					__name: 'filterFormOptionsBox',
					__parentModule: this.__module,
					__el_container: el_filterPriceBox
				});
			}.bind(this));
		}
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();