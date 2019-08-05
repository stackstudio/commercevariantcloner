<?php
/**
 * Commerce Variant Cloner plugin for Craft CMS 3.x
 *
 * Commerce variant cloner tool
 *
 * @link      www.stackstudio.co.uk
 * @copyright Copyright (c) 2019 Stack Studio
 */

namespace stackstudio\commercevariantcloner\services;

use stackstudio\commercevariantcloner\CommerceVariantCloner;

use Craft;
use craft\base\Component;

/**
 * CommerceVariantClonerService Service
 *
 * All of your plugin’s business logic should go in services, including saving data,
 * retrieving data, etc. They provide APIs that your controllers, template variables,
 * and other plugins can interact with.
 *
 * https://craftcms.com/docs/plugins/services
 *
 * @author    Stack Studio
 * @package   CommerceVariantCloner
 * @since     1.0.0
 */
class CommerceVariantClonerService extends Component
{
    // Public Methods
    // =========================================================================

    /**
     * This function can literally be anything you want, and you can have as many service
     * functions as you want
     *
     * From any other plugin file, call it like this:
     *
     *     CommerceVariantCloner::$plugin->commerceVariantClonerService->exampleService()
     *
     * @return mixed
     */
    public function exampleService()
    {
        $result = 'something';

        return $result;
    }
}
