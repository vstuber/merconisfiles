<?php

namespace Merconis\Core;

use function LeadingSystems\Helpers\ls_mul;
use function LeadingSystems\Helpers\ls_div;
use function LeadingSystems\Helpers\ls_add;
use function LeadingSystems\Helpers\ls_sub;
use function LeadingSystems\Helpers\ls_getFilePathFromVariableSources;

/* ##########################################################################
 * # START HERE!                                                            #
 * # -----------                                                            #
 * #                                                                        #
 * # This class provides custom functions to deal with configurator values. #
 * # Please take a close look at the example functions and the comments.    #
 * #                                                                        #
 * # The example in this file requires a configurator form that provides    #
 * # two input fields. The first field is a file upload field that allows   #
 * # an image upload (named "foto") and the second field is a text field    #
 * # (named "caption").                                                     #
 * #                                                                        #
 * # This example might be useful for products that can have a foto and a   #
 * # caption printed on it. But of course it's just something to start      #
 * # with. You might want to create your own customLogic class to fit your  #
 * # special needs.                                                         #
 * #                                                                        #
 * # Important note: Use the following functions whenever you have to add,  #
 * # subtract, multiply or divide values.                                   #
 * #                                                                        #
 * # ls_add($summand_a,$summand_b)                                          #
 * # ls_sub($minuend,$subtrahend)                                           #
 * # ls_mul($factor_a,$factor_b)                                            #
 * # ls_div($dividend,$divisor)                                             #
 * #                                                                        #
 * # These functions prevent common floating point calculation problems.    #
 * #                                                                        #
 * # Example:                                                               #
 * # var_dump(0.6/0.2-3 == 0); var_dump(ls_sub(ls_div(0.6, 0.2), 3) == 0);  #
 * #                                                                        #
 * #                                                                        #
 * #                                                                        #
 * #                                                                        #
 * ##########################################################################
 */

/*
 * The class name has to be exactly the same as the filename without it's suffix. You don't have
 * to worry about any special name restrictions though, everything that's allowed as a php class name
 * will be fine.
 */
class configuratorCustomLogic_01 extends \Controller {
	private $objConfigurator = null;

	private $pricePerCharacter;
	private $unscaledPricePerCharacter;
	private $weightPerCharacter = 100;
	private $uploadFolder = '';

	public function __construct(&$objConfigurator = null) {
		parent::__construct();

		if ($objConfigurator === null && isset($GLOBALS['merconis_globals']['configurator']['objConfigurator'])) {
			$objConfigurator = &$GLOBALS['merconis_globals']['configurator']['objConfigurator'];
		}

		$this->import('Database'); // If you need access to the database, it's a good idea to import the database class right here

		$this->objConfigurator = $objConfigurator; // a reference to the configurator object is available in this class, so you have direct access to all the properties you need

		$this->pricePerCharacter = round(ls_mul($this->objConfigurator->objProductOrVariant->_priceBeforeConfiguratorAfterTax, 0.01), $GLOBALS['TL_CONFIG']['ls_shop_numDecimals']); // Every character that should be printed on the product costs 1 % of the product price
		$this->unscaledPricePerCharacter = round(ls_mul($this->objConfigurator->arrProductOrVariantData['unscaledPrice'], 0.01), $GLOBALS['TL_CONFIG']['ls_shop_numDecimals']); // Every character that should be printed on the product costs 1 % of the product price

		$this->getUploadFolder();
	}

