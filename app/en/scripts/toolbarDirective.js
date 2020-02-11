/*jslint node:true, white:true, devel:true, debug:true, todo:true, nomen:true*/
/*global angular, $  */

(function (angular, appName) {

    function ToolbarDirectiveController() {

    }

    ToolBarDirectiveFactory.$inject = ['$interpolate', '$rootScope', '$timeout', '$log', 'constantService', 'contentDataService', 'eventManagerService'];
    function ToolBarDirectiveFactory($interpolate, $rootScope, $timeout, $log, constantService, contentDataService, eventManagerService) {
        // Button names, in the order they appear in the toolbar

        var toolButtonNames = ['help', 'theme', 'zoomOut', 'zoomIn', 'bilingual', 'readAloud', 'scratchwork',
            'scratchworkPencil', 'scratchworkHighlighter', 'scratchworkEraser', 'scratchworkClear', 'equationEditor',
            'calculator', 'timer', 'previous', 'next'];

        var defaultButtonSettings = {
            visible: function () { return false; },
            tooltip: function () { return ''; },
            class: function () { return ''; },
            style: function () { return ''; },
            disabled: function () { return false; },
            active: function () { return false; },
            unclickable: function () { return false; },
            click: function () { }
        }

        return {
            restrict: 'E',
            scope: {
                toolbarStyle: '=',
                toolbarClass: '=?',
                isVisible: '=?',
                settings: '='
            },
            templateUrl: 'scripts/toolbarTemplate.html',
            link: function ($scope, $element, $attrs) {
                // set display type for custom element
                //$element.css('display', 'block');
                // touch the spacer CSS to work around zoom:reset on render problem
                $scope.spacerStyle = { 'z-index': 1 };
                // toolbar default to visible
                if ($scope.isVisible === undefined) {
                    $scope.isVisible = true;
                }
                if ($scope.settings) {
                    // enumerate through button settings and assign default behaviors when not defined
                    for (var i = 0, l = toolButtonNames.length; i < l; i++) {
                        var buttonSettings = $scope.settings[toolButtonNames[i]];
                        if (buttonSettings) {

                            if (!buttonSettings.visible) {
                                buttonSettings.visible = defaultButtonSettings.visible;
                            }
                            if (!buttonSettings.active) {
                                buttonSettings.active = defaultButtonSettings.active;
                            }
                            if (!buttonSettings.disabled) {
                                buttonSettings.disabled = defaultButtonSettings.disabled;
                            }
                            if (!buttonSettings.click) {
                                buttonSettings.click = defaultButtonSettings.click;
                            }

                            // if no separate function specified for unclickable, use disabled instead
                            if (!buttonSettings.unclickable) {
                                buttonSettings.unclickable = buttonSettings.disabled;
                            }

                            // make button to be global click-prevention aware
                            if (buttonSettings.click) {
                                buttonSettings.click = (function (clickFunc) {
                                    return function () {
                                        if (!angular.isFunction($scope.settings.shouldDisableToolButtons) || $scope.settings.shouldDisableToolButtons() !== true) {
                                            clickFunc.apply(this, arguments);
                                        }
                                    };
                                })(buttonSettings.click);
                            }
                        } else {
                            // if no settings for the button, use default so $interpolate won't blow up
                            $scope.settings[toolButtonNames[i]] = angular.copy(defaultButtonSettings);
                        }
                    }
                }

                //#region Keyboard Navigation Support

                var rootScopeListenerFns = [];

                rootScopeListenerFns.push(eventManagerService.on(constantService.EVENTNAMES.toolbarReceiveForwardFocus, function ($event) {
                    $log.info('[TB]', 'toolbarReceiveForwardFocus');
                    var settings = $scope.settings;
                    if (!settings) {
                        $log.warn('[TB]', 'toolbarReceiveForwardFocus', 'Toolbar settings not available!');
                        return;
                    }
                    for (var i = 0, l = toolButtonNames.length; i < l; i++) {
                        var buttonName = toolButtonNames[i];
                        var buttonSettings = settings[buttonName];
                        if (!buttonSettings) {
                            $log.debug('[TB]', 'toolbarReceiveForwardFocus', 'Button settings for ' + buttonName + ' not available!');
                            continue;
                        }
                        if (buttonSettings.visible && buttonSettings.visible() &&
                            buttonSettings.disabled && !buttonSettings.disabled()) {
                            $log.debug('[TB]', 'toolbarReceiveForwardFocus', 'focus on ' + buttonName);
                            $element.find('button[button-name="' + buttonName + '"]').focus();
                            break;
                        }
                    }
                }));

                rootScopeListenerFns.push(eventManagerService.on(constantService.EVENTNAMES.toolbarReceiveBackwardFocus, function ($event) {
                    $log.info('[TB]', 'toolbarReceiveBackwardFocus');
                    var settings = $scope.settings;
                    if (!settings) {
                        $log.warn('[TB]', 'toolbarReceiveBackwardFocus', 'Toolbar settings not available!');
                        return;
                    }
                    for (var i = toolButtonNames.length - 1, l = 0; i >= l; i--) {
                        var buttonName = toolButtonNames[i];
                        var buttonSettings = settings[buttonName];
                        if (!buttonSettings) {
                            $log.debug('[TB]', 'toolbarReceiveBackwardFocus', 'Button settings for ' + buttonName + ' not available!');
                            continue;
                        }
                        if (buttonSettings.visible && buttonSettings.visible() &&
                            buttonSettings.disabled && !buttonSettings.disabled()) {
                            $log.debug('[TB]', 'toolbarReceiveBackwardFocus', 'focus on ' + buttonName);
                            $element.find('button[button-name="' + buttonName + '"]').focus();
                            break;
                        }
                    }
                }));

                rootScopeListenerFns.push(eventManagerService.on(constantService.EVENTNAMES.bilingualToggleEvent,
                    function ($event) {
                        $log.info('[TB]', 'item loaded');
                        $scope.bilingualLanguage = contentDataService.getBilingualLanguage();
                    }));

                // remove focusin listeners on $destroy
                $element.on('$destroy', function () {
                    for (var i = 0, l = rootScopeListenerFns.length; i < l; i++) {
                        rootScopeListenerFns[i]();
                    }
                });

                //#endregion

                //#region Last-focused Element Support

                // Initialize extendInfo container
                $scope.extendedInfo = {
                    lastFocusedElement: null
                }

                // Initialize focusin listeners
                var focusInListeners = {};
                focusInListeners['button'] = function (event) {
                    $scope.extendedInfo.lastFocusedElement = angular.element(event.relatedTarget);
                };

                // register focusin listeners on DOM mutation
                initMutationObserver(function (mutations) {
                    removeButtonFocusInListeners($element, focusInListeners);
                    addButtonFocusInListeners($element, focusInListeners);
                    addButtonKeydownListeners($element, focusInListeners);
                });

                // add focusin listeners (initial pass)
                addButtonFocusInListeners($element, focusInListeners);

                // remove focusin listeners on $destroy
                $element.on('$destroy', function () {
                    removeButtonFocusInListeners($element, focusInListeners);
                });

                function addButtonFocusInListeners($element, focusInListeners) {
                    for (var id in focusInListeners) {
                        $element.find(id).on('focusin', focusInListeners[id]);
                    }
                }

                function removeButtonFocusInListeners($element, focusInListeners) {
                    for (var id in focusInListeners) {
                        $element.find(id).off('focusin', focusInListeners[id]);
                        $element.find(id).off('keydown', keydownHandler);
                        $element.find(id).off('focusout', focusoutHandler);
                    }
                }

                var $lastKeyEvent = null;

                function keydownHandler($event) {
                    $lastKeyEvent = $event;
                    console.log('keydown', $event);
                    if ($event.originalEvent) {
                        switch ($event.originalEvent.code) {
                            case 'Space':
                                //enaep is handling the translation of space or keydown to click, so prevent any default "button" keydown 
                                //processing to ensure keydown will translate to only one click 
                                angular.element($event.target).click();
                                $event.preventDefault();
                                break;
                        }
                    }
                }

                function focusoutHandler($event) {
                    console.log('focusout', $event, $scope.$lastKeyEvent);
                    $lastKeyEvent = null;
                    var currButtonName = this.getAttribute('button-name');

                    var nextButtonName = $event.relatedTarget ? $event.relatedTarget.getAttribute('button-name') : '';

                    $log.debug('[TB]', 'toolbar button focusout', currButtonName, '=>', nextButtonName);
                    // check if target is a toolbar button
                    if (toolButtonNames.indexOf(nextButtonName) !== -1) {
                        return;
                    }

                    var settings = $scope.settings;
                    if (!settings) {
                        $log.warn('[TB]', 'toolbarReceiveForwardFocus', 'Toolbar settings not available!');
                        return;
                    }

                    // loop through toolbar button settings from the left
                    for (var i = 0, l = toolButtonNames.length; i < l; i++) {
                        var buttonName = toolButtonNames[i];
                        var buttonSettings = settings[buttonName];
                        if (!buttonSettings) {
                            $log.debug('[TB]', 'toolbarReceiveForwardFocus', 'Button settings for ' + buttonName + ' not available!');
                            continue;
                        }
                        if (buttonSettings.visible && buttonSettings.visible() &&
                            buttonSettings.disabled && !buttonSettings.disabled()) {
                            // check if enabled button is source
                            if (buttonName === currButtonName) {
                                $log.info('[TB]', 'button focusout', 'backward');
                                eventManagerService.emit(constantService.EVENTNAMES.toolbarLostFocusEvent, { direction: 'backward', via: $lastKeyEvent != null && $lastKeyEvent.key === 'Tab' ? 'keyboard' : 'mouse' });
                                return;
                            }
                            break;
                        }
                    }

                    // loop through toolbar button settings from the right
                    for (var i = toolButtonNames.length - 1, l = 0; i >= l; i--) {
                        var buttonName = toolButtonNames[i];
                        var buttonSettings = settings[buttonName];
                        if (!buttonSettings) {
                            $log.debug('[TB]', 'toolbarReceiveForwardFocus', 'Button settings for ' + buttonName + ' not available!');
                            continue;
                        }
                        if (buttonSettings.visible && buttonSettings.visible() &&
                            buttonSettings.disabled && !buttonSettings.disabled()) {
                            // check if enabled button is source
                            if (buttonName === currButtonName) {
                                $log.info('[TB]', 'button focusout', 'forward');
                                eventManagerService.emit(constantService.EVENTNAMES.toolbarLostFocusEvent, { direction: 'forward', via: $lastKeyEvent != null && $lastKeyEvent.key === 'Tab' ? 'keyboard' : 'mouse' });
                                return;
                            }
                            break;
                        }
                    }
                }

                function addButtonKeydownListeners($element, focusInListeners) {
                    for (var id in focusInListeners) {
                        $element.find(id).on('keydown', keydownHandler);
                        $element.find(id).on('focusout', focusoutHandler);
                    }
                }


                function initMutationObserver(callback) {
                    if (window.MutationObserver) {
                        var observer = new MutationObserver(callback);
                        var config = { childList: true, subtree: true };
                        observer.observe($element[0], config);
                        $element.on('$destroy', function () {
                            observer.disconnect();
                        });
                    }
                }

                $timeout(function () {
                    // Determine the current language. 
                    const defaultLanguage = 'en-US';
                    const currentLanguage = contentDataService.getBilingualLanguage();

                    // For non-bilingual booklets, contentDataService.getBilingualLanguage() returns null
                    // We'll use English for that case
                    $scope.bilingualLanguage = currentLanguage ? currentLanguage : defaultLanguage;
                });
                //#endregion

                $scope.getItemTitle = function () {
                    const accessionNumber = _.get($scope, ['settings', 'display', 'accessionNumber']) || {
                        text: function () {
                            return '';
                        }
                    };
                    const accessionNumberText = accessionNumber.text() || '';

                    if (/^HELP/.test(accessionNumberText)) {
                        return accessionNumberText;
                    } else {
                        const readingSceneId = _.get($scope, ['settings', 'display', 'readingSceneId']) || {
                            text: function () {
                                return '';
                            }
                        };
                        return readingSceneId.text();
                    }
                };
            }
        };
    }

    angular.module(appName).directive('enaepToolbar', ToolBarDirectiveFactory);
})(angular, 'TutorialApp');