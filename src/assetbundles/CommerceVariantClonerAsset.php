<?php
namespace stackstudio\commercevariantcloner\assetbundles;

use Craft;
use craft\web\AssetBundle;
use craft\web\assets\cp\CpAsset;

class CommerceVariantClonerAsset extends AssetBundle
{
    // Public Methods
    // =========================================================================

    public function init()
    {
        $this->sourcePath = "@stackstudio/commercevariantcloner/resources/src";

        $this->depends = [
            CpAsset::class,
        ];

        $this->css = [
            'css/cloner.css',
        ];

        $this->js = [
            'js/cloner.js',
        ];

        parent::init();
    }
}