	private function getUploadFolder() {
		/*
		 * If you need detailed information about the form fields used by this configurator you can easily
		 * get it directly from the database. Every configurator has one single form assigned so it's no problem
		 * identifying the proper form field with it's name and the form id.
		 *
		 * In this example we need to know the upload path of the file upload field because only the filename
		 * is stored as the field value
		 */
		$objFormField = $this->Database->prepare("
			SELECT		*
			FROM		`tl_form_field`
			WHERE		`name` = ?
				AND		`pid` = ?
		")
			->execute('foto', $this->objConfigurator->formID);
		$objFormField->first();

		$strUploadFolder = $objFormField->uploadFolder;
		if ($objFormField->useHomeDir && FE_USER_LOGGED_IN) {
			$this->import('FrontendUser', 'User');
			if ($this->User->assignDir && $this->User->homeDir && is_dir(TL_ROOT . '/' . $this->User->homeDir)) {
				$strUploadFolder = $this->User->homeDir;
			}
		}
		$this->uploadFolder = ls_getFilePathFromVariableSources($strUploadFolder);
	}

	/*
	 * This function returns a string that represents the current configurator settings
	 */
	public function getRepresentationOfConfiguratorSettings() {
		\System::loadLanguageFile('configuratorCustomLogic'); // The language file is loaded here. So if you want to use language references, you can put the text in this file.

		/*
		 * Use the functions -- ls_shop_generalHelper::outputPrice -- and -- ls_shop_generalHelper::outputWeight --
		 * to get a properly formatted frontend output of a price or weight value. These functions refer to the shop settings made in the backend.
		 *
		 * If you need to output an image, you can use the contao core functions -- generateImage() -- and -- getImage() -- because this customLogic class
		 * extends the contao controller class.
		 */
		ob_start();
		$blnFileExists = is_file($this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value']);
		$blnTextEntered = $this->objConfigurator->arrReceivedPost['caption']['value'] ? true : false;
		if (!$blnFileExists && !$blnTextEntered) {
			?>
			<div style="font-weight: bold; margin-bottom: 20px;"><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['noIndividualConfigurationUsed']; ?></div>
			<?php
		} else {
			?>
			<div>
				<div class="image"><?php echo $blnFileExists ? \Image::getHtml(\Image::get($this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value'], 200, 200)) : ''; ?></div>
				<p><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart01']; ?> <?php echo $blnFileExists ? $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart02'].' ' : ''; ?><?php echo $blnFileExists && $blnTextEntered ? ' '.$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart03'].' ' : ''; ?><?php echo $blnTextEntered ? $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart04'].' &quot;<strong>'.$this->objConfigurator->arrReceivedPost['caption']['value'].'</strong>&quot; ('.strlen($this->objConfigurator->arrReceivedPost['caption']['value']).' '.$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart05'].' '.ls_shop_generalHelper::outputPrice($this->unscaledPricePerCharacter).$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart06'].') ' : ''; ?><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart07']; ?>.</p>
			</div>
			<?php
		}
		return ob_get_clean();
	}

	/*
	 * In case you need a different representation of the current configurator settings when displayed in cart.
	 * In this example we show the scaled price per printed character in the cart whereas we show the unscaled
	 * price in the regular configurator representation. Apart from that, this function does the very same thing.
	 */
	public function getCartRepresentationOfConfiguratorSettings() {
		\System::loadLanguageFile('configuratorCustomLogic');

		ob_start();
		$blnFileExists = is_file($this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value']);
		$blnTextEntered = $this->objConfigurator->arrReceivedPost['caption']['value'] ? true : false;
		if (!$blnFileExists && !$blnTextEntered) {
			?>
			<div style="font-weight: bold; margin-bottom: 20px;"><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['noIndividualConfigurationUsed']; ?></div>
			<?php
		} else {
			?>
			<div>
				<div class="image"><?php echo $blnFileExists ? \Image::getHtml(\Image::get($this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value'], 200, 200)) : ''; ?></div>
				<p><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart01']; ?> <?php echo $blnFileExists ? $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart02'].' ' : ''; ?><?php echo $blnFileExists && $blnTextEntered ? ' '.$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart03'].' ' : ''; ?><?php echo $blnTextEntered ? $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart04'].' &quot;<strong>'.$this->objConfigurator->arrReceivedPost['caption']['value'].'</strong>&quot; ('.strlen($this->objConfigurator->arrReceivedPost['caption']['value']).' '.$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart05'].' '.ls_shop_generalHelper::outputPrice($this->pricePerCharacter).$GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart06'].') ' : ''; ?><?php echo $GLOBALS['TL_LANG']['MOD']['ls_shop']['customLogicExample']['summaryTextPart07']; ?>.</p>
			</div>
			<?php
		}
		return ob_get_clean();
	}

	/*
	 * In case you need a different representation of the current configurator settings to deliver to the merchant.
	 * This might be useful if the merchant needs more detailed information about the configurator settings than
	 * the customer. For example, if the customer uploads a file he only needs to see the filename whereas the merchant
	 * needs to see the complete path to the file.
	 */
	public function getMerchantRepresentationOfConfiguratorSettings() {
		$blnFileExists = is_file($this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value']);
		return $this->getCartRepresentationOfConfiguratorSettings().($blnFileExists ? '<hr />complete path to uploaded image:<br />'.$this->uploadFolder.'/'.$this->objConfigurator->arrReceivedPost['foto']['value'] : '');
	}

	/*
	 * This function determines whether the current configurator settings result in a modification of the product price or not.
	 * A price modification is returned as a numeric value which will be added to the product price (or subtracted if the value is negative).
	 *
	 * Please note that the prices used in this function need to be of the same kind as the product prices in the shop backend.
	 * This means that if you entered prodct prices as gross values in the backend, use a gross price here as well. If you used net prices instead,
	 * do the same thing here.
	 */
	public function getPriceModification() {
		/*
		 * Example for price modification depending on a value entered by the customer
		 */
		$numCharacters = strlen($this->objConfigurator->arrReceivedPost['caption']['value']);

		/*
		 * If we want to be able to display the complete price scale for a configuration,
		 * the product or variant price on which the configurator's price modification calculation
		 * depends isn't the same for each price scale step. In this case it is not enough to calculate
		 * the price per character only once in the custom logic file's __construct function but instead
		 * we have to calculate it again, right here with the product's or variant's current _priceBeforeConfiguratorAfterTax.
		 */
		$this->pricePerCharacter = round(ls_mul($this->objConfigurator->objProductOrVariant->_priceBeforeConfiguratorAfterTax, 0.01), $GLOBALS['TL_CONFIG']['ls_shop_numDecimals']); // Every character that should be printed on the product costs 1 % of the product price
		return ls_mul($this->pricePerCharacter, $numCharacters);
	}

	/*
	 * Same as the function above but used for the modification of the unscaled price. If scale prices
	 * are not used at all, this function is irrelevant.
	 */
	public function getUnscaledPriceModification() {
		/*
		 * Example for price modification depending on a value entered by the customer
		 */
		$numCharacters = strlen($this->objConfigurator->arrReceivedPost['caption']['value']);

		return ls_mul($this->unscaledPricePerCharacter, $numCharacters);
	}

	/*
	 * This function determines whether the current configurator settings result in a modification of the product weight or not.
	 * A weight modification is returned as a numeric value which will be added to the product weight (or subtracted if the value is negative)
	 */
	public function getWeightModification() {
		/*
		 * Example for weight modification depending on a value entered by the customer, not used in this example
		 */
		// $numCharacters = strlen($this->objConfigurator->arrReceivedPost['caption']['value']);
		// return $this->weightPerCharacter * $numCharacters;

		return 0;
	}

	/*
	 * The customValidator function must return an array with the keys "blnValid" (holding the boolean information whether the status is valid or not)
	 * and "strMessage" holding the message to show as a result of the validation.
	 */
	public function customValidator() {
		$arrReturn = array(
			'blnValid' => true,
			'strMessage' => ''
		);

		if ($this->objConfigurator->arrReceivedPost['caption']['value'] == 'forbidden text') {
			$arrReturn = array(
				'blnValid' => false,
				'strMessage' => 'this text is not okay!'
			);
		}

		return $arrReturn;
	}
}
