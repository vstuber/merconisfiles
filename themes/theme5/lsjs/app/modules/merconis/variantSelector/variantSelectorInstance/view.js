(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = 	{
	start: function() {
	},
	
	showVariantSelector: function() {
		this.tplAdd({
			name: 'main'
		});
		
		this.__autoElements.main.btn_valueSelect.addEvent('click', function(event) {
			var	int_attributeId,
				int_valueId;
			
			int_attributeId = event.event.currentTarget.getProperty('data-lsjs-value-attributeId');
			int_valueId = event.event.currentTarget.getProperty('data-lsjs-value-valueId');
			this.__controller.selectAttributeValue(int_attributeId, int_valueId);
		}.bind(this));
	}
};

lsjs.addViewClass(str_moduleName, obj_classdef);

})();