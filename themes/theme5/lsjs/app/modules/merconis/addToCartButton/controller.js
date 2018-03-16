(function() {
	
// ### ENTER MODULE NAME HERE ######
var str_moduleName = '__moduleName__';
// #################################

var obj_classdef = {
	start: function() {
		lsjs.__moduleHelpers[str_moduleName] = this.__module;
	},
	
	enhanceButtons: function(str_selector, el_domReference) {
		var els_buttonsToEnhance;
		
		if (str_selector === undefined || !str_selector) {
			console.error('str_selector is empty');
			return;
		}
		
		if (el_domReference !== undefined && typeOf(el_domReference) === 'element') {
			els_buttonsToEnhance = el_domReference.getElements(str_selector);
		} else {
			els_buttonsToEnhance = $$(str_selector);
		}
		
		Array.each(els_buttonsToEnhance, function(el_buttonToEnhance) {
			/* ->
			 * Make sure not to handle an element more than once
			 */
			if (!el_buttonToEnhance.retrieve('alreadyHandledBy_' + str_moduleName)) {
				el_buttonToEnhance.store('alreadyHandledBy_' + str_moduleName, true);
			} else {
				return;
			}
			/*
			 * <-
			 */
			

			el_buttonToEnhance.addEvent('click', function() {
				var num_quantity,
					str_productVariantId;
					
				lsjs.loadingIndicator.__controller.show();
				this.blur();
				
				num_quantity = this.getParent().getElement('[name="quantity"]').getProperty('value');
				str_productVariantId = this.getParent().getParent().getElement('input[name="productVariantID"]').getProperty('value');
				
				new Request.JSON({
					url: lsjs.__appHelpers.merconisApp.obj_config.str_ajaxUrl,
					noCache: true,
					
					data:	'REQUEST_TOKEN=' + lsjs.__appHelpers.merconisApp.obj_config.REQUEST_TOKEN
						+	'&isAjax=1'
						+	'&action=putInCart'
						+	'&requestedClass=ModuleAjaxGeneral'
						+	'&productVariantID=' + str_productVariantId
						+	'&quantity=' + num_quantity,
				
					onComplete: function(objResponse) {
						var el_parentQuantityInput,
							el_parentOfPutInCartMsg,
							el_alreadyExistingPutInCartMsg;

						if (typeof(lsjs.__appHelpers.merconisApp.obj_references.lsMerconisMiniCart) === 'undefined' || lsjs.__appHelpers.merconisApp.obj_references.lsMerconisMiniCart === null) {
							console.log('lsjs.__appHelpers.merconisApp.obj_references.lsMerconisMiniCart is not available');
						} else {
							lsjs.__appHelpers.merconisApp.obj_references.lsMerconisMiniCart.__controller.reloadCartMini();
						}

						var msgClass = '';
						switch (objResponse.value.msgType) {
							case 1:
								msgClass = '.hasBeenPutInCart';
								break;

							case 2:
								msgClass = '.hasBeenPutInCart.error';
								break;

							case 3:
								msgClass = '.notPutInCart';
								break;
						}

						el_parentQuantityInput = this.getParent('.quantityInput');

						if (el_parentQuantityInput !== null) {
							el_parentOfPutInCartMsg = el_parentQuantityInput.getParent();
							if (el_parentOfPutInCartMsg !== null) {
								el_alreadyExistingPutInCartMsg = el_parentOfPutInCartMsg.getElement('.putInCartMsg');
								if (el_alreadyExistingPutInCartMsg !== null) {
									el_alreadyExistingPutInCartMsg.dispose();
								}
							}
							new Element('div.putInCartMsg' + msgClass).setProperty('html', objResponse.value.msg).inject(el_parentQuantityInput, 'before');
						}

						lsjs.loadingIndicator.__controller.hide();
					}.bind(this)
				}).send();
				
				return false;
			});
		});
	}
};

lsjs.addControllerClass(str_moduleName, obj_classdef);

lsjs.createModule({
	__name: str_moduleName
});

})();