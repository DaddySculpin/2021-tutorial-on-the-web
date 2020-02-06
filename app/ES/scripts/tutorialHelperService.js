/*jslint node:true, white:true, devel:true, debug:true, todo:true, nomen:true*/
/*global angular */

(function () {
    'use strict';

    // ---------------------------------------------------------------------------------------------
    // This service acts as a buffer between the Tutorial content (created externally)
    // using Captivate and Edge.
    // Provides a consistent communication 'interface' between the Assessment Solution
    // and the Tutorial content.
    // This service places the enaepPlatform on the $window object because the tutorial 
    // runs within an iframe and is a self contained document over which the assessment
    // solution does not have much control.
    // ---------------------------------------------------------------------------------------------

    function TutorialHelperService($window, $log, $rootScope, constantService, themeService, zoomService, eventManagerService) {
        var _scope = null;
        var BUTTON_STATES = {
            ACTIVE: 'active',
            INACTIVE: 'inactive',
            AVAILABLE: 'available',
            UNAVAILABLE: 'unavailable',
            CLICKABLE: 'clickable',
            UNCLICKABLE: 'unclickable'
        };
        var BUTTONS = {
            THEME: 'theme',
            HELP: 'help',
            TTS: 'tts',
            ZOOMOUT: 'zoomout',
            ZOOMIN: 'zoomin',
            SCRATCHWORK: 'scratchwork',
            SCRATCHWORK_WRAPPER: 'scratchwork-wrapper',
            SCRATCHWORK_DRAW: 'scratchwork-draw',
            SCRATCHWORK_ERASE: 'scratchwork-erase',
            SCRATCHWORK_HIGHLIGHT: 'scratchwork-highlight',
            SCRATCHWORK_CLEAR: 'scratchwork-clear',
            CALCULATOR: 'calculator',
            BILINGUAL_TOGGLE: 'bilingual-toggle',
            EQUATION_EDITOR_TOGGLE: 'equation-editor-toggle',
            TIMER: 'timer',
            PREVIOUS: 'previous',
            NEXT: 'next'
        };
        var LANGUAGE = {
            EN: constantService.LANGUAGETYPES.ENGLISH,
            ES: constantService.LANGUAGETYPES.SPANISH
        }

        //#region   //   Models

        function IconState(name, enabled, clickable, active) {
            this.name = name;
            this.enabled = enabled;
            this.clickable = clickable;
            this.active = active;
        }
        IconState.prototype.isIconActive = function isIconActive() {
            return this.active === true;
        };
        IconState.prototype.isIconInactive = function isIconInactive() {
            return this.active === false;
        };
        IconState.prototype.isIconEnabled = function isIconEnabled() {
            return this.enabled === true;
        };
        IconState.prototype.isIconDisabled = function isIconDisabled() {
            return this.enabled === false;
        };
        IconState.prototype.isIconClickable = function isIconClickable() {
            return this.clickable === true;
        };
        IconState.prototype.isIconUnclickable = function isIconUnclickable() {
            return this.clickable === false;
        };
        IconState.prototype.setIconState = function setIconState(stateName) {

            $log.debug('##(TUT-HLP) setIconState setting state: ', stateName);

            switch (stateName) {
                case BUTTON_STATES.ACTIVE:
                    this.active = true;
                    break;
                case BUTTON_STATES.INACTIVE:
                    this.active = false;
                    break;
                case BUTTON_STATES.AVAILABLE:
                    this.active = false;
                    this.enabled = true;
                    break;
                case BUTTON_STATES.UNAVAILABLE:
                    this.active = false;
                    this.enabled = false;
                    break;
                case BUTTON_STATES.CLICKABLE:
                    this.clickable = true;
                    break;
                case BUTTON_STATES.UNCLICKABLE:
                    this.clickable = false;
                    break;
                default:
                    $log.error('##(TUT-HLP) setIconState called with invalid state name: ', stateName);
                    break;
            }
        };

        function IconStylePair(key, value) {
            this.key = key;
            this.value = value;
        }
        function IconStyle(name, initialKey, keyClassPairArray) {
            this.name = name;
            this.key = initialKey;
            this.keyClassPairArray = keyClassPairArray;
        }
        IconStyle.prototype.setKey = function setKey(newKey) {
            this.key = newKey;
        };
        IconStyle.prototype.getKey = function getKey() {
            return this.key;
        };
        IconStyle.prototype.getCurrentIconStyle = function getCurrentIconStyle() {
            var realThis = this;
            var iconStylePair = realThis.keyClassPairArray.find(function (elm) {
                return elm.key === realThis.key;
            });

            return iconStylePair.value;
        }


        // #endregion

        //  Tutorial -> enaepPlatform -> tutorialObject -> eNAEP
        var enaepPlatform;
        var tutorialObject = {
            scratchworkManager: null,
            iconStates: {
                themeIconState: new IconState(BUTTONS.THEME, true, false, false),
                helpIconState: new IconState(BUTTONS.HELP, true, false, false),
                ttsIconState: new IconState(BUTTONS.TTS, true, false, false),
                zoomOutIconState: new IconState(BUTTONS.ZOOMOUT, true, false, false),
                zoomInIconState: new IconState(BUTTONS.ZOOMIN, true, false, false),
                scratchworkIconState: new IconState(BUTTONS.SCRATCHWORK, true, false, false),
                scratchworkIconWrapperState: new IconState(BUTTONS.SCRATCHWORK_WRAPPER, false, false, false),
                scratchworkDrawIconState: new IconState(BUTTONS.SCRATCHWORK_DRAW, true, false, false),
                scratchworkEraseIconState: new IconState(BUTTONS.SCRATCHWORK_ERASE, true, false, false),
                scratchworkHighlightIconState: new IconState(BUTTONS.SCRATCHWORK_HIGHLIGHT, true, false, false),
                scratchworkClearIconState: new IconState(BUTTONS.SCRATCHWORK_CLEAR, true, false, false),
                calculatorIconState: new IconState(BUTTONS.CALCULATOR, true, false, false),
                bilingualIconState: new IconState(BUTTONS.BILINGUAL_TOGGLE, true, false, false),
                equationEditorIconState: new IconState(BUTTONS.EQUATION_EDITOR_TOGGLE, true, false, false),
                timerIconState: new IconState(BUTTONS.TIMER, true, false, false),
                nextButtonIconState: new IconState(BUTTONS.NEXT, false, false, false),
                previousButtonIconState: new IconState(BUTTONS.PREVIOUS, false, false, false)
            },
            iconStyles: {
                bilingualIconStyle: new IconStyle(BUTTONS.BILINGUAL_TOGGLE, LANGUAGE.EN, [
                    new IconStylePair(LANGUAGE.EN, 'bilingualToggle tool'),
                    new IconStylePair(LANGUAGE.ES, 'bilingualToggle_es tool')
                ])
            },

            calculatorIconClicked: function calculatorIconClicked() {
                $log.debug('tutorial.calculatorIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.calculatorIconClicked)) {
                    $log.debug('$window.enaepTutorial.calculatorIconClicked executed.');
                    $window.enaepTutorial.calculatorIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.calculatorIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            equationEditorIconClicked: function equationEditorIconClicked() {
                $log.debug('tutorial.equationEditorIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.equationEditorIconClicked)) {
                    $log.debug('$window.enaepTutorial.equationEditorIconClicked executed.');
                    $window.enaepTutorial.equationEditorIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.equationEditorIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            themeIconClicked: function themeIconClicked() {
                $log.debug('tutorial.themeIconClicked called');

                // Tell eNAEP toolbar to change theme
                enaepPlatform.changeTheme();
            },
            ttsIconClicked: function ttsIconClicked() {
                $log.debug('tutorial.ttsIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.ttsIconClicked)) {
                    $log.debug('$window.enaepTutorial.ttsIconClicked executed.');
                    $window.enaepTutorial.ttsIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.ttsIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            scratchworkIconClicked: function scratchworkIconClicked() {
                $log.debug('tutorial.scratchworkIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.scratchworkIconClicked)) {
                    $log.debug('$window.enaepTutorial.scratchworkIconClicked executed.');
                    $window.enaepTutorial.scratchworkIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.scratchworkIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            scratchworkDrawIconClicked: function scratchworkDrawIconClicked() {
                $log.debug('tutorial.scratchworkDrawIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.scratchworkDrawIconClicked)) {
                    $log.debug('$window.enaepTutorial.scratchworkDrawIconClicked executed.');
                    $window.enaepTutorial.scratchworkDrawIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.scratchworkDrawIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            scratchworkEraseIconClicked: function scratchworkEraseIconClicked() {
                $log.debug('tutorial.scratchworkEraseIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.scratchworkEraseIconClicked)) {
                    $log.debug('$window.enaepTutorial.scratchworkEraseIconClicked executed.');
                    $window.enaepTutorial.scratchworkEraseIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.scratchworkEraseIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            scratchworkHighlightIconClicked: function scratchworkHighlightIconClicked() {
                $log.debug('tutorial.scratchworkHighlightIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.scratchworkHighlightIconClicked)) {
                    $log.debug('$window.enaepTutorial.scratchworkHighlightIconClicked executed.');
                    $window.enaepTutorial.scratchworkHighlightIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.scratchworkHighlightIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },
            scratchworkClearIconClicked: function scratchworkClearIconClicked() {
                $log.debug('tutorial.scratchworkClearIconClicked called');
                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.scratchworkClearIconClicked)) {
                    $log.debug('$window.enaepTutorial.scratchworkClearIconClicked executed.');
                    $window.enaepTutorial.scratchworkClearIconClicked();
                } else {
                    $log.warn('window.enaepTutorial.scratchworkClearIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            }
        };

        //  Tutorial -> enaepPlatform
        enaepPlatform = {
            BUTTONS: BUTTONS,
            LANGUAGE: LANGUAGE,

            makeBlue: function makeBlue(buttonName) {
                $log.debug('##(TUT-HLP) enaepPlatform.makeBlue ', buttonName);
                applyStateChange(buttonName, BUTTON_STATES.ACTIVE);
            },
            makeBlack: function makeBlack(buttonName) {
                $log.debug('##(TUT-HLP) enaepPlatform.makeBlack ', buttonName);
                applyStateChange(buttonName, BUTTON_STATES.AVAILABLE);
            },
            makeGray: function makeGray(buttonName) {
                $log.debug('##(TUT-HLP) enaepPlatform.makeGray ', buttonName);
                applyStateChange(buttonName, BUTTON_STATES.UNAVAILABLE);
            },

            makeClickable: function makeClickable(buttonName) {
                $log.debug('##(TUT-HLP) enaepPlatform.makeClickable ', buttonName);
                applyStateChange(buttonName, BUTTON_STATES.CLICKABLE);
            },
            makeUnclickable: function makeUnclickable(buttonName) {
                $log.debug('##(TUT-HLP) enaepPlatform.makeUnclickable ', buttonName);
                applyStateChange(buttonName, BUTTON_STATES.UNCLICKABLE);
            },

            changeTheme: function changeTheme() {
                $log.debug('##(TUT-HLP) enaepPlatform.changeTheme');
                safeApply(function () {
                    if (_scope.tutorial.iconStates.themeIconState.isIconEnabled()) {
                        var nextTheme = themeService.setNextTheme();
                        $log.debug('##(TUT-HLP) enaepPlatform.changeTheme: changing theme to ', nextTheme);
                        eventManagerService.emit(constantService.EVENTNAMES.themeChangedEvent, nextTheme);
                    }
                });

                // Tell tutorial module what the new theme is so it can change theme
                const currentThemeTutorialShouldBeShowing = enaepPlatform.getCurrentTheme();

                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.themeIconClicked)) {
                    $log.debug('$window.enaepTutorial.themeIconClicked executed.');

                    // TODO - remove this try/catch when all the tutorials are implemented.
                    try {
                        $window.enaepTutorial.themeIconClicked(currentThemeTutorialShouldBeShowing);
                    } catch (e) {
                        $log.error('Exception caught for $window.enaepTutorial.themeIconClicked for tutorial: ');
                    }
                } else {
                    $log.warn('window.enaepTutorial.themeIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },

            getCurrentTheme: function () {
                $log.debug('##(TUT-HLP) enaepPlatform.getCurrentTheme - Proof of Concept');
                const themeName = themeService.getCurrentThemeName();
                let themeValueForTutorial = 0;
                switch (themeName) {
                    case constantService.THEMES.BRUSHED.name:
                        themeValueForTutorial = 0;
                        break;
                    case constantService.THEMES.LOW.name:
                        themeValueForTutorial = 1;
                        break;
                    case constantService.THEMES.HIGH.name:
                        themeValueForTutorial = 2;
                        break;
                }

                return themeValueForTutorial;
            },

            setCurrentTheme: function (themeName) {
                let themeValueForTutorial = 0;
                switch (themeName) {
                    case constantService.THEMES.BRUSHED.name:
                        themeValueForTutorial = 0;
                        break;
                    case constantService.THEMES.LOW.name:
                        themeValueForTutorial = 1;
                        break;
                    case constantService.THEMES.HIGH.name:
                        themeValueForTutorial = 2;
                        break;
                }
                // Tell tutorial module what the new theme is so it can change theme
                const currentThemeTutorialShouldBeShowing = themeValueForTutorial;

                if (angular.isDefined($window.enaepTutorial) && angular.isFunction($window.enaepTutorial.themeIconClicked)) {
                    $log.debug('$window.enaepTutorial.themeIconClicked executed.');

                    // TODO - remove this try/catch when all the tutorials are implemented.
                    try {
                        $window.enaepTutorial.themeIconClicked(currentThemeTutorialShouldBeShowing);
                    } catch (e) {
                        $log.error('Exception caught for $window.enaepTutorial.themeIconClicked for tutorial: ');
                    }
                } else {
                    $log.warn('window.enaepTutorial.themeIconClicked is not present on the window.enaepTutorial object. The tutorial is supposed to place this function.');
                }
            },

            expandScratchwork: function expandScratchwork() {
                $log.debug('##(TUT-HLP) enaepPlatform.expandScratchwork');
                safeApply(function () {
                    if (_scope.tutorial.iconStates.scratchworkIconState.isIconEnabled()) {
                        $log.debug('##(TUT-HLP) enaepPlatform.expandScratchwork: expanding scratchwork');
                        _scope.tutorial.iconStates.scratchworkIconWrapperState.setIconState(BUTTON_STATES.ACTIVE);

                        _scope.tutorial.iconStates.scratchworkDrawIconState.setIconState(BUTTON_STATES.ACTIVE);
                        _scope.tutorial.iconStates.scratchworkEraseIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        _scope.tutorial.iconStates.scratchworkHighlightIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        _scope.tutorial.iconStates.scratchworkClearIconState.setIconState(BUTTON_STATES.AVAILABLE);
                       // _scope.tutorial.iconStates.themeIconState.setIconState(BUTTON_STATES.UNAVAILABLE);

                        // _scope.resizeToolbarWithDelay();
                    }
                });
            },
            collapseScratchwork: function collapseScratchwork() {
                $log.debug('##(TUT-HLP) enaepPlatform.collapseScratchwork');
                safeApply(function () {
                    if (_scope.tutorial.iconStates.scratchworkIconState.isIconActive()) {
                        $log.debug('##(TUT-HLP) enaepPlatform.collapseScratchwork: collapsing scratchwork');
                        _scope.tutorial.iconStates.scratchworkIconWrapperState.setIconState(BUTTON_STATES.AVAILABLE);

                        _scope.tutorial.iconStates.scratchworkDrawIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        _scope.tutorial.iconStates.scratchworkEraseIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        _scope.tutorial.iconStates.scratchworkHighlightIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        _scope.tutorial.iconStates.scratchworkClearIconState.setIconState(BUTTON_STATES.AVAILABLE);
                        //_scope.tutorial.iconStates.themeIconState.setIconState(BUTTON_STATES.AVAILABLE);

                        // _scope.resizeToolbarWithDelay();
                    }
                });
            },

            clickNextButton: function clickNextButton() {
                $log.debug('##(TUT-HLP) enaepPlatform.clickNextButton: clicking Next button');
                _scope.next();
            },

            triggerRaiseHandError: function triggerRaiseHandError() {
                eventManagerService.emit(constantService.EVENTNAMES.enaepErrorEvent);
            },
            recordObservable: function recordObservable(eventType, extendedInfo) {
            },

            getZoom: function () {
                return zoomService.currentZoom();
            },

            // this call is used to change the state of the Change Language tool button, and NOT the actual bilingual state of the application...
            changeBilingualState: function changeBilingualState(languageName) {
                $log.debug('##(TUT-HLP) enaepPlatform.changeBilingualState');
                switch (languageName) {
                    case LANGUAGE.EN:
                    case LANGUAGE.ES:
                        safeApply(function () {
                            $log.debug('##(TUT-HLP) enaepPlatform.changeBilingualState: changing language to: ', languageName);
                            _scope.tutorial.iconStyles.bilingualIconStyle.setKey(languageName);
                        });
                        break;
                    default:
                        $log.error('##(TUT-HLP) changeBilingualState called with invalid language: ', languageName);
                        break;
                }
            },

            // this call is used to select language on the Language Selection item ONLY
            selectLanguage: function selectLanguage(languageName) {
                $log.debug('##(TUT-HLP) enaepPlatform.selectLanguage', languageName);
                switch (languageName) {
                    case LANGUAGE.EN:
                    case LANGUAGE.ES:
                        safeApply(function () {
                            $log.debug('##(TUT-HLP) enaepPlatform.selectLanguage: changing language to: ', languageName);
                            eventManagerService.emit(constantService.EVENTNAMES.languageSelectEvent, languageName);
                        });
                        break;
                    default:
                        $log.error('##(TUT-HLP) selectLanguage called with invalid language: ', languageName);
                        break;
                }
            },

            // this call is used to toggle bilingual state of the application
            toggleBilingualLanguage: function toggleBilingualLanguage() {
                safeApply(function () {
                    $log.debug('##(TUT-HLP) enaepPlatform.toggleBilingualLanguage');
                    //switch (contentDataService.getBilingualLanguage()) {
                    //    case contentDataService.SUPPORTED_LANGUAGES.EN_US:
                    //        this.changeBilingualState(LANGUAGE.ES);
                    //        break;
                    //    default:
                    //        this.changeBilingualState(LANGUAGE.EN);
                    //        break;
                    //}
                    eventManagerService.emit(constantService.EVENTNAMES.bilingualToggleEvent);
                });
            }
        };

        function init(scope) {
            _scope = scope;

            // The tutorial expects the window object to contain the enaepPlatform objects
            $window.enaepPlatform = enaepPlatform;

            // Place the tutFrameLoaded function on window. This is invoked when the tutorial frame loads.
            $window.tutFrameLoaded = function (tutFrameName) {
                // Get a reference to the tutorial iframe.
                var tutFrame = angular.element('#' + tutFrameName)[0];

                if (angular.isObject(tutFrame)) {
                    // Add a keydown event handler to allow for ALT+FN+F9 to work.
                    tutFrame.contentWindow.document.addEventListener('keydown', function (event) {
                        switch (event.keyCode) {
                            case 120:       // F9 key
                                // show supervisor access modal dialog on Alt+F9
                                if (event.altKey) {
                                    eventManagerService.emit('adminAccessDialogRequested');
                                    event.stopPropagation();
                                }
                                break;
                            case 33:        // pg up
                            case 34:        // pg down
                                event.stopPropagation();
                                event.preventDefault();
                                break;
                        }
                    }, true);
                }
            };
        }
        function safeApply(fn) {
            var phase = _scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                _scope.$eval(fn);
            } else {
                _scope.$apply(fn);
            }
        }
        function applyStateChange(buttonName, stateValue) {

            function setButtonState(btn, state) {
                switch (btn) {
                    case enaepPlatform.BUTTONS.THEME:
                        tutorialObject.iconStates.themeIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.HELP:
                        tutorialObject.iconStates.helpIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.TTS:
                        tutorialObject.iconStates.ttsIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.ZOOMOUT:
                        tutorialObject.iconStates.zoomOutIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.ZOOMIN:
                        tutorialObject.iconStates.zoomInIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.SCRATCHWORK:
                        tutorialObject.iconStates.scratchworkIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.SCRATCHWORK_DRAW:
                        tutorialObject.iconStates.scratchworkDrawIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.SCRATCHWORK_ERASE:
                        tutorialObject.iconStates.scratchworkEraseIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.SCRATCHWORK_HIGHLIGHT:
                        tutorialObject.iconStates.scratchworkHighlightIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.SCRATCHWORK_CLEAR:
                        tutorialObject.iconStates.scratchworkClearIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.CALCULATOR:
                        tutorialObject.iconStates.calculatorIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.BILINGUAL_TOGGLE:
                        tutorialObject.iconStates.bilingualIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.EQUATION_EDITOR_TOGGLE:
                        tutorialObject.iconStates.equationEditorIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.TIMER:
                        tutorialObject.iconStates.timerIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.NEXT:
                        tutorialObject.iconStates.nextButtonIconState.setIconState(state);
                        break;
                    case enaepPlatform.BUTTONS.PREVIOUS:
                        tutorialObject.iconStates.previousButtonIconState.setIconState(state);
                        break;
                    default:
                        $log.error('##(TUT-HLP) applyStateChange -> setButtonState called with invalid button name: ', btn, ' to change state to: ', state);
                        break;
                }
            }

            safeApply(function () {
                setButtonState(buttonName, stateValue);
            });
        }

        return {
            init: init,
            tutorialObject: tutorialObject
        };
    }

    TutorialHelperService.$inject = ['$window', '$log', '$rootScope', 'constantService', 'themeService', 'zoomService', 'eventManagerService'];

    angular.module('TutorialApp').service('tutorialHelperService', TutorialHelperService);

})();
