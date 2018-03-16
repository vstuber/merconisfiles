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
				var FORM_SUBMIT,
					favoriteProductID;
					
				lsjs.loadingIndicator.__controller.show();
				this.blur();
				
				FORM_SUBMIT = this.getParent().getElement('input[name="FORM_SUBMIT"]').getProperty('value');
				favoriteProductID = this.getParent().getElement('input[name="favoriteProductID"]').getProperty('value');
				
				new Request.JSON({
					url: lsjs.__appHelpers.merconisApp.obj_config.str_ajaxUrl,
					noCache: true,
					
					data:	'REQUEST_TOKEN=' + merconis_FE.options.REQUEST_TOKEN
						+	'&isAjax=1'
						+	'&action=addToFavorites'
						+	'&requestedClass=ModuleAjaxGeneral'
						+	'&favoriteProductID=' + favoriteProductID
						+	'&FORM_SUBMIT=' + FORM_SUBMIT,

					onComplete: function(objResponse) {
						var parentSwitchBox,
							msgSuccess,
							msgError,
							parentWatchlistContainer,
							crossSellerFavoritesParent,
							el_shopProduct;
						
						parentSwitchBox = this.getParent('.favoriteSwitchBox');
						if (typeOf(parentSwitchBox) === 'element') {
							msgSuccess = parentSwitchBox.getElement('.success');
							msgError = parentSwitchBox.getElement('.error');
						}
						
						parentWatchlistContainer = this.getParent('.watchlistContainer');
						
						crossSellerFavoritesParent = this.getParent('.crossSeller.favorites');
						el_shopProduct = this.getParent('.shopProduct');
						
						
						
						switch (objResponse.value.msgType) {
							case 1:
								// added
								if (typeOf(msgSuccess) === 'element') {
									msgSuccess.dispose();
								}

								if (typeOf(msgError) === 'element') {
									msgError.dispose();
								}
								
								if (typeOf(parentSwitchBox) === 'element') {
									new Element('span.success').setProperty('html', objResponse.value.msg).inject(parentSwitchBox, 'top');
								}

								if (typeOf(parentWatchlistContainer) === 'element') {
									parentWatchlistContainer.addClass('inMyWatchlist')
								}

								this.value = objResponse.value.btnText;

								break;

							case 2:
								// removed
								if (typeOf(crossSellerFavoritesParent) === 'element') {
									el_shopProduct.set('tween', {
										onComplete: function(){
											el_shopProduct.dispose();
											var remainingSwitchBoxes = $$('.favoriteSwitchBox')[0]
											if (remainingSwitchBoxes == undefined || remainingSwitchBoxes == null) {
												location.reload(true);
											}
										}
									});

									el_shopProduct.fade(0);
								} else {
									if (typeOf(msgSuccess) === 'element') {
										msgSuccess.dispose();
									}

									if (typeOf(msgError) === 'element') {
										msgError.dispose();
									}

									if (typeOf(parentSwitchBox) === 'element') {
										new Element('span.success').setProperty('html', objResponse.value.msg).inject(parentSwitchBox, 'top');
									}

									if (typeOf(parentWatchlistContainer) === 'element') {
										parentWatchlistContainer.removeClass('inMyWatchlist')
									}

									this.value = objResponse.value.btnText;
								}
								break;

							case 3:
								// request could not be processed
								if (typeOf(msgSuccess) === 'element') {
									msgSuccess.dispose();
								}

								if (typeOf(msgError) === 'element') {
									msgError.dispose();
								}

								if (typeOf(parentSwitchBox) === 'element') {
									new Element('span.error').setProperty('html', objResponse.value.msg).inject(parentSwitchBox, 'top');
								}							
								break;
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