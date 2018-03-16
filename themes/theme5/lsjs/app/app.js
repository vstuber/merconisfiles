(function() {
	var classdef_app = {
		obj_config: {},

		obj_references: {},

		initialize: function() {
		},

		start: function() {
			// lsjs.__moduleHelpers.templateTest.start({__el_container: $$('body')[0]});

			lsjs.__moduleHelpers.ocNavi.start({
				str_contentSelector: '#offCanvasContainer',
				str_togglerSelector: '#lsOcNaviToggler.ls_icon.medium.button.x-d.y-a'
			});


			lsjs.apiInterface.str_apiUrl = lsjs.__appHelpers.merconisApp.obj_config.str_ajaxUrl;

			/*
			 * Things that need to happen in the beginning (domready) and also in
			 * case of a cajax_domUpdate are registered with the event and then the
			 * event is fired instantly. When a cajax_domUpdate event occurs, it will
			 * automatically be fired again.
			 */
			window.addEvent('cajax_domUpdate', function(el_domReference) {
				/* ->
				 * reinitialize mediabox
				 */
				el_domReference.getElements('a[data-lightbox]').mediabox({
						// Put custom options here
					},
					function(el) {
						return [el.href, el.title, el.getAttribute('data-lightbox')];
					},
					function(el) {
						var data = this.getAttribute('data-lightbox').split(' ');
						return (this == el) || (data[0] && el.getAttribute('data-lightbox').match(data[0]));
					});
				/*
				 * <-
				 */
				var el_miniCart = $$('.template_cart_mini')[0];

				if (
						el_miniCart !== undefined
					&&	(
								el_domReference.contains(el_miniCart)
							||	el_domReference.hasClass('template_cart_mini')
						)
				) {
					this.obj_references.lsMerconisMiniCart = lsjs.__moduleHelpers.miniCart.start({
						bln_useUnfold: true,
						obj_unfoldOptions: {
							bln_automaticallyCreateResizeBox: false,
							var_initialHeight: 'auto',
							int_heightOffset: 50,
							str_initialDisplayType: 'block',

							/*
							 * We don't set the animation mode to the actually supported values "height" or "margin-top" because
							 * we don't really want to use the regular unfold effect. Instead, we want to leverage the classes
							 * set the unfold effect and use css transitions to create the effect, we really want.
							 */
							str_animationMode: 'none',

							bln_closeOnOutsideClick: true,
							str_togglerEventType: ['click', 'closeButton'],
							str_initialToggleStatus: 'closed',
							var_togglerSelector: '.template_cart_mini',
							var_contentBoxSelector: '.template_cart_mini .cartPreview',
							var_wrapperSelector: '.template_cart_mini',
							var_closeButtonSelector: '.template_cart_mini .cartPreview .closeButton',

							/*
							 * false
							 *
							 * if we don't want the cart preview to open when a product gets put into the cart
							 *
							 * or
							 *
							 * el_domReference !== $$('body')[0]
							 *
							 * if we want it to open. We can't simply set the
							 * value to true because then the cart preview would open on every page reload, i.e.
							 * even when the page gets loaded regularly by clicking on a menu item or by opening
							 * the whole website for the very first time.
							 */
							bln_toggleOnInitialization: false,

							obj_morphOptions: {
								'duration': 600,
								'onStart': function() {
									$$('body')[0].addClass('mini-cart-animation-running');
								},
								'onComplete': function() {
									$$('body')[0].removeClass('mini-cart-animation-running');

									if ($$('.template_cart_mini')[0].hasClass('lsUnfoldOpen')) {
										$$('body')[0].addClass('mini-cart-open');
									} else {
										$$('body')[0].removeClass('mini-cart-open');
									}
								}
							}
						}
					});
				}

				lsjs.__moduleHelpers.addToWatchlistButton.__controller.enhanceButtons('.favoriteSwitchBox input.submit', el_domReference);

				lsjs.__moduleHelpers.navtabManager.start({
					el_domReference: el_domReference,
					navtabContainerSelector: '[data-lsjs-component="navtab"]',
					defaultAutoplayStatus: true,
					autoplayDelay: 4000,
					stopAutoplayOnMouseenter: true,
					startAutoplayOnMouseleave: true
				});

				lsjs.__moduleHelpers.zoomManager.start({
					el_domReference: el_domReference,
					selector: '[data-lsjs-component="navtab"] [data-lsjs-element="navtabContent"] .productImage:not(.isVideo)',
					bigBoxFitsThumb: true,
					bigImageUrlAttribute: 'href',

					/*
					 * Using this callback function, we can make sure that the image
					 * is in the right position when the zoom effect is initialized.
					 * When images are under the influence of another javascript component
					 * (in this case it is probably combined with "navtab") the image's
					 * position can be altered after the zoom effect has been initialized
					 * and if that happens, the zoom effect could break.
					 * 
					 * Example: In the navtab gallery, only one image is displayed at
					 * a time and all the others are hidden. The visible image pushes
					 * images following in the DOM down. When one of these following
					 * images actually is displayed, the first image is not visible
					 * anymore and therefore not pushing the following image down.
					 * So, if the zoomer detects the second image's position while the
					 * first images is visible this position is wrong when the second
					 * image is displayed and zoom effect breaks.
					 * 
					 * The solution is quite easy: Before the position detection, we
					 * make sure that all images in the gallery are hidden.
					 * 
					 * Please note, that we identify the images to hide relative to
					 * an element related to the zoomer object to make sure that we
					 * don't hide things that aren't even related to the gallery.
					 */
					func_beforePositionDetection: function(obj_zoomer) {
						Array.each(obj_zoomer.el_zoomImageWrapper.getParent('[data-lsjs-element="navtabContentContainer"]').getElements('[data-lsjs-element="navtabContent"]'), function(el) {
							el.store('str_displayValueBefore', el.getStyle('display'));
							el.setStyle('display', 'none');
						});
					},
					func_afterPositionDetection: function(obj_zoomer) {
						Array.each(obj_zoomer.el_zoomImageWrapper.getParent('[data-lsjs-element="navtabContentContainer"]').getElements('[data-lsjs-element="navtabContent"]'), function(el) {
							el.setStyle('display', el.retrieve('str_displayValueBefore'));
						});
					}

				});

				lsjs.__moduleHelpers.customerDataFormManager.start({
					el_domReference: el_domReference
				});

				lsjs.__moduleHelpers.formReviewerManager.start({
					el_domReference: el_domReference
				});

				lsjs.__moduleHelpers.statusTogglerManager.start({
					el_domReference: el_domReference
				});

				lsjs.__moduleHelpers.cajaxCallerManager.start({
					el_domReference: el_domReference
				});

				lsjs.__moduleHelpers.elementFolderManager.start({
					el_domReference: el_domReference
				});

				lsjs.__moduleHelpers.configuratorManager.start();
				lsjs.__moduleHelpers.putInCartFormManager.start();
				lsjs.__moduleHelpers.variantLinkerManager.start();
			}.bind(this));

			window.fireEvent('cajax_domUpdate', $$('body')[0]);

			lsjs.__moduleHelpers.filterFormManager.start({
				str_containerSelector: '.template_filterForm_default'
			});

			lsjs.__moduleHelpers.liveHits.start({
				var_inputField: '#header .liveHits input[name="merconis_searchWord"]'
			});

			lsjs.__moduleHelpers.variantSelectorManager.start();

			lsjs.__moduleHelpers.productManagementApiTestManager.start();

			/*
			 * TESTS ->
			 */
			// lsjs.__moduleHelpers.ajaxTest.start();

			/*
			 lsjs.__moduleHelpers.templateTest.start({
			 str_containerSelector: '#templateTest'
			 });
			 */
			/*
			 * <- TESTS
			 */
		}
	};

	var class_app = new Class(classdef_app);

	window.addEvent('domready', function() {
		lsjs.__appHelpers.merconisApp = new class_app();
	});
})();