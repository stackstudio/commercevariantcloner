// ==========================================================================

// ==========================================================================

if (typeof Craft.Cloner === typeof undefined) {
    Craft.Cloner = {};
}

(function($) {

Craft.Cloner = Garnish.Base.extend({

    settings: null,

    $variants: null,
    $container: null,
    $variantContainer: null,
    $clonerButton: null,
    $options: null,
    $anchor: null,
    totalNewVariants: null,
    fieldBodyHtml: null,
    variantSort: null,
    variantSelect: null,

    init: function(settings) {

        this.$variants = $('.variant-matrix');
        this.$variantContainer = $('.variant-matrixblock');
        this.$clonerButton = this.$variantContainer.find('.cloner');
        this.totalNewVariants = 0;

        var buttonHtml = '<a class="default-btn cloner" title="' + Craft.t('commerce', 'Clone Variant') + '">' + Craft.t('commerce', 'Clone Variant') + '</a>',
            buttonBefore = this.$variantContainer.find('.actions');

        $(buttonBefore).prepend(buttonHtml);

       // this.$variantContainer.find('.actions > default-btn').prepend('<button class="default-btn cloner" title="' + Craft.t('commerce', 'Clone Variant') + '">' + Craft.t('commerce', 'Clone Variant') + '</button>');

        var $cloneBtn = this.$variantContainer.find('.cloner');

        var $variants = this.$variantContainer.children()

            //this.$actionMenu = menuBtn.menu.$container;

            //cloneBtn.menu.settings.onOptionSelect = $.proxy(this, 'onMenuOptionSelect');

        //this.setupDropdown();

        this.addListener($cloneBtn, 'click', function(ev) {
            ev.preventDefault();
            var cloneBtnVariant = ev.target.closest('.variant-matrixblock');
            this.onCloneButtonClick(cloneBtnVariant);
        });

        this.variantSelect = new Garnish.Select(this.$variantContainer, $variants, {
            multi: true,
            vertical: true,
            handle: '> .checkbox, > .titlebar',
            checkboxMode: true
        });

        this.variantSort = new Garnish.DragSort($variants, {
            handle: '> .actions > .move',
            axis: 'y',
            filter: $.proxy(function() {
                // Only return all the selected items if the target item is selected
                if (this.variantSort.$targetItem.hasClass('sel')) {
                    return this.variantSelect.getSelectedItems();
                }
                else {
                    return this.variantSort.$targetItem;
                }
            }, this),
            collapseDraggees: true,
            magnetStrength: 4,
            helperLagBase: 1.5,
            helperOpacity: 0.9,
            onSortChange: $.proxy(function() {
                this.variantSelect.resetItemOrder();
            }, this)
        });


    },
    

    getHiddenVariantCss: function($variant) {
        return {
            opacity: 0,
            marginBottom: -($variant.outerHeight())
        };
    },

    onCloneButtonClick: function(elem) {

        this.totalNewVariants++;

        var id = 'new' + this.totalNewVariants,
            fields = $(elem).find('.fields').prop('innerHTML'),
            variantId = $(elem).data('id');

        var $variant = $(
            '<div class="variant-matrixblock matrixblock" data-id="' + id + '">' +
            '<input type="hidden" name="variants[' + id + '][enabled]" value="1"/>' +
            '<input class="default-input" type="hidden" name="variants[' + id + '][isDefault]" value="">' +
            '<div class="titlebar">' +
            '<div class="preview"></div>' +
            '</div>' +
            '<div class="checkbox" title="' + Craft.t('commerce', 'Select') + '"></div>' +
            '<div class="actions">' +
            '<div class="status off" title="' + Craft.t('commerce', 'Disabled') + '"></div>' +
            '<a class="default-btn cloner" title="' + Craft.t('commerce', 'Clone Variant') + '">' + Craft.t('commerce', 'Clone Variant') + '</a> ' +
            '<a class="default-btn" title="' + Craft.t('commerce', 'Set as the default variant') + '">' + Craft.t('commerce', 'Default') + '</a> ' +
            '<a class="settings icon menubtn" title="' + Craft.t('commerce', 'Actions') + '" role="button"></a> ' +
            '<div class="menu">' +
            '<ul class="padded">' +
            '<li><a data-icon="collapse" data-action="collapse">' + Craft.t('commerce', 'Collapse') + '</a></li>' +
            '<li class="hidden"><a data-icon="expand" data-action="expand">' + Craft.t('commerce', 'Expand') + '</a></li>' +
            '<li><a data-icon="disabled" data-action="disable">' + Craft.t('commerce', 'Disable') + '</a></li>' +
            '<li class="hidden"><a data-icon="enabled" data-action="enable">' + Craft.t('commerce', 'Enable') + '</a></li>' +
            '</ul>' +
            '<hr class="padded"/>' +
            '<ul class="padded">' +
            '<li><a data-icon="+" data-action="add">' + Craft.t('commerce', 'Add variant above') + '</a></li>' +
            '</ul>' +
            '<hr class="padded"/>' +
            '<ul class="padded">' +
            '<li><a data-icon="remove" data-action="delete">' + Craft.t('commerce', 'Delete') + '</a></li>' +
            '</ul>' +
            '</div>' +
            '<a class="move icon" title="' + Craft.t('commerce', 'Reorder') + '" role="button"></a> ' +
            '</div>' +
            '</div>'
        );

            String.prototype.replaceAll = function(search, replace) {
            if (replace === undefined) {
                return this.toString();
            }
            return this.split(search).join(replace);
            }

        $variant.appendTo(this.$variants.find('.blocks'));
        const fieldsReplaced = fields.replaceAll(variantId,id);

        var $fieldsContainer = $('<div class="fields"/>').appendTo($variant),
            bodyHtml = this.getParsedVariantHtml(fieldsReplaced, id),
            footHtml = this.getParsedVariantHtml(this.fieldFootHtml, id);

        $(bodyHtml).appendTo($fieldsContainer);

        if (this.singleColumnMode) {
            this.setVariantsToSingleColMode($variant);
        }

        // Animate the variant into position
        $variant.css(this.getHiddenVariantCss($variant)).velocity({
            opacity: 1,
            'margin-bottom': 10
        }, 'fast', $.proxy(function() {
            $variant.css('margin-bottom', '');
            Garnish.$bod.append(footHtml);
            Craft.initUiElements($fieldsContainer);
            Craft.Commerce.initUnlimitedStockCheckbox($variant);
            var variant = new Variant(this, $variant);
            this.variantSort.addItems($variant);
            this.variantSelect.addItems($variant);

            Garnish.requestAnimationFrame(function() {
                // Scroll to the variant
                Garnish.scrollContainerToElement($variant);
            });

            // If this is the only variant, set it as the default
            if (this.$variantContainer.children().length === 1) {
                this.setDefaultVariant(variant);
            }
        }, this));
    },

    getParsedVariantHtml: function(html, id) {
        if (typeof html === 'string') {
            return html.replace(/__VARIANT__/g, id);
        }
        else {
            return '';
        }
    },

    generateHandle: function(sourceVal) {
        // Remove HTML tags
        var handle = sourceVal.replace("/<(.*?)>/g", '');

        // Remove inner-word punctuation
        handle = handle.replace(/['"‘’“”\[\]\(\)\{\}:]/g, '');

        // Make it lowercase
        handle = handle.toLowerCase();

        // Convert extended ASCII characters to basic ASCII
        handle = Craft.asciiString(handle);

        // Handle must start with a letter
        handle = handle.replace(/^[^a-z]+/, '');

        // Get the "words"
        var words = Craft.filterArray(handle.split(/[^a-z0-9]+/)),
            handle = '';

        // Make it camelCase
        for (var i = 0; i < words.length; i++) {
            if (i == 0) {
                handle += words[i];
            } else {
                handle += words[i].charAt(0).toUpperCase()+words[i].substr(1);
            }
        }

        return handle;
    },
});

var Variant = Garnish.Base.extend(
    {
        matrix: null,
        $container: null,
        $titlebar: null,
        $fieldsContainer: null,
        $previewContainer: null,
        $actionMenu: null,
        $collapsedInput: null,
        $defaultInput: null,
        $defaultBtn: null,

        isNew: null,
        id: null,

        collapsed: false,

        init: function(matrix, $container) {
            this.matrix = matrix;
            this.$container = $container;
            this.$titlebar = $container.children('.titlebar');
            this.$previewContainer = this.$titlebar.children('.preview');
            this.$fieldsContainer = $container.children('.fields');
            this.$defaultInput = this.$container.children('.default-input');
            this.$defaultBtn = this.$container.find('> .actions > .default-btn');

            this.$container.data('variant', this);

            this.id = this.$container.data('id');
            this.isNew = (!this.id || (typeof this.id === 'string' && this.id.substr(0, 3) === 'new'));

            var $menuBtn = this.$container.find('> .actions > .settings'),
                menuBtn = new Garnish.MenuBtn($menuBtn);

            this.$actionMenu = menuBtn.menu.$container;

            menuBtn.menu.settings.onOptionSelect = $.proxy(this, 'onMenuOptionSelect');

            // Was this variant already collapsed?
            if (Garnish.hasAttr(this.$container, 'data-collapsed')) {
                this.collapse();
            }

            this.addListener(this.$titlebar, 'dblclick', function(ev) {
                ev.preventDefault();
                this.toggle();
            });

            // Is this variant the default?
            if (this.$defaultInput.val() === '1') {
                this.matrix.setDefaultVariant(this);
            }

            this.addListener(this.$defaultBtn, 'click', function(ev) {
                ev.preventDefault();
                this.matrix.setDefaultVariant(this);
            });
        },

        toggle: function() {
            if (this.collapsed) {
                this.expand();
            }
            else {
                this.collapse(true);
            }
        },

        collapse: function(animate) {
            if (this.collapsed) {
                return;
            }

            this.$container.addClass('collapsed');

            var previewHtml = '',
                $fields = this.$fieldsContainer.find('> .meta > .field:first-child, > .custom-fields > .field');

            for (var i = 0; i < $fields.length; i++) {
                var $field = $($fields[i]),
                    $inputs = $field.children('.input').find('select,input[type!="hidden"],textarea,.label'),
                    inputPreviewText = '';

                for (var j = 0; j < $inputs.length; j++) {
                    var $input = $($inputs[j]),
                        value;

                    if ($input.hasClass('label')) {
                        var $maybeLightswitchContainer = $input.parent().parent();

                        if ($maybeLightswitchContainer.hasClass('lightswitch') && (
                                ($maybeLightswitchContainer.hasClass('on') && $input.hasClass('off')) ||
                                (!$maybeLightswitchContainer.hasClass('on') && $input.hasClass('on'))
                            )) {
                            continue;
                        }

                        value = $input.text();
                    }
                    else {
                        value = Craft.getText(Garnish.getInputPostVal($input));
                    }

                    if (value instanceof Array) {
                        value = value.join(', ');
                    }

                    if (value) {
                        value = Craft.trim(value);

                        if (value) {
                            if (inputPreviewText) {
                                inputPreviewText += ', ';
                            }

                            inputPreviewText += value;
                        }
                    }
                }

                if (inputPreviewText) {
                    previewHtml += (previewHtml ? ' <span>|</span> ' : '') + inputPreviewText;
                }
            }

            this.$previewContainer.html(previewHtml);

            this.$fieldsContainer.velocity('stop');
            this.$container.velocity('stop');

            if (animate) {
                this.$fieldsContainer.velocity('fadeOut', {duration: 'fast'});
                this.$container.velocity({height: 30}, 'fast');
            }
            else {
                this.$previewContainer.show();
                this.$fieldsContainer.hide();
                this.$container.css({height: 30});
            }

            setTimeout($.proxy(function() {
                this.$actionMenu.find('a[data-action=collapse]:first').parent().addClass('hidden');
                this.$actionMenu.find('a[data-action=expand]:first').parent().removeClass('hidden');
            }, this), 200);

            // Remember that?
            if (!this.isNew) {
                Craft.Commerce.VariantMatrix.rememberCollapsedVariantId(this.id);
            }
            else {
                if (!this.$collapsedInput) {
                    this.$collapsedInput = $('<input type="hidden" name="' + this.matrix.inputNamePrefix + '[' + this.id + '][collapsed]" value="1"/>').appendTo(this.$container);
                }
                else {
                    this.$collapsedInput.val('1');
                }
            }

            this.collapsed = true;
        },

        expand: function() {
            if (!this.collapsed) {
                return;
            }

            this.$container.removeClass('collapsed');

            this.$fieldsContainer.velocity('stop');
            this.$container.velocity('stop');

            var collapsedContainerHeight = this.$container.height();
            this.$container.height('auto');
            this.$fieldsContainer.css('display', 'flex');
            var expandedContainerHeight = this.$container.height();
            this.$container.height(collapsedContainerHeight);
            this.$fieldsContainer.hide().velocity('fadeIn', {duration: 'fast', display: 'flex'});
            this.$container.velocity({height: expandedContainerHeight}, 'fast', $.proxy(function() {
                this.$previewContainer.html('');
                this.$container.height('auto');
            }, this));

            setTimeout($.proxy(function() {
                this.$actionMenu.find('a[data-action=collapse]:first').parent().removeClass('hidden');
                this.$actionMenu.find('a[data-action=expand]:first').parent().addClass('hidden');
            }, this), 200);

            // Remember that?
            if (!this.isNew && typeof Storage !== 'undefined') {
                var collapsedVariants = Craft.Commerce.VariantMatrix.getCollapsedVariantIds(),
                    collapsedVariantsIndex = $.inArray('' + this.id, collapsedVariants);

                if (collapsedVariantsIndex !== -1) {
                    collapsedVariants.splice(collapsedVariantsIndex, 1);
                    Craft.Commerce.VariantMatrix.setCollapsedVariantIds(collapsedVariants);
                }
            }

            if (!this.isNew) {
                Craft.Commerce.VariantMatrix.forgetCollapsedVariantId(this.id);
            }
            else if (this.$collapsedInput) {
                this.$collapsedInput.val('');
            }

            this.collapsed = false;
        },

        disable: function() {
            if (this.isDefault()) {
                // Can't disable the default variant
                return false;
            }

            this.$container.children('input[name$="[enabled]"]:first').val('');
            this.$container.addClass('disabled');

            setTimeout($.proxy(function() {
                this.$actionMenu.find('a[data-action=disable]:first').parent().addClass('hidden');
                this.$actionMenu.find('a[data-action=enable]:first').parent().removeClass('hidden');
            }, this), 200);

            this.collapse(true);

            return true;
        },

        enable: function() {
            this.$container.children('input[name$="[enabled]"]:first').val('1');
            this.$container.removeClass('disabled');

            setTimeout($.proxy(function() {
                this.$actionMenu.find('a[data-action=disable]:first').parent().removeClass('hidden');
                this.$actionMenu.find('a[data-action=enable]:first').parent().addClass('hidden');
            }, this), 200);

            return true;
        },

        setAsDefault: function() {
            this.$defaultInput.val('1');
            this.$defaultBtn
                .addClass('sel')
                .attr('title', '');

            // Default variants must be enabled
            this.enable();
            this.$actionMenu.find('a[data-action=disable]:first').parent().addClass('disabled');
        },

        unsetAsDefault: function() {
            this.$defaultInput.val('');
            this.$defaultBtn
                .removeClass('sel')
                .attr('title', 'Set as the default variant');

            this.$actionMenu.find('a[data-action=disable]:first').parent().removeClass('disabled');
        },

        isDefault: function() {
            return this.$defaultInput.val() === '1';
        },

        onMenuOptionSelect: function(option) {
            var batchAction = (this.matrix.variantSelect.totalSelected > 1 && this.matrix.variantSelect.isSelected(this.$container)),
                $option = $(option);

            switch ($option.data('action')) {
                case 'collapse': {
                    if (batchAction) {
                        this.matrix.collapseSelectedVariants();
                    }
                    else {
                        this.collapse(true);
                    }

                    break;
                }

                case 'expand': {
                    if (batchAction) {
                        this.matrix.expandSelectedVariants();
                    }
                    else {
                        this.expand();
                    }

                    break;
                }

                case 'disable': {
                    if (batchAction) {
                        this.matrix.disableSelectedVariants();
                    }
                    else {
                        this.disable();
                    }

                    break;
                }

                case 'enable': {
                    if (batchAction) {
                        this.matrix.enableSelectedVariants();
                    }
                    else {
                        this.enable();
                        this.expand();
                    }

                    break;
                }

                case 'add': {
                    this.matrix.addVariant(this.$container);
                    break;
                }

                case 'delete': {
                    if (batchAction) {
                        if (confirm(Craft.t('commerce', 'Are you sure you want to delete the selected variants?'))) {
                            this.matrix.deleteSelectedVariants();
                        }
                    }
                    else {
                        this.selfDestruct();
                    }

                    break;
                }
            }
        },

        selfDestruct: function() {
            this.$container.velocity(this.matrix.getHiddenVariantCss(this.$container), 'fast', $.proxy(function() {
                this.$container.remove();

                // If this is the default variant, set the first variant as default instead
                if (this.isDefault()) {
                    var variant = this.matrix.$variantContainer.children(':first-child').data('variant');

                    if (variant) {
                        this.matrix.setDefaultVariant(variant);
                    }
                }
            }, this));
        }
    });

})(jQuery);
