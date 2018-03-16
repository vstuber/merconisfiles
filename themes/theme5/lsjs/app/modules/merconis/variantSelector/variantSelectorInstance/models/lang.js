var obj_classdef_model = {
	name: 'lang',
	
	data: {
		text01: '__VARIANT_SELECTOR__'
	},

	start: function() {
		/*
		 * Every model needs to call the "this.__module.onModelLoaded()" method
		 * when its data is completely loaded and available or, since in some
		 * cases data is loaded later, when the model is ready for the view
		 * to be rendered.
		 */
		this.__module.onModelLoaded();
	}
};