<?php
namespace verbb\cloner\base;

use stackstudio\commercevariantcloner\CommerceVariantCloner;

use Craft;
use craft\base\Component;

class Service extends Component
{
    // Constants
    // =========================================================================

    const EVENT_REGISTER_CLONER_GROUPS = 'registerClonerGroups';


    // Public Methods
    // =========================================================================

    public function init()
    {
        parent::init();
    }

    public function getRegisteredGroups()
    {
        $groups = [];
        $registeredClasses = [
            AssetTransforms::class,
            CategoryGroups::class,
            EntryTypes::class,
            GlobalSets::class,
            Sections::class,
            TagGroups::class,
            UserGroups::class,
            Volumes::class,
        ];

        foreach ($registeredClasses as $registeredClass) {
            $groups[$registeredClass::$matchedRoute] = [
                'id' => $registeredClass::$id,
                'title' => $registeredClass::$title,
                'action' => $registeredClass::$action,
            ];
        }

        $event = new RegisterClonerGroupEvent([
            'groups' => $groups,
        ]);

        $this->trigger(self::EVENT_REGISTER_CLONER_GROUPS, $event);

        return $event->groups;
    }

    public function cloneAttributes($oldModel, $newModel, $attributes)
    {
        foreach ($attributes as $attr) {
            $newModel->$attr = $oldModel->$attr;
        }
    }

    public function getFieldLayout($oldFieldLayout)
    {
        $fields = [];
        $required = [];

        foreach ($oldFieldLayout->getTabs() as $tab) {
            $fields[$tab->name] = [];

            foreach ($tab->getFields() as $field) {
                $fields[$tab->name][] = $field->id;

                if ($field->required) {
                    $required[] = $field->id;
                }
            }
        }

        return [$fields, $required];
    }


}