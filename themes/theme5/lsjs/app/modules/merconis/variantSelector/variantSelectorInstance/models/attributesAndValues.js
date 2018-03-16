var obj_classdef_model = {
	name: 'attributesAndValues',
	
	data: {
		int_productVariantId: 0,
		int_numMatchingVariants: 0,
		
		obj_allAttributeValues: {},
		obj_selectedAttributeValues: {},
		obj_possibleAttributeValues: {}
	},

	start: function() {
		/*
		 * Every model needs to call the "this.__module.onModelLoaded()" method
		 * when its data is completely loaded and available or, since in some
		 * cases data is loaded later, when the model is ready for the view
		 * to be rendered.
		 */
		this.__module.onModelLoaded();
	},
	
	setProductVariantId: function(int_productVariantId) {
		if (int_productVariantId === undefined) {
			console.error('int_productVariantId not given');
		}
		
		this.writeData('int_productVariantId', int_productVariantId);
	},
	
	setProductId: function(int_productId) {
		if (int_productId === undefined) {
			console.error('int_productId not given');
		}
		
		this.writeData('int_productId', int_productId);
	},
	
	loadAttributesAndValues: function(func_onSuccess) {
		lsjs.loadingIndicator.__controller.show();
		
		lsjs.apiInterface.request({
			str_resource: 'variantSelector_getInitialData',
			obj_params: {
				productVariantId: this.readData('int_productVariantId')
			},
			func_onSuccess: function(obj_data) {
				/*
				 * While an associative array sent by php via json will be converted
				 * into an object, an empty array still remains an empty array.
				 * Since we expect objects, we have to make sure to create an
				 * empty object if we have an array instead of an object.
				 */
				this.data.obj_allAttributeValues = typeOf(obj_data._allVariantAttributes) === 'object' ? obj_data._allVariantAttributes : {};
				this.data.obj_selectedAttributeValues = typeOf(obj_data._selectedAttributeValues) === 'object' ? obj_data._selectedAttributeValues : {};
				this.data.obj_possibleAttributeValues = typeOf(obj_data._possibleAttributeValues) === 'object' ? obj_data._possibleAttributeValues : {};
				
				// console.log('this.data', this.data);
				
				if (typeOf(func_onSuccess) === 'function') {
					func_onSuccess();
				}
				
				lsjs.loadingIndicator.__controller.hide();
			}.bind(this)
		});
	},
	
	selectAttributeValue: function(int_attributeId, int_valueId) {
		if (!int_attributeId || !int_valueId) {
			console.error('missing parameters - ', 'int_attributeId: ', int_attributeId, 'int_valueId: ', int_valueId);
			return;
		}
		
		/*
		 * If the currently selected attribute value is not possible in combination
		 * with an already existing selection, we reset the selection so that it
		 * is now possible to select the requested attribute value.
		 */
		if (this.data.obj_possibleAttributeValues[int_attributeId].values[int_valueId] === undefined) {
			this.data.obj_selectedAttributeValues = {};
		}
		
		/*
		 * Select an attribute value or deselect it if it has already been selected
		 */
		if (this.data.obj_selectedAttributeValues[int_attributeId] === int_valueId) {
			delete this.data.obj_selectedAttributeValues[int_attributeId];
		} else {
			this.data.obj_selectedAttributeValues[int_attributeId] = int_valueId;
		}
		
		this.triggerDataBinding('obj_selectedAttributeValues');
		
		/*
		 * Read the attribute values that are possible with the current selection
		 */
		// lsjs.loadingIndicator.__controller.show();
		lsjs.apiInterface.request({
			str_resource: 'callProductMethod',
			obj_params: {
				productId: this.readData('int_productVariantId'),
				method: '_getPossibleAttributeValuesForCurrentSelection',
				parameters: JSON.encode([
					this.readData('obj_selectedAttributeValues'),
					/*
					 * Don't let the server count the number of matching variants
					 * for each possible attribute value.
					 * This is better for performance reasons but could be changed
					 * if we wanted to display the number of expected variant matches.
					 */
					false
				])
			},
			func_onSuccess: function(obj_data) {
				this.writeData('obj_possibleAttributeValues', obj_data);
				this.triggerDataBinding('');
				
				// console.log(this.readData('obj_possibleAttributeValues'));
				
				// lsjs.loadingIndicator.__controller.hide();
			}.bind(this)
		});		
	},
	
	getNumMatchingVariants: function(func_onSuccess) {
		/*
		 * Determine the number of variants that match the current selection
		 */
		// lsjs.loadingIndicator.__controller.show();
		lsjs.apiInterface.request({
			str_resource: 'callProductMethod',
			obj_params: {
				productId: this.readData('int_productVariantId'),
				method: '_getNumMatchingVariantsByAttributeValues',
				parameters: JSON.encode([
					this.readData('obj_selectedAttributeValues')
				])
			},
			func_onSuccess: function(int_numMatchingVariants) {
				this.data.int_numMatchingVariants = int_numMatchingVariants;
				// console.log('this.data.int_numMatchingVariants: ', this.data.int_numMatchingVariants);
				
				if (typeOf(func_onSuccess) === 'function') {
					func_onSuccess();
				}
				
				// lsjs.loadingIndicator.__controller.hide();
			}.bind(this)
		});
	},
	
	bindingTranslation_selectedValueIdToSelectionClass: function(var_valueToSet, el_bound) {
		var	int_valueId,
			int_attributeId,
			bln_isSelected,
			bln_isPossible,
			str_class = '';
	
		int_valueId = el_bound.getProperty('data-lsjs-value-valueId');
		int_attributeId = el_bound.getProperty('data-lsjs-value-attributeId');
		
		bln_isSelected = this.data.obj_selectedAttributeValues[int_attributeId] !== undefined && this.data.obj_selectedAttributeValues[int_attributeId] === int_valueId;
		bln_isPossible = this.data.obj_possibleAttributeValues[int_attributeId].values[int_valueId] !== undefined;
				
		if (bln_isSelected) {
			str_class += 'selected';
		}
		
		if (bln_isPossible) {
			str_class += (str_class !==  '' ? ' ' : '') + 'possible';
		}
		
		return str_class;
	}
};