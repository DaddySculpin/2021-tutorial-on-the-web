
(function () {
    'use strict';

    angular.module('scratchworkModule')
        .service('scratchworkService', [
            '$q', 'loggerService', 'scratchworkRepositoryService', 'languageService', '$rootScope', '$document',
            'constantService', '$timeout', 'observableEventService',
            function (
                $q, loggerService, repository, language, $rootScope, $document,
                globalConstants, appState, $timeout, observableEventService) {

                var logger = loggerService.create('SW');
                var currentLanguage = language.getLanguageData();
                var eventTypeEnums = observableEventService.getEventTypeEnums();
                var scratchworkManager;

                //#region   //  Constants

                var namesOfSelectors = {
                    MainContainer: '#studentAssessmentContainer',
                    CanvasContainer: '#scratchPad',
                    ParentCanvas: '#scratchPadParentCanvas',
                    ParentContent: '#ParentItem',
                    ItemCanvas: '#scratchPadItemCanvas',
                    ItemContent: '#innerContentArea',
                    ContentArea: '#ContentArea',

                    AllButtons: 'input[type=button]',
                    AllRadioButtons: 'input[type=radio]',
                    AllCheckboxes: 'input[type=checkbox]',
                    AllTextboxes: 'input[type=text]',
                    AllTextareas: 'textarea',
                    AllInlineChoiceDropdowns: 'label.inlineChoiceDropdown',
                    AllEliminationChoices: '.mc-eliminate-choice',
                    MatchingMSChoices: '.MatchMS',
                    MatchingMSChoicesWithImage: '.MatchMS .background_image',
                    MultipleFillInBlanks: '.MultipleFillInBlank',
                    MultipleFillInBlanksWithImage: '.MultipleFillInBlank .background_image',
                    ZoneSelections: '.ZonesMS',
                    ConstructedResponses: '.response_constructed',
                    AllWritingAudios: '#stimulus audio',
                    AllWritingVideos: '#stimulus video',
                    WritingControls: '#writing-mode-controls-container',
                    StandaloneStatement: '.standalone_statement',
                    ZoneChoiceList: '.zone_choice_list',
                    ZoneChoiceListWithImages: '.zone_choice_list div.background_image.map',
                    Interactive: '.Interactive',
                    InteractiveLowercase: '.interactive',

                    EReaderIFrame: '#stimFrame',
                    EReaderQuestionsButton: '#QuestionsButton',
                    EReaderMainItemContainer: '#enaepEreaderContainer',
                    EReaderItemCanvasContainer: '#scratchPadEReader',
                    EReaderItemCanvas: '#scratchPadEReaderItemCanvas',
                    EReaderItemContent: '#childItem',
                    EReaderTabStrip: '#enaepEreaderTabStrip',

                    IFrameMainContainer: 'body #iframeScratchpadMainContainer',
                    IFrameCanvasContainer: 'body #iframeScratchpadCanvasContainer',
                    IFrameCanvas: 'body #iframeScratchpadCanvas',
                    IFrameContent: '.scroll',

                    WritingMainItemContainer: '#enaepWritingContainer',
                    WritingItemCanvasContainer: '#scratchPadWriting',
                    WritingItemCanvas: '#scratchPadWritingItemCanvas',
                    WritingItemContentParent: '#stimulus',
                    WritingItemContent: '#stimulus .passage',

                    ToolbarBackground: '#student-toolbar-background',
                    TabStrip: '#enaepTabStrip',
                    Toolbar: '#student-toolbar'
                };
                var namesOfItemModes = {
                    None: 'none',
                    Item: 'item',
                    SharedStimulus: globalConstants.ITEMLAYOUTS.SHARED_STIMULUS_CHILD.value,
                    EReaderParent: globalConstants.ITEMLAYOUTS.EREADER_PARENT.value,
                    EReaderChild: globalConstants.ITEMLAYOUTS.EREADER_CHILD.value
                };
                var namesOfToolModes = {
                    None: 'none',
                    Scratchwork: 'scratchwork',
                    ToolWrapper: 'toolWrapper',
                    Draw: 'draw',
                    Erase: 'erase',
                    Highlight: 'highlight',
                    Clear: 'clear'
                };
                var namesOfStates = {
                    Disabled: 'disabled',
                    Enabled: 'enabled',
                    Active: 'active',
                    Inactive: 'inactive'
                };
                var toolTips = {
                    scratchwork: {
                        disabled: currentLanguage.SCRATCHWORK_DISABLED,
                        enabled: currentLanguage.SCRATCHWORK_ENABLED,
                        active: currentLanguage.SCRATCHWORK_ACTIVE
                    },
                    toolWrapper: {
                        disabled: "",
                        enabled: "",
                        active: "",
                    },
                    draw: {
                        disabled: currentLanguage.SCRATCHWORK_DRAW_DISABLED,
                        enabled: currentLanguage.SCRATCHWORK_DRAW_ENABLED,
                        active: currentLanguage.SCRATCHWORK_DRAW_ACTIVE
                    },
                    erase: {
                        disabled: currentLanguage.SCRATCHWORK_ERASE_DISABLED,
                        enabled: currentLanguage.SCRATCHWORK_ERASE_ENABLED,
                        active: currentLanguage.SCRATCHWORK_ERASE_ACTIVE
                    },
                    highlight: {
                        disabled: currentLanguage.SCRATCHWORK_HIGHLIGHT_DISABLED,
                        enabled: currentLanguage.SCRATCHWORK_HIGHLIGHT_ENABLED,
                        active: currentLanguage.SCRATCHWORK_HIGHLIGHT_ACTIVE
                    },
                    clear: {
                        disabled: currentLanguage.SCRATCHWORK_CLEAR_DISABLED,
                        enabled: currentLanguage.SCRATCHWORK_CLEAR_ENABLED,
                        active: currentLanguage.SCRATCHWORK_CLEAR_ACTIVE
                    }
                };
                var cssToolbarStyles = {
                    scratchwork: {
                        inactive: "ScratchPad tool binary",
                        active: "ScratchPad tool binary active",
                        disabled: "ScratchPad tool binary disabled"
                    },
                    toolWrapper: {
                        inactive: "tool ScratchPad_SubPanel hidden",
                        active: "tool ScratchPad_SubPanel"
                    },
                    draw: {
                        inactive: "ScratchPad_Draw tool",
                        active: "ScratchPad_Draw tool active"
                    },
                    erase: {
                        inactive: "ScratchPad_Erase tool",
                        active: "ScratchPad_Erase tool active"
                    },
                    highlight: {
                        inactive: "highlighter tool",
                        active: "highlighter tool active"
                    },
                    clear: {
                        inactive: "ScratchPad_Clear tool",
                        active: "ScratchPad_Clear tool"
                    },
                    cursors: {
                        draw: "drawCursor",
                        erase: "eraseCursor",
                        highlight: "highlighterCursor"
                    },
                    content: {
                        active: "studentAssessmentContainerInReadOnlyMode",
                        inactive: "studentAssessmentContainerInEditMode"
                    },
                    scratchPad: {
                        active: "scratchPadInEditMode",
                        inactive: "scratchPadInReadOnlyMode"
                    },
                    canvas: {
                        active: "canvasInEditMode",
                        inactive: "canvasInReadOnlyMode",
                        inactiveReading: "canvasInReadOnlyModeForReading",
                        inactiveReadingOther: "canvasInReadOnlyModeForReadingOther",
                        inactiveMath: "canvasInReadOnlyModeForMath",
                        inactiveMathOther: "canvasInReadOnlyModeForMathOther",
                        inactiveWriting: "canvasInReadOnlyModeForWriting",
                        inactiveWritingOther: "canvasInReadOnlyModeForWritingOther",
                        reading: "canvasInEditModeForReading",
                        readingOther: "canvasInEditModeForReadingOther",
                        math: "canvasInEditModeForMath",
                        mathOther: "canvasInEditModeForMathOther",
                        writing: "canvasInEditModeForWriting",
                        writingOther: "canvasInEditModeForWritingOther"
                    }
                };
                var scratchworkDimensions = {
                    reading: {
                        parent: {
                            height: -1
                        },
                        item: {
                            height: 1060
                        }
                    },
                    ereaderScrollableContent: {
                        OnTheWayToSchool_VH131036: {
                            height: 2350,
                            width: 699
                        }
                    },
                    math: {
                        parent: {
                            height: -1
                        },
                        item: {
                            height: 1483
                        }
                    },
                    adjustments: {
                        itemWidth: 4,
                        itemHeight: 56,
                        eReaderWidth: 2,
                        eReaderHeight: 2,
                        writingWidth: 9,
                        writingHeight: 25,
                        tabstrip: 65
                    }
                };
                var cssSetupStyles = {
                    initialization: {
                        "position": 'relative',
                        "z-index": '3'
                    },
                    imageInitialization: {
                        "background-color": 'rgba(255, 255, 255, 1)',
                        "background-blend-mode": 'color'
                    },
                    disableInputs: {
                        "pointer-events": 'none'
                    },
                    enableInputs: {
                        "pointer-events": ''
                    }
                };
                var namesOfEReaderAccessionNumbers = {
                    SmithsonianKidsCollecting_VH314409: 'VH314409',
                    BigFish_VH316571: 'VH316571',
                    OnTheWayToSchool_VH131036: 'VH131036'
                };

                //#endregion


                //#region   //  Models

                function SharedScratchworkItemInfo(itemId, studentId, accessionNumber, scratchwork) {
                    this.itemId = itemId;
                    this.studentId = studentId;
                    this.accessionNumber = accessionNumber;
                    this.scratchwork = scratchwork;

                    if (!this.itemId || !this.studentId) {
                        logger.setLoggerName('SharedScratchworkItemInfo')
                            .debug('One or more key identifiers are invalid. Throwing exception. Received ItemInfo: ' + angular.toJson(this));
                        throw new ScratchworkException("One or more key identifiers are invalid. Make sure that itemId and studentId have a valid value.");
                    }
                };

                function ItemInfo(blockId, itemId, studentId, scratchwork, itemMode, sharedScratchworkItemInfoObj, baseAccessionNumber) {
                    this.blockId = blockId;
                    this.itemId = itemId;
                    this.studentId = studentId;
                    this.scratchwork = scratchwork;
                    this.itemMode = itemMode;
                    this.sharedScratchworkItemInfo = sharedScratchworkItemInfoObj;
                    this.baseAccessionNumber = baseAccessionNumber;

                    if (!this.blockId || !this.itemId || !this.studentId) {
                        logger.setLoggerName('ItemInfo')
                            .debug('One or more key identifiers are invalid. Throwing exception. Received ItemInfo: ' + angular.toJson(this));
                        throw new ScratchworkException("One or more key identifiers are invalid. Make sure that itemId, blockId and studentId have a valid value.");
                    }
                };

                function ToolbarInfo(toolbarMode, toolTipsObj, initialTooltipText, cssStylesObj, initialCssStyles) {
                    this.toolbarMode = toolbarMode;
                    this.toolTips = toolTipsObj;
                    this.titleText = initialTooltipText;
                    this.cssStyles = cssStylesObj;
                    this.toolBarButtonStyle = initialCssStyles;
                    this.isActive = false;
                };

                function ScratchworkToolbarInfo(toolbarInfoObj, toolWrapperObj, drawInfoObj, eraseInfoObj, highlightInfoObj, clearInfoObj) {
                    this.toolbarInfo = toolbarInfoObj;
                    this.toolWrapper = toolWrapperObj;
                    this.drawInfo = drawInfoObj;
                    this.eraseInfo = eraseInfoObj;
                    this.highlightInfo = highlightInfoObj;
                    this.clearInfo = clearInfoObj;
                };

                function ContentInfo(cssStylesObj, initialCssStyles) {
                    this.contentCssStyles = cssStylesObj;
                    this.contentStyle = initialCssStyles;
                };

                function ScratchworkContentInfo(parentContentInfoObj, itemContentInfoObj, scratchPadInfoObj, parentCanvasInfoObj, itemCanvasInfoObj,
                    scratchPadEReaderInfoObj, scratchPadEReaderItemContentInfoObj, scratchPadEReaderItemCanvasInfoObj,
                    scratchPadWritingInfoObj, scratchPadWritingItemContentInfoObj, scratchPadWritingItemCanvasInfoObj,
                    scratchPadIFrameInfo, iframeItemContentInfo, iframeItemCanvasInfo) {
                    this.parentContentInfo = parentContentInfoObj;
                    this.itemContentInfo = itemContentInfoObj;
                    this.scratchPadInfo = scratchPadInfoObj;
                    this.parentCanvasInfo = parentCanvasInfoObj;
                    this.itemCanvasInfo = itemCanvasInfoObj;

                    this.scratchPadEReaderInfo = scratchPadEReaderInfoObj;
                    this.ereaderItemContentInfo = scratchPadEReaderItemContentInfoObj;
                    this.ereaderItemCanvasInfo = scratchPadEReaderItemCanvasInfoObj;

                    this.scratchPadWritingInfo = scratchPadWritingInfoObj;
                    this.writingItemContentInfo = scratchPadWritingItemContentInfoObj;
                    this.writingItemCanvasInfo = scratchPadWritingItemCanvasInfoObj;

                    this.scratchPadIFrameInfo = scratchPadIFrameInfo;
                    this.iframeItemContentInfo = iframeItemContentInfo;
                    this.iframeItemCanvasInfo = iframeItemCanvasInfo;
                };

                function ScratchworkConfigurationInfo(
                    mainContainerElement, canvasContainerElement, parentCanvasElement, parentContentElement, itemCanvasElement, itemContentElement,
                    ereaderMainItemContainerElement, ereaderItemCanvasContainerElement, ereaderItemCanvasElement, ereaderItemContentElement,
                    writingMainItemContainerElement, writingItemCanvasContainerElement, writingItemCanvasElement, writingItemContentElement,
                    iframeMainItemContainerElement, iframeItemCanvasContainerElement, iframeItemCanvasElement, iframeItemContentElement) {

                    this.mainContainerElement = mainContainerElement;
                    this.canvasContainerElement = canvasContainerElement;
                    this.parentCanvasElement = parentCanvasElement;
                    this.parentContentElement = parentContentElement;
                    this.itemCanvasElement = itemCanvasElement;
                    this.itemContentElement = itemContentElement;

                    this.ereaderMainItemContainerElement = ereaderMainItemContainerElement;
                    this.ereaderItemCanvasContainerElement = ereaderItemCanvasContainerElement;
                    this.ereaderItemCanvasElement = ereaderItemCanvasElement;
                    this.ereaderItemContentElement = ereaderItemContentElement;

                    this.writingMainItemContainerElement = writingMainItemContainerElement;
                    this.writingItemCanvasContainerElement = writingItemCanvasContainerElement;
                    this.writingItemCanvasElement = writingItemCanvasElement;
                    this.writingItemContentElement = writingItemContentElement;

                    this.iframeMainItemContainerElement = iframeMainItemContainerElement;
                    this.iframeItemCanvasContainerElement = iframeItemCanvasContainerElement;
                    this.iframeItemCanvasElement = iframeItemCanvasElement;
                    this.iframeItemContentElement = iframeItemContentElement;
                };

                function ScratchworkException(message) {
                    this.message = message;
                };

                function EReaderItemInfo(itemId, studentId, accessionNumber, scratchwork) {
                    this.itemId = itemId;
                    this.studentId = studentId;
                    this.accessionNumber = accessionNumber;
                    this.scratchwork = scratchwork;

                    this.newLocationId = null;
                    this.oldLocationId = null;

                    logger.setLoggerName('EReaderItemInfo Constructor').debug('Received: ' + angular.toJson(this));

                    //if (!this.itemId || !this.studentId) {
                    //    logger.setLoggerName('EReaderItemInfo')
                    //        .debug('One or more key identifiers are invalid. Throwing exception. Received ItemInfo: ' + angular.toJson(this));
                    //    throw new ScratchworkException("One or more key identifiers are invalid. Make sure that itemId and studentId have a valid value.");
                    //}
                };

                //#endregion


                //#region   //  Tooling

                var defaultToolConfig = (function () {
                    var draw = {
                        strokeColor: '#990000',
                        strokeWidth: 3,
                        blendMode: 'destination-over'
                    };
                    var erase = {
                        strokeColor: 'white',
                        strokeWidth: 30,
                        blendMode: 'destination-out'
                    };
                    var highlight = {
                        strokeColor: '#FFFF00',
                        strokeWidth: 36,
                        blendMode: 'xor',
                        opacity: 0.3
                    };

                    function getDefaultConfig(toolMode) {
                        var defaultOptions;

                        switch (toolMode) {
                            case namesOfToolModes.Draw:
                                defaultOptions = draw;
                                break;
                            case namesOfToolModes.Highlight:
                                defaultOptions = highlight;
                                break;
                            case namesOfToolModes.Erase:
                                defaultOptions = erase;
                                break;
                            default:
                                defaultOptions = null;
                        }

                        return defaultOptions;
                    };

                    return {
                        getDefaultConfig: getDefaultConfig
                    };
                }());

                //#endregion


                //#region   //  Scratchwork

                function Scratchwork(subjectId, scratchworkConfigurationInfoObj, scratchworkToolbarInfoObj, scratchworkContentInfoObj) {
                    logger.setLoggerName('Scratchwork').enteringFn();

                    var _scratchworkConfigInfo = scratchworkConfigurationInfoObj;
                    var _toolbarInfo = scratchworkToolbarInfoObj;
                    var _contentInfo = scratchworkContentInfoObj;

                    var _subjectId = subjectId;

                    var _isScratchworkActive = false;
                    var _activeMode = null;

                    var _activeItemInfo = null;
                    var _ereaderItem = null;

                    var isEReaderQuestionsPanelOpen = false;
                    var ereaderQuestionButtonZIndex;

                    var isDrag = false;
                    var currentPaperPath;
                    var paperTool;

                    function isOnTheWayToSchool() {
                        var returnValue = false;
                        if (_ereaderItem && _ereaderItem.accessionNumber === namesOfEReaderAccessionNumbers.OnTheWayToSchool_VH131036 && _ereaderItem.newLocationId === 'Poem') {
                            returnValue = true;
                        }
                        return returnValue;
                    };

                    function isBigFish() {
                        var returnValue = false;
                        if (_ereaderItem && _ereaderItem.accessionNumber === namesOfEReaderAccessionNumbers.BigFish_VH316571) {
                            returnValue = true;
                        }
                        return returnValue;
                    };

                    function isInternalIFrameItem() {

                        var returnValue = false;

                        if (isBigFish() || isOnTheWayToSchool()) {
                            returnValue = true;
                        }

                        return returnValue;
                    };
                    function isInternalIFrameElement() {

                        var returnValue = false;

                        var iframeMainContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameMainContainer);
                        var iframeCanvasElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvas);

                        if (iframeMainContainerElement.length && iframeCanvasElement.length) {

                            _scratchworkConfigInfo.iframeMainItemContainerElement = iframeMainContainerElement;
                            _scratchworkConfigInfo.iframeItemCanvasContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvasContainer);
                            _scratchworkConfigInfo.iframeItemCanvasElement = iframeCanvasElement;
                            _scratchworkConfigInfo.iframeItemContentElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameContent);

                            returnValue = true;
                        }

                        return returnValue;
                    }
                    function isIFrameScratchwork() {

                        var returnValue = false;

                        if (isInternalIFrameItem() && isInternalIFrameElement()) {
                            returnValue = true;
                        }

                        return returnValue;
                    };

                    function paperInContext() {

                        var iframe = angular.element(namesOfSelectors.EReaderIFrame);

                        if (isIFrameScratchwork() && angular.isDefined(iframe) && iframe.length && isEReaderQuestionsPanelOpen === false) {
                            return iframe[0].contentWindow.paper;
                        } else {
                            return paper;
                        }
                    };

                    function isCanvasIdValid(canvasId) {
                        var returnValue = angular.isString(canvasId) && (canvasId !== '');
                        return returnValue;
                    };

                    function initializePaperJS() {

                        logger.setLoggerName('Scratchwork.initializePaperJS').enteringFn();

                        var localPaper = paperInContext();
                        paperTool = new localPaper.Tool();
                        paperTool.id = 'paperTool';
                        paperTool.onMouseDown = onMouseDown;
                        paperTool.onMouseDrag = onMouseDrag;
                        paperTool.onMouseUp = onMouseUp;

                        paperTool.activate();

                        logger.setLoggerName('Scratchwork.initializePaperJS').exitingFn();

                    };

                    function getCanvasProject(canvasId) {

                        var view = paperInContext().View._viewsById[canvasId];

                        if (!view) {
                            return null;
                        }

                        var project = view._project;

                        return project;
                    };
                    function activateCanvasUnderMouse(event) {

                        var canvas = event.target.id;
                        var view = paperInContext().View._viewsById[canvas];

                        logger.setLoggerName('activateCanvasUnderMouse').debug('event.type: ' + event.type + ', canvas id: ' + canvas);

                        if (!view)
                            return false;

                        view._project.activate();

                        return true;
                    };
                    function onMouseDown(e) {

                        if (_isScratchworkActive === false) {
                            return;
                        }

                        isDrag = true;

                        var toolConfig = defaultToolConfig.getDefaultConfig(_activeMode);

                        if (activateCanvasUnderMouse(e.event) === false) {
                            return;
                        }

                        var localPaper = paperInContext();
                        currentPaperPath = new localPaper.Path({
                            strokeColor: toolConfig.strokeColor,
                            strokeWidth: toolConfig.strokeWidth
                        });
                        if (_activeMode === namesOfToolModes.Highlight) {
                            currentPaperPath.opacity = toolConfig.opacity;
                        }
                        currentPaperPath.blendMode = toolConfig.blendMode;

                        currentPaperPath.add(e.point);

                    };
                    function onMouseDrag(e) {

                        if (isDrag === false) {
                            return;
                        }

                        if (activateCanvasUnderMouse(e.event) === false) {
                            return;
                        }

                        currentPaperPath.add(e.point);

                    };
                    function onMouseUp(e) {

                        if (isDrag === false) {
                            return;
                        }

                        isDrag = false;

                        if (activateCanvasUnderMouse(e.event) === false) {
                            return;
                        }

                        currentPaperPath.add(e.point);

                        var canvasId = e.event.target.id;
                        var currentProject = getCanvasProject(canvasId);

                        var swSVGContent = currentProject.exportSVG({
                            asString: true
                        });

                        if (isEReaderItem()) {
                            if ((isIFrameScratchwork() && isEReaderQuestionsPanelOpen === false) || canvasId === _scratchworkConfigInfo.parentCanvasElement.get(0).id) {
                                _ereaderItem.scratchwork.items[_ereaderItem.newLocationId] = swSVGContent;
                            }

                            if (isEReaderQuestionsPanelOpen) {
                                if (canvasId === _scratchworkConfigInfo.ereaderItemCanvasElement.get(0).id) {
                                    _activeItemInfo.scratchwork = swSVGContent;
                                }
                            }
                        } else {
                            if (canvasId === _scratchworkConfigInfo.itemCanvasElement.get(0).id) {
                                _activeItemInfo.scratchwork = swSVGContent;
                            } else if (canvasId === _scratchworkConfigInfo.parentCanvasElement.get(0).id) {
                                _activeItemInfo.sharedScratchworkItemInfo.scratchwork = swSVGContent;
                            } else if (canvasId === _scratchworkConfigInfo.writingItemCanvasElement.get(0).id) {
                                _activeItemInfo.scratchwork = swSVGContent;
                            }
                        }

                        switch (_activeMode) {
                            case namesOfToolModes.Draw:
                                recordObservable(eventTypeEnums.DRAW, _ereaderItem.newLocationId);
                                break;
                            case namesOfToolModes.Erase:
                                recordObservable(eventTypeEnums.ERASE, _ereaderItem.newLocationId);
                                break;
                            case namesOfToolModes.Highlight:
                                recordObservable(eventTypeEnums.HIGHLIGHT, _ereaderItem.newLocationId);
                                break;
                        }
                    };

                    function isSubjectReading() {
                        return (_subjectId === appState.subjectCodeEnum.READING.id);
                    };
                    function isSubjectWriting() {
                        return (_subjectId === appState.subjectCodeEnum.WRITING.id);
                    };
                    function isWritingExtendedText() {
                        return (appState.itemInfo.itemTypeId === appState.itemTypeEnum.EXTENDEDTEXT.id);
                    };
                    function isSubjectWritingAndExtendedText() {
                        return (isSubjectWriting() && isWritingExtendedText());
                    };
                    function isSubjectMathematicsInEnglish() {
                        return (_subjectId === appState.subjectCodeEnum.MATH.id);
                    };
                    function isSubjectMathematicsInSpanish() {
                        return (_subjectId === appState.subjectCodeEnum.MATHPUERTORICO.id);
                    };
                    function isSubjectMathematics() {
                        return (isSubjectMathematicsInEnglish() || isSubjectMathematicsInSpanish());
                    };
                    function isMathDirections() {
                        return (appState.itemInfo.itemTypeId === appState.itemTypeEnum.DIRECTIONS.id);
                    };
                    function isSubjectMathematicsDirections() {
                        return isSubjectMathematics() && isMathDirections();
                    };
                    function isMathQuestionnaire() {
                        return appState.blockInfo.isQuestionnaire;
                    };
                    function isSubjectMathematicsQuestionnaire() {
                        return isSubjectMathematics() && isMathQuestionnaire();
                    };

                    function isActive() {
                        return _isScratchworkActive;
                    };

                    function isSharedStimulusItem() {

                        var returnValue = _activeItemInfo
                                            && _activeItemInfo.itemMode
                                            && _activeItemInfo.itemMode === namesOfItemModes.SharedStimulus;

                        return returnValue;
                    };

                    function isEReaderItem() {

                        var returnValue = false;

                        if (_activeItemInfo) {
                            returnValue = _activeItemInfo.itemMode === namesOfItemModes.EReaderChild
                                            || _activeItemInfo.itemMode === namesOfItemModes.EReaderParent;
                        }

                        return returnValue;
                    };

                    function getItem() {
                        var deferred = $q.defer();

                        repository.getScratchwork(_activeItemInfo.blockId, _activeItemInfo.itemId, _activeItemInfo.studentId)
                            .then(
                                function (result) {
                                    if (result.data) {
                                        setActiveItem(new ItemInfo(_activeItemInfo.blockId, _activeItemInfo.itemId, _activeItemInfo.studentId, result.data.content, _activeItemInfo.itemMode, _activeItemInfo.sharedScratchworkItemInfo, _activeItemInfo.baseAccessionNumber));
                                    } else {
                                        setActiveItem(new ItemInfo(_activeItemInfo.blockId, _activeItemInfo.itemId, _activeItemInfo.studentId, null, _activeItemInfo.itemMode, _activeItemInfo.sharedScratchworkItemInfo, _activeItemInfo.baseAccessionNumber));
                                    }

                                    deferred.resolve();
                                },
                                function (result) {
                                    deferred.reject();
                                });

                        return deferred.promise;
                    };
                    function getSharedItem() {

                        var deferred = $q.defer();

                        if (isSharedStimulusItem()) {

                            repository.getSharedScratchwork(_activeItemInfo.studentId, _activeItemInfo.sharedScratchworkItemInfo.accessionNumber)
                                .then(
                                    function (result) {
                                        if (result.data) {
                                            _activeItemInfo.sharedScratchworkItemInfo = new SharedScratchworkItemInfo(result.data.itemId, result.data.studentId, result.data.accessionNumber, result.data.content);
                                        } else {
                                            _activeItemInfo.sharedScratchworkItemInfo = new SharedScratchworkItemInfo(_activeItemInfo.itemId, _activeItemInfo.studentId, _activeItemInfo.sharedScratchworkItemInfo.accessionNumber, null);
                                        }

                                        deferred.resolve();
                                    },
                                    function (result) {
                                        deferred.reject();
                                    });

                        } else {
                            deferred.resolve();
                        }

                        return deferred.promise;

                    };

                    function getScratchworkObjectFromJson(jsonContent) {
                        //  NOTE:   There seems to be an issue where the content is getting converted to JSON string twice causing SW to fail.
                        //          It seems to happen rarely but so far have been unable to reproduce it.
                        //          This function has therefore been added to remedy the issue.
                        //          The additional break condition for loop is to prevent an infinite loop (read paranoia).
                        var swObj = jsonContent;
                        var counter = 0;
                        var MAXLOOPS = 5;

                        if (!jsonContent) {
                            return jsonContent;
                        }

                        while ((angular.isString(swObj)) || (counter < MAXLOOPS)) {
                            counter++;
                            swObj = angular.fromJson(jsonContent);
                            logger.debug('getScratchworkObjectFromJson: counter: ' + counter);
                        };

                        if (angular.isString(swObj)) {
                            //  This if condition should never be reached.
                            logger.error('getScratchworkObjectFromJson was unable to convert the SW data received from database as string to an object.');
                        }

                        return swObj;
                    };

                    function initializeEReaderScratchworkItemStructureIfRequired(force) {
                        if (force === true) {
                            _ereaderItem.scratchwork = {};
                            _ereaderItem.scratchwork.items = {};
                        } else {
                            if (!_ereaderItem.scratchwork) {
                                _ereaderItem.scratchwork = {};
                            }
                            if (!_ereaderItem.scratchwork.items) {
                                _ereaderItem.scratchwork.items = {};
                            }
                        }
                    };
                    function getEReaderItem() {

                        var deferred = $q.defer();

                        repository.getSharedScratchwork(_ereaderItem.studentId, _ereaderItem.accessionNumber)
                            .then(
                                function (result) {
                                    if (result.data) {
                                        _ereaderItem.itemId = result.data.itemId;
                                        _ereaderItem.studentId = result.data.studentId;
                                        _ereaderItem.accessionNumber = _ereaderItem.accessionNumber;
                                        _ereaderItem.scratchwork = getScratchworkObjectFromJson(result.data.content);
                                    }

                                    initializeEReaderScratchworkItemStructureIfRequired();

                                    deferred.resolve();
                                },
                                function (result) {
                                    deferred.reject();
                                });

                        return deferred.promise;
                    };

                    function resetScratchworkCanvases() {
                        _scratchworkConfigInfo.parentCanvasElement.css('height', '0').attr('height', 0);
                        _scratchworkConfigInfo.itemCanvasElement.css('height', '0').attr('height', 0);


                        if (isIFrameScratchwork() && isEReaderQuestionsPanelOpen === false) {
                            if (_scratchworkConfigInfo.iframeMainItemCanvasElement && _scratchworkConfigInfo.iframeMainItemCanvasElement.length) {
                                _scratchworkConfigInfo.iframeMainItemCanvasElement.css('height', '0').attr('height', 0);
                            }
                        }

                        if (isEReaderQuestionsPanelOpen) {
                            _scratchworkConfigInfo.ereaderItemCanvasElement.css('height', '0').attr('height', 0);
                        }

                        _scratchworkConfigInfo.writingItemCanvasElement.css('height', '0').attr('height', 0);
                    };
                    function setActiveItem(itemInfo) {
                        if (itemInfo === null) {
                            _activeItemInfo = null;
                            return;
                        }

                        _activeItemInfo = angular.extend({
                        }, _activeItemInfo, itemInfo);

                        if (!_ereaderItem) {
                            _ereaderItem = new EReaderItemInfo(
                                null, //_activeItemInfo.itemId,
                                _activeItemInfo.studentId,
                                _activeItemInfo.baseAccessionNumber,
                                null); //_activeItemInfo.scratchwork
                        } else {
                            _ereaderItem.itemId = _ereaderItem.itemId,
                            _ereaderItem.studentId = _activeItemInfo.studentId;
                            _ereaderItem.accessionNumber = _activeItemInfo.baseAccessionNumber;
                            _ereaderItem.scratchwork = _ereaderItem.scratchwork;
                        }

                        logger.setLoggerName('setActiveItem')
                            .debug('blockId: ' + itemInfo.blockId
                                    + ' itemId: ' + itemInfo.itemId
                                    + ' studentId: ' + itemInfo.studentId
                                    + ' scratchwork size: ' + (itemInfo.scratchwork ? itemInfo.scratchwork.length : 'null')
                                    + ' itemMode: ' + itemInfo.itemMode);
                    };
                    function clearActiveItemScratchwork() {

                        if (isEReaderItem()) {
                            if (isEReaderQuestionsPanelOpen) {
                                _activeItemInfo.scratchwork = null;
                            } else {
                                if (_ereaderItem && _ereaderItem.scratchwork && _ereaderItem.scratchwork.items
                                    && _ereaderItem.scratchwork.items[_ereaderItem.newLocationId]) {
                                    _ereaderItem.scratchwork.items[_ereaderItem.newLocationId] = null;
                                }
                            }
                        } else {
                            if (_activeItemInfo) {
                                _activeItemInfo.scratchwork = null;

                                if (isSharedStimulusItem()) {
                                    _activeItemInfo.sharedScratchworkItemInfo.scratchwork = null;
                                }
                            }
                        }
                    };

                    function closeActiveItem() {
                        saveScratchwork().then(function() {
                            setMode(namesOfToolModes.None);
                            toggleScratchworkToInactive();

                            resetScratchworkCanvases();
                            clearScratchworkCanvas();
                            clearActiveItemScratchwork();
                        });

                        _isScratchworkActive = false;
                        _toolbarInfo.toolbarInfo.isActive = false;
                    };
                    function loadActiveItem() {

                        if (isEReaderItem()) {
                            getItem()   //  Get Child Item
                                .then(function () {
                                    getEReaderItem()    //  Get Parent Item
                                        .then(function () {
                                            clearScratchworkCanvas();
                                            enableDisableTabsForOnTheWayToSchool();
                                            setEReaderCanvasDimensions();
                                            initializeUIForActiveItem();
                                            showExistingScratchwork();
                                        });
                                });
                        } else {
                            getItem()
                                .then(function () {
                                    getSharedItem()
                                        .then(function () {
                                            reinitializeWritingScratchwork();

                                            clearScratchworkCanvas();
                                            setCanvasDimensions();
                                            initializeUIForActiveItem();
                                            showExistingScratchwork();
                                        });
                                });
                        }
                    };

                    function changeActiveItem(itemInfo) {
                        logger.debug('changeActiveItem called with: ' + angular.toJson(itemInfo));
                        closeActiveItem();
                        setActiveItem(itemInfo);
                        loadActiveItem();
                    };

                    function getCursor(mode) {
                        switch (mode) {
                            case namesOfToolModes.Draw:
                                return cssToolbarStyles.cursors.draw;
                                break;
                            case namesOfToolModes.Erase:
                                return cssToolbarStyles.cursors.erase;
                                break;
                            case namesOfToolModes.Highlight:
                                return cssToolbarStyles.cursors.highlight;
                                break;
                            default:
                                return "";
                        }
                    };
                    function getCursorValue(mode) {
                        switch (mode) {
                            case namesOfToolModes.Draw:
                                return "url('../../content/images/student/Cur_Draw_Scratch.cur'), auto";
                                break;
                            case namesOfToolModes.Erase:
                                return "url('../../content/images/student/Cur_Erase_Scratch.cur'), auto";
                                break;
                            case namesOfToolModes.Highlight:
                                return "url('../../content/images/student/Cur_Highlighter_Scratch.cur'), auto";
                                break;
                        }
                    };

                    function isDrawableMode(mode) {

                        var returnValue = _isScratchworkActive
                                            && (mode === namesOfToolModes.Draw
                                                    || mode === namesOfToolModes.Erase
                                                    || mode === namesOfToolModes.Highlight);
                        return returnValue;

                    };
                    function setStyleForScratchpad(content, mode) {
                        _contentInfo.scratchPadInfo.contentStyle = content + " " + getCursor(mode);
                    };
                    function setStyleForParent(content, canvas) {
                        _contentInfo.parentContentInfo.contentStyle = content;
                        _contentInfo.parentCanvasInfo.contentStyle = canvas;
                    };
                    function setStyleForItem(content, canvas) {
                        _contentInfo.itemContentInfo.contentStyle = content;
                        _contentInfo.itemCanvasInfo.contentStyle = canvas;
                    };
                    function setStyleForEReaderScratchpad(content, mode) {
                        _contentInfo.scratchPadEReaderInfo.contentStyle = content + " " + getCursor(mode);
                    };
                    function setStyleForEReaderItem(content, canvas) {
                        _contentInfo.ereaderItemContentInfo.contentStyle = content;
                        _contentInfo.ereaderItemCanvasInfo.contentStyle = canvas;
                    };

                    function setStyleForIFrameScratchpad(content, mode) {
                        if (_scratchworkConfigInfo.iframeItemCanvasContainerElement.length) {
                            _scratchworkConfigInfo.iframeItemCanvasContainerElement.removeClass().addClass(content + " " + getCursor(mode));
                        }
                    };
                    function setStyleForIFrameItem(content, canvas) {
                        if (_scratchworkConfigInfo.iframeItemCanvasElement.length) {
                            _scratchworkConfigInfo.iframeItemCanvasElement.removeClass().addClass(canvas);
                        }
                    };

                    function setStyleForWritingScratchpad(content, mode) {
                        _contentInfo.scratchPadWritingInfo.contentStyle = content + " " + getCursor(mode);
                    };
                    function setStyleForWritingItem(content, canvas) {
                        _contentInfo.writingItemContentInfo.contentStyle = content;
                        _contentInfo.writingItemCanvasInfo.contentStyle = canvas;
                    };

                    function getBaseElementsToDisallowScratchworkOn() {

                        var elementsToProcess = [];
                        var contentArea = angular.element(namesOfSelectors.ContentArea);

                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllButtons));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllRadioButtons));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllCheckboxes));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllTextboxes));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllTextareas));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllInlineChoiceDropdowns));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllEliminationChoices));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.MatchingMSChoices));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.ZoneSelections));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.MultipleFillInBlanks));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.ConstructedResponses));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.StandaloneStatement));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.ZoneChoiceList));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.Interactive));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.InteractiveLowercase));

                        return elementsToProcess;
                    };

                    function applyScratchworkAllowDisallowStyles(elementsToProcess, styles) {
                        angular.forEach(elementsToProcess, function (elements, index) {
                            if (elements.length > 0) {
                                elements.css(styles);
                            }
                        });
                    };
                    function initializeUIForImagesForActiveItem() {

                        //  Initialize Image responses to stop bleeding scratchwork.

                        var elementsToProcess = [];
                        var contentArea = angular.element(namesOfSelectors.ContentArea);

                        elementsToProcess.push(contentArea.find(namesOfSelectors.MatchingMSChoicesWithImage));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.MultipleFillInBlanksWithImage));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllEliminationChoices));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.StandaloneStatement));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.ZoneChoiceListWithImages));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.Interactive));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.InteractiveLowercase));

                        applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.imageInitialization);

                    };
                    function initializeUIForWritingForActiveItem() {

                        var elementsToProcess = [];
                        var contentArea = angular.element(namesOfSelectors.ContentArea);

                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllWritingAudios));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.AllWritingVideos));

                        applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.initialization);
                        applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.imageInitialization);
                    };
                    function initializeUIForActiveItem() {

                        $timeout(function() {
                            var elementsToProcess = getBaseElementsToDisallowScratchworkOn();
                            applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.initialization);

                            initializeUIForImagesForActiveItem();
                            initializeUIForWritingForActiveItem();
                        }, 500);
                    };
                    function disableInputsWhenDrawableModeActive() {

                        var elementsToProcess = getBaseElementsToDisallowScratchworkOn();
                        var contentArea = angular.element(namesOfSelectors.ContentArea);

                        elementsToProcess.push(contentArea.find(namesOfSelectors.EReaderQuestionsButton));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.WritingControls));

                        applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.disableInputs);
                    };
                    function enableInputsWhenDrawableModeInactive() {

                        var elementsToProcess = getBaseElementsToDisallowScratchworkOn();
                        var contentArea = angular.element(namesOfSelectors.ContentArea);

                        elementsToProcess.push(contentArea.find(namesOfSelectors.EReaderQuestionsButton));
                        elementsToProcess.push(contentArea.find(namesOfSelectors.WritingControls));

                        applyScratchworkAllowDisallowStyles(elementsToProcess, cssSetupStyles.enableInputs);
                    };
                    function setAdjustmentStylesForSharedStimulusWhenDrawableModeActive() {
                        angular.element(namesOfSelectors.ContentArea).css('white-space', 'nowrap');
                    };
                    function setAdjustmentStylesForSharedStimulusWhenDrawableModeInactive() {
                        angular.element(namesOfSelectors.ContentArea).css('white-space', 'nowrap');
                    };
                    function setAdjustmentStylesForEReaderWhenDrawableModeActive() {
                        ereaderQuestionButtonZIndex = angular.element(namesOfSelectors.EReaderQuestionsButton).css('z-index');

                        logger.setLoggerName('setAdjustmentStylesWhenDrawableModeActive').debug('ereaderQuestionButtonZIndex: ' + ereaderQuestionButtonZIndex);

                        angular.element(namesOfSelectors.EReaderQuestionsButton).css('z-index', '1');
                    };
                    function setAdjustmentStylesForEReaderWhenDrawableModeInactive() {
                        angular.element(namesOfSelectors.EReaderQuestionsButton).css('z-index', '' + ereaderQuestionButtonZIndex);
                    };
                    function getActiveModeStyleBySubject() {
                        var styleToReturn = '';

                        if (isSubjectReading() && isEReaderQuestionsPanelOpen) {
                            styleToReturn = cssToolbarStyles.canvas.reading;
                        } else if (isSubjectReading()) {
                            styleToReturn = cssToolbarStyles.canvas.readingOther;
                        } else if (isSubjectWritingAndExtendedText()) {
                            styleToReturn = cssToolbarStyles.canvas.writing;
                        } else if (isSubjectWriting()) {
                            styleToReturn = cssToolbarStyles.canvas.writingOther;
                        } else if (isSubjectMathematicsDirections()) {
                            styleToReturn = cssToolbarStyles.canvas.mathOther;
                        } else if (isSubjectMathematics()) {
                            styleToReturn = cssToolbarStyles.canvas.math;
                        }

                        return styleToReturn;
                    };
                    function getInactiveModeStyleBySubject() {
                        var styleToReturn = '';

                        if (isSubjectReading() && isEReaderQuestionsPanelOpen) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveReading;
                        } else if (isSubjectReading()) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveReadingOther;
                        } else if (isSubjectWritingAndExtendedText()) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveWriting;
                        } else if (isSubjectWriting()) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveWritingOther;
                        } else if (isSubjectMathematicsDirections()) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveMathOther;
                        } else if (isSubjectMathematics()) {
                            styleToReturn = cssToolbarStyles.canvas.inactiveMath;
                        }

                        return styleToReturn;
                    };
                    function setMode(toolMode) {

                        _activeMode = !toolMode ? namesOfToolModes.None : toolMode;

                        if (isDrawableMode(_activeMode)) {

                            if (isEReaderItem()) {
                                if (isEReaderQuestionsPanelOpen) {
                                    setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.inactive, _activeMode);
                                    setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.inactive, _contentInfo.parentCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);
                                    setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);

                                    setStyleForEReaderScratchpad(_contentInfo.scratchPadEReaderInfo.contentCssStyles.active, _activeMode);
                                    setStyleForEReaderItem(_contentInfo.ereaderItemContentInfo.contentCssStyles.active, _contentInfo.ereaderItemCanvasInfo.contentCssStyles.active + ' ' + cssToolbarStyles.canvas.reading);

                                } else if (isIFrameScratchwork()) {
                                    setStyleForIFrameScratchpad(_contentInfo.scratchPadIFrameInfo.contentCssStyles.active, _activeMode);
                                    setStyleForIFrameItem(_contentInfo.iframeItemContentInfo.contentCssStyles.active, _contentInfo.iframeItemCanvasInfo.contentCssStyles.active + ' ' + cssToolbarStyles.canvas.reading);

                                } else {
                                    setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.active, _activeMode);
                                    setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.active, _contentInfo.parentCanvasInfo.contentCssStyles.active + ' ' + cssToolbarStyles.canvas.reading);
                                    setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);
                                }

                                //setAdjustmentStylesForEReaderWhenDrawableModeActive();

                            } else if (isSubjectWritingAndExtendedText()) {

                                setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.inactive, _activeMode);
                                setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.inactive, _contentInfo.parentCanvasInfo.contentCssStyles.inactive);
                                setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveWriting);

                                setStyleForWritingScratchpad(_contentInfo.scratchPadWritingInfo.contentCssStyles.active, _activeMode);
                                setStyleForWritingItem(_contentInfo.writingItemContentInfo.contentCssStyles.active, _contentInfo.writingItemCanvasInfo.contentCssStyles.active + ' ' + cssToolbarStyles.canvas.writing);

                            } else {
                                setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.active, _activeMode);
                                setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.active, _contentInfo.itemCanvasInfo.contentCssStyles.active + ' ' + getActiveModeStyleBySubject());

                                if (isSharedStimulusItem()) {
                                    setAdjustmentStylesForSharedStimulusWhenDrawableModeActive();
                                    setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.active, _contentInfo.parentCanvasInfo.contentCssStyles.active);
                                }
                            }

                            disableInputsWhenDrawableModeActive();

                        } else {

                            if (isEReaderItem()) {
                                setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.inactive, _activeMode);
                                setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.inactive, _contentInfo.parentCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);
                                setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);

                                if (isEReaderQuestionsPanelOpen) {
                                    setStyleForEReaderScratchpad(_contentInfo.scratchPadEReaderInfo.contentCssStyles.inactive, _activeMode);
                                    setStyleForEReaderItem(_contentInfo.ereaderItemContentInfo.contentCssStyles.inactive, _contentInfo.ereaderItemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);
                                } else if (isIFrameScratchwork()) {
                                    setStyleForIFrameScratchpad(_contentInfo.scratchPadIFrameInfo.contentCssStyles.inactive, _activeMode);
                                    setStyleForIFrameItem(_contentInfo.iframeItemContentInfo.contentCssStyles.inactive, _contentInfo.iframeItemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveReading);
                                }
                            } else if (isSubjectWritingAndExtendedText()) {

                                setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.inactive, _activeMode);
                                setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.inactive, _contentInfo.parentCanvasInfo.contentCssStyles.inactive);
                                setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveWriting);

                                setStyleForWritingScratchpad(_contentInfo.scratchPadWritingInfo.contentCssStyles.inactive, _activeMode);
                                setStyleForWritingItem(_contentInfo.writingItemContentInfo.contentCssStyles.inactive, _contentInfo.writingItemCanvasInfo.contentCssStyles.inactive + ' ' + cssToolbarStyles.canvas.inactiveWriting);

                            } else {
                                setStyleForScratchpad(_contentInfo.scratchPadInfo.contentCssStyles.inactive, _activeMode);
                                setStyleForItem(_contentInfo.itemContentInfo.contentCssStyles.inactive, _contentInfo.itemCanvasInfo.contentCssStyles.inactive + ' ' + getInactiveModeStyleBySubject());

                                if (isSharedStimulusItem()) {
                                    setAdjustmentStylesForSharedStimulusWhenDrawableModeInactive();
                                    setStyleForParent(_contentInfo.parentContentInfo.contentCssStyles.inactive, _contentInfo.parentCanvasInfo.contentCssStyles.inactive);
                                }
                            }

                            //setAdjustmentStylesForEReaderWhenDrawableModeInactive();

                            enableInputsWhenDrawableModeInactive();
                        }

                        if (paperTool) {
                            paperTool.activate();
                        }

                        if (paperInContext() && paperInContext().project && paperInContext().project.view) {
                            paperInContext().project.view.update();
                        }

                    };

                    function setToolTip(toolMode, state) {
                        switch (toolMode) {
                            case namesOfToolModes.Scratchwork:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.toolbarInfo.titleText = _toolbarInfo.toolbarInfo.toolTips.active;
                                        break;
                                    case namesOfStates.Disabled:
                                        _toolbarInfo.toolbarInfo.titleText = _toolbarInfo.toolbarInfo.toolTips.disabled;
                                        break;
                                    case namesOfStates.Enabled:
                                        _toolbarInfo.toolbarInfo.titleText = _toolbarInfo.toolbarInfo.toolTips.enabled;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Draw:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.drawInfo.titleText = _toolbarInfo.drawInfo.toolTips.active;
                                        break;
                                    case namesOfStates.Disabled:
                                        _toolbarInfo.drawInfo.titleText = _toolbarInfo.drawInfo.toolTips.disabled;
                                        break;
                                    case namesOfStates.Enabled:
                                        _toolbarInfo.drawInfo.titleText = _toolbarInfo.drawInfo.toolTips.enabled;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Erase:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.eraseInfo.titleText = _toolbarInfo.eraseInfo.toolTips.active;
                                        break;
                                    case namesOfStates.Disabled:
                                        _toolbarInfo.eraseInfo.titleText = _toolbarInfo.eraseInfo.toolTips.disabled;
                                        break;
                                    case namesOfStates.Enabled:
                                        _toolbarInfo.eraseInfo.titleText = _toolbarInfo.eraseInfo.toolTips.enabled;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Highlight:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.highlightInfo.titleText = _toolbarInfo.highlightInfo.toolTips.active;
                                        break;
                                    case namesOfStates.Disabled:
                                        _toolbarInfo.highlightInfo.titleText = _toolbarInfo.highlightInfo.toolTips.disabled;
                                        break;
                                    case namesOfStates.Enabled:
                                        _toolbarInfo.highlightInfo.titleText = _toolbarInfo.highlightInfo.toolTips.enabled;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Clear:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.clearInfo.titleText = _toolbarInfo.clearInfo.toolTips.active;
                                        break;
                                    case namesOfStates.Disabled:
                                        _toolbarInfo.clearInfo.titleText = _toolbarInfo.clearInfo.toolTips.disabled;
                                        break;
                                    case namesOfStates.Enabled:
                                        _toolbarInfo.clearInfo.titleText = _toolbarInfo.clearInfo.toolTips.enabled;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                        }
                    };
                    function setStyle(toolMode, state) {
                        switch (toolMode) {
                            case namesOfToolModes.Scratchwork:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.toolbarInfo.toolBarButtonStyle = _toolbarInfo.toolbarInfo.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.toolbarInfo.toolBarButtonStyle = _toolbarInfo.toolbarInfo.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.ToolWrapper:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.toolWrapper.toolBarButtonStyle = _toolbarInfo.toolWrapper.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.toolWrapper.toolBarButtonStyle = _toolbarInfo.toolWrapper.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Draw:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.drawInfo.toolBarButtonStyle = _toolbarInfo.drawInfo.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.drawInfo.toolBarButtonStyle = _toolbarInfo.drawInfo.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Erase:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.eraseInfo.toolBarButtonStyle = _toolbarInfo.eraseInfo.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.eraseInfo.toolBarButtonStyle = _toolbarInfo.eraseInfo.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Highlight:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.highlightInfo.toolBarButtonStyle = _toolbarInfo.highlightInfo.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.highlightInfo.toolBarButtonStyle = _toolbarInfo.highlightInfo.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                            case namesOfToolModes.Clear:
                                switch (state) {
                                    case namesOfStates.Active:
                                        _toolbarInfo.clearInfo.toolBarButtonStyle = _toolbarInfo.clearInfo.cssStyles.active;
                                        break;
                                    case namesOfStates.Inactive:
                                        _toolbarInfo.clearInfo.toolBarButtonStyle = _toolbarInfo.clearInfo.cssStyles.inactive;
                                        break;
                                    default:
                                        break;
                                };
                                break;
                        }
                    };
                    function setToolState(state) {
                        _toolbarInfo.drawInfo.isActive = state.draw;
                        _toolbarInfo.eraseInfo.isActive = state.erase;
                        _toolbarInfo.highlightInfo.isActive = state.highlight;
                    };

                    function getCalculatedCanvasDimensions() {
                        var dimensions = {
                            parent: {
                                height: 0,
                                width: 0
                            },
                            item: {
                                height: 0,
                                width: 0
                            }
                        };
                        var parentWidthToUse = 0;
                        var itemWidthToUse = 0;
                        var itemHeightToUse = 0;

                        var documentHeight = Math.ceil($document.height());
                        var toolbarHeight = Math.ceil(angular.element(namesOfSelectors.ToolbarBackground).height());
                        var tabStripHeight = Math.ceil(angular.element(namesOfSelectors.TabStrip).height());

                        if (tabStripHeight === 0 && !isSubjectMathematicsDirections() && !isSubjectMathematicsQuestionnaire()) {
                            tabStripHeight = scratchworkDimensions.adjustments.tabstrip;
                        }

                        itemHeightToUse = documentHeight - (toolbarHeight + tabStripHeight) - scratchworkDimensions.adjustments.itemHeight;
                        itemWidthToUse = _scratchworkConfigInfo.mainContainerElement.width() - scratchworkDimensions.adjustments.itemWidth;

                        dimensions.item.height = itemHeightToUse;
                        dimensions.item.width = itemWidthToUse;

                        logger.setLoggerName('getCalculatedCanvasDimensions')
                            .debug('documentHeight: ' + documentHeight + ', toolbarHeight: ' + toolbarHeight + ', tabStripHeight: ' + tabStripHeight +
                                    ', itemHeightToUse: ' + itemHeightToUse + ', itemWidthToUse: ' + itemWidthToUse);

                        if (isSharedStimulusItem()) {
                            parentWidthToUse = _scratchworkConfigInfo.parentContentElement.width();
                            itemWidthToUse = _scratchworkConfigInfo.itemContentElement.width();

                            dimensions.parent.height = itemHeightToUse;
                            dimensions.parent.width = parentWidthToUse;
                            dimensions.item.height = itemHeightToUse;
                            dimensions.item.width = itemWidthToUse;

                            logger.setLoggerName('getCalculatedCanvasDimensions - SharedStimulus')
                                .debug('documentHeight: ' + documentHeight + ', toolbarHeight: ' + toolbarHeight + ', tabStripHeight: ' + tabStripHeight +
                                    ', itemHeightToUse: ' + itemHeightToUse + ', parentWidthToUse: ' + parentWidthToUse + ', itemWidthToUse: ' + itemWidthToUse);
                        }

                        return dimensions;

                    };
                    function setSpecificCanvasDimensions(canvas, width, height) {
                        canvas
                            .css('width', width).attr('width', width)
                            .css('height', height).attr('height', height);
                    };
                    function setParentCanvasDimensions(width, height) {
                        setSpecificCanvasDimensions(_scratchworkConfigInfo.parentCanvasElement, width, height);
                    };
                    function setItemCanvasDimensions(width, height) {
                        setSpecificCanvasDimensions(_scratchworkConfigInfo.itemCanvasElement, width, height);
                    };
                    function setCanvasDimensions() {

                        var dimensions;

                        if (isSubjectWritingAndExtendedText()) {

                            setParentCanvasDimensions(0, 0);
                            setItemCanvasDimensions(0, 0);

                            setWritingItemCanvasDimensions();

                        } else {
                            dimensions = getCalculatedCanvasDimensions();

                            setItemCanvasDimensions(dimensions.item.width, dimensions.item.height);
                            setParentCanvasDimensions(dimensions.parent.width, dimensions.parent.height);
                        }
                    };

                    function setEReaderParentCanvasDimensions() {
                        var frameHeight;
                        var frameWidth;
                        var $frameElementBody = angular.element(namesOfSelectors.EReaderIFrame).contents().find('body');

                        if ($frameElementBody.length) {

                            if (_ereaderItem.accessionNumber === namesOfEReaderAccessionNumbers.SmithsonianKidsCollecting_VH314409) {
                                frameHeight = $frameElementBody[0].scrollHeight;
                                frameWidth = $frameElementBody[0].scrollWidth;
                            } else {
                                frameHeight = $frameElementBody[0].offsetHeight;
                                frameWidth = $frameElementBody[0].offsetWidth;
                            }

                            logger.setLoggerName('setEReaderParentCanvasDimensions')
                                .debug('#stimFrame --- width: ' + frameWidth + ' height: ' + frameHeight);

                            _scratchworkConfigInfo.parentCanvasElement
                                .css('width', frameWidth).css('height', frameHeight)
                                .attr('width', frameWidth).attr('height', frameHeight);

                            _scratchworkConfigInfo.itemCanvasElement
                                .css('width', 0).css('height', 0)
                                .attr('width', 0).attr('height', 0);
                        }
                    };
                    function setIFrameParentCanvasDimensions() {
                        var frameHeight;
                        var frameWidth;
                        var $frameElementBody = angular.element(namesOfSelectors.EReaderIFrame);

                        if ($frameElementBody.length) {

                            var contentElement = $frameElementBody.contents().find(namesOfSelectors.IFrameContent);

                            if (_ereaderItem.accessionNumber === namesOfEReaderAccessionNumbers.OnTheWayToSchool_VH131036) {
                                frameHeight = scratchworkDimensions.ereaderScrollableContent.OnTheWayToSchool_VH131036.height;
                                frameWidth = contentElement.width();
                            } else {
                                frameHeight = contentElement[0].scrollHeight;
                                frameWidth = contentElement[0].scrollWidth;
                            }

                            logger.setLoggerName('setIFrameParentCanvasDimensions')
                                .debug('#stimFrame --- width: ' + frameWidth + ' height: ' + frameHeight);

                            _scratchworkConfigInfo.iframeItemCanvasElement
                                .css('width', frameWidth).css('height', frameHeight)
                                .attr('width', frameWidth).attr('height', frameHeight);

                            _scratchworkConfigInfo.parentCanvasElement
                                .css('width', 0).css('height', 0)
                                .attr('width', 0).attr('height', 0);

                            _scratchworkConfigInfo.itemCanvasElement
                                .css('width', 0).css('height', 0)
                                .attr('width', 0).attr('height', 0);
                        }
                    };
                    function setEReaderItemCanvasDimensions() {
                        var itemWidthToUse = 0;
                        var itemHeightToUse = 0;

                        var itemContentHeight = Math.ceil(angular.element(namesOfSelectors.EReaderItemContent).height());
                        var tabStripHeight = Math.ceil(angular.element(namesOfSelectors.EReaderTabStrip).height());

                        if (tabStripHeight === 0) {
                            tabStripHeight = scratchworkDimensions.adjustments.tabstrip;
                        }

                        if (itemContentHeight > scratchworkDimensions.reading.item.height) {
                            logger.debug('INSIDE - itemContentHeight > scratchworkDimensions.reading.item.height');
                            itemHeightToUse = itemContentHeight + tabStripHeight;
                        } else {
                            itemHeightToUse = scratchworkDimensions.reading.item.height - scratchworkDimensions.adjustments.eReaderHeight;
                        }
                        itemWidthToUse = _scratchworkConfigInfo.ereaderMainItemContainerElement.width() - scratchworkDimensions.adjustments.eReaderWidth;

                        logger.setLoggerName('setEReaderItemCanvasDimensions')
                            .debug('itemContentHeight: ' + itemContentHeight +
                                    ', tabStripHeight: ' + tabStripHeight +
                                    ', itemHeightToUse: ' + itemHeightToUse +
                                    ', itemWidthToUse: ' + itemWidthToUse);

                        _scratchworkConfigInfo.ereaderItemCanvasElement
                            .css('width', itemWidthToUse).css('height', itemHeightToUse)
                            .attr('width', itemWidthToUse).attr('height', itemHeightToUse);
                    };
                    function setEReaderCanvasDimensions() {

                        if (isIFrameScratchwork() && isEReaderQuestionsPanelOpen === false) {
                            setIFrameParentCanvasDimensions();
                        } else {
                            setEReaderParentCanvasDimensions();
                        }

                        if (isEReaderQuestionsPanelOpen) {
                            setEReaderItemCanvasDimensions();
                        }
                    };

                    function setWritingItemCanvasDimensions() {
                        var widthToUse = 0;
                        var heightToUse = 0;
                        var containerWidth = 0;
                        var containerHeight = 0;
                        var itemWidth = 0;
                        var itemHeight = 0;

                        var $writingCanvasContainer = angular.element(namesOfSelectors.WritingItemCanvasContainer);
                        var $writingItemElement = angular.element(namesOfSelectors.WritingItemContent);

                        if ($writingCanvasContainer.length) {
                            containerWidth = $writingCanvasContainer.width();
                            containerHeight = $writingCanvasContainer.height();
                        }

                        if ($writingItemElement.length) {
                            itemWidth = $writingItemElement.width();
                            itemHeight = $writingItemElement.height();
                        }

                        if (itemWidth > containerWidth) {
                            widthToUse = itemWidth;
                        } else {
                            widthToUse = containerWidth;
                        }

                        if (itemHeight > containerHeight) {
                            heightToUse = itemHeight;
                        } else {
                            heightToUse = containerHeight;
                        }

                        //widthToUse = widthToUse - scratchworkDimensions.adjustments.writingWidth;
                        heightToUse = heightToUse - scratchworkDimensions.adjustments.writingHeight;

                        widthToUse -= parseInt(_scratchworkConfigInfo.writingItemCanvasElement.css('border-left-width'), 10);
                        widthToUse -= parseInt(_scratchworkConfigInfo.writingItemCanvasElement.css('border-right-width'), 10);
                        heightToUse -= parseInt(_scratchworkConfigInfo.writingItemCanvasElement.css('border-top-width'), 10);
                        heightToUse -= parseInt(_scratchworkConfigInfo.writingItemCanvasElement.css('border-bottom-width'), 10);

                        logger.setLoggerName('setWritingItemCanvasDimensions')
                            .debug('width: ' + widthToUse + ' height: ' + heightToUse);

                        _scratchworkConfigInfo.parentCanvasElement
                            .css('width', 0).css('height', 0)
                            .attr('width', 0).attr('height', 0);

                        _scratchworkConfigInfo.itemCanvasElement
                            .css('width', 0).css('height', 0)
                            .attr('width', 0).attr('height', 0);

                        _scratchworkConfigInfo.writingItemCanvasElement
                            .css('width', widthToUse).css('height', heightToUse)
                            .attr('width', widthToUse).attr('height', heightToUse);
                    };

                    function toggleScratchworkToActive() {
                        setToolTip(namesOfToolModes.Scratchwork, namesOfStates.Active);
                        setStyle(namesOfToolModes.Scratchwork, namesOfStates.Active);

                        setToolState({
                            draw: true, erase: false, highlight: false
                        });
                        setToolTip(namesOfToolModes.Draw, namesOfStates.Active);
                        setStyle(namesOfToolModes.Draw, namesOfStates.Active);

                        setToolTip(namesOfToolModes.Erase, namesOfStates.Inactive);
                        setStyle(namesOfToolModes.Erase, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Highlight, namesOfStates.Inactive);
                        setStyle(namesOfToolModes.Highlight, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Clear, namesOfStates.Inactive);
                        setStyle(namesOfToolModes.Clear, namesOfStates.Inactive);

                        setStyle(namesOfToolModes.ToolWrapper, namesOfStates.Active);
                    };
                    function toggleScratchworkToInactive() {
                        setToolState({ draw: false, erase: false, highlight: false });

                        setToolTip(namesOfToolModes.Scratchwork, namesOfStates.Enabled);
                        setStyle(namesOfToolModes.Scratchwork, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Draw, namesOfStates.Enabled);
                        setStyle(namesOfToolModes.Draw, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Erase, namesOfStates.Enabled);
                        setStyle(namesOfToolModes.Erase, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Highlight, namesOfStates.Enabled);
                        setStyle(namesOfToolModes.Highlight, namesOfStates.Inactive);

                        setToolTip(namesOfToolModes.Clear, namesOfStates.Enabled);
                        setStyle(namesOfToolModes.Clear, namesOfStates.Inactive);

                        setStyle(namesOfToolModes.ToolWrapper, namesOfStates.Inactive);
                    };
                    function toggleScratchwork() {
                        if (_toolbarInfo.toolbarInfo.isActive) {
                            toggleScratchworkToInactive();
                        }
                        else {
                            toggleScratchworkToActive();
                        }

                        _toolbarInfo.toolbarInfo.isActive = !_toolbarInfo.toolbarInfo.isActive;
                    };
                    function toggleDraw() {

                        if (_toolbarInfo.drawInfo.isActive) {
                            return;
                        }
                        else {
                            setToolState({
                                draw: true, erase: false, highlight: false
                            });

                            setToolTip(namesOfToolModes.Draw, namesOfStates.Active);
                            setStyle(namesOfToolModes.Draw, namesOfStates.Active);

                            setToolTip(namesOfToolModes.Erase, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Erase, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Highlight, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Highlight, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Clear, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Clear, namesOfStates.Inactive);
                        }
                    };
                    function toggleErase() {

                        if (_toolbarInfo.eraseInfo.isActive) {
                            return;
                        }
                        else {
                            setToolState({
                                draw: false, erase: true, highlight: false
                            });

                            setToolTip(namesOfToolModes.Erase, namesOfStates.Active);
                            setStyle(namesOfToolModes.Erase, namesOfStates.Active);

                            setToolTip(namesOfToolModes.Draw, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Draw, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Highlight, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Highlight, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Clear, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Clear, namesOfStates.Inactive);
                        }
                    };
                    function toggleHighlight() {

                        if (_toolbarInfo.highlightInfo.isActive) {
                            return;
                        }
                        else {
                            setToolState({
                                draw: false, erase: false, highlight: true
                            });

                            setToolTip(namesOfToolModes.Highlight, namesOfStates.Active);
                            setStyle(namesOfToolModes.Highlight, namesOfStates.Active);

                            setToolTip(namesOfToolModes.Erase, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Erase, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Draw, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Draw, namesOfStates.Inactive);

                            setToolTip(namesOfToolModes.Clear, namesOfStates.Enabled);
                            setStyle(namesOfToolModes.Clear, namesOfStates.Inactive);
                        }
                    };

                    function clearSpecificScratchwork(canvasElement) {

                        logger.setLoggerName('clearSpecificScratchwork');

                        var project;
                        var elm = (canvasElement && canvasElement.length) ? canvasElement.get(0) : undefined;

                        if (elm && isCanvasIdValid(elm.id)) {
                            project = getCanvasProject(elm.id);

                            if (project) {
                                project.remove();
                            }

                            paperInContext().setup(elm.id);
                            logger.debug('clearSpecificScratchwork - paper.setup(' + elm.id + ')');

                            if (isActive()) {
                                if (paperTool) {
                                    paperTool.activate();
                                }
                            }
                        } else {
                            logger.debug('clearSpecificScratchwork - Could not call paper.setup(id) as elm or elm.id is unknown.');
                        }

                        logger.exitingFn();
                    };
                    function clearParentScratchwork() {
                        if (isIFrameScratchwork()) {
                            clearSpecificScratchwork(_scratchworkConfigInfo.iframeItemCanvasElement);
                        } else {
                            clearSpecificScratchwork(_scratchworkConfigInfo.parentCanvasElement);
                        }
                    };
                    function clearItemScratchwork() {
                        clearSpecificScratchwork(_scratchworkConfigInfo.itemCanvasElement);
                    };
                    function clearEReaderItemScratchwork() {
                        clearSpecificScratchwork(_scratchworkConfigInfo.ereaderItemCanvasElement);
                    };
                    function clearWritingItemScratchwork() {
                        clearSpecificScratchwork(_scratchworkConfigInfo.writingItemCanvasElement);
                    };
                    function clearScratchworkCanvas() {

                        if (isEReaderItem()) {
                            if (isEReaderQuestionsPanelOpen) {
                                //clearParentScratchwork();
                                clearEReaderItemScratchwork();
                            } else {
                                clearParentScratchwork();
                            }
                        } else if (isSubjectWritingAndExtendedText()) {
                            clearWritingItemScratchwork();
                        } else {
                            clearItemScratchwork();

                            if (isSharedStimulusItem()) {
                                clearParentScratchwork();
                            }
                        }

                    };

                    function showSpecificScratchwork(canvas, scratchwork) {

                        var project = getCanvasProject(canvas.get(0).id);

                        if (project) {
                            project.importSVG(scratchwork);
                            project.view.update();
                        }

                    };
                    function showParentScratchwork(scratchwork) {
                        if (isIFrameScratchwork()) {
                            showSpecificScratchwork(_scratchworkConfigInfo.iframeItemCanvasElement, scratchwork);
                        } else {
                            showSpecificScratchwork(_scratchworkConfigInfo.parentCanvasElement, scratchwork);
                        }
                    };
                    function showItemScratchwork(scratchwork) {
                        showSpecificScratchwork(_scratchworkConfigInfo.itemCanvasElement, scratchwork);
                    };
                    function showEReaderChildItemScratchwork(scratchwork) {
                        showSpecificScratchwork(_scratchworkConfigInfo.ereaderItemCanvasElement, scratchwork);
                    };
                    function showWritingItemScratchwork(scratchwork) {

                        if (_scratchworkConfigInfo.writingItemCanvasElement.length) {
                            showSpecificScratchwork(_scratchworkConfigInfo.writingItemCanvasElement, scratchwork);
                        }
                    };
                    function showExistingScratchwork() {

                        if (isEReaderItem()) {

                            var scratchworkToImport = _ereaderItem.scratchwork.items[_ereaderItem.newLocationId];
                            showParentScratchwork(scratchworkToImport);

                            if (isEReaderQuestionsPanelOpen) {
                                showEReaderChildItemScratchwork(_activeItemInfo.scratchwork);
                            }

                        } else if (isSubjectWritingAndExtendedText()) {

                            showWritingItemScratchwork(_activeItemInfo.scratchwork);

                        } else {

                            showItemScratchwork(_activeItemInfo.scratchwork);

                            if (isSharedStimulusItem()) {
                                showParentScratchwork(_activeItemInfo.sharedScratchworkItemInfo.scratchwork);
                            }
                        }
                    };

                    function saveActiveScratchwork(forceSave) {
                        var deferred = $q.defer();

                        logger.setLoggerName('saveActiveScratchwork').enteringFn();

                        if (forceSave || _isScratchworkActive) {
                            repository.saveScratchwork(_activeItemInfo)
                                .then(function (result) {
                                    if (result.data) {
                                        setActiveItem(
                                            new ItemInfo(
                                                _activeItemInfo.blockId,
                                                _activeItemInfo.itemId,
                                                _activeItemInfo.studentId,
                                                result.data.content,
                                                _activeItemInfo.itemMode,
                                                _activeItemInfo.sharedScratchworkItemInfo,
                                                _activeItemInfo.baseAccessionNumber
                                            ));
                                    }
                                },
                                function (result) {
                                    logger.error('saveActiveScratchwork.saveScratchwork failed: ' + angular.toJson(result));
                                    deferred.reject();
                                })
                                .then(function () {
                                    if (isSharedStimulusItem()) {
                                        repository.saveSharedScratchwork(_activeItemInfo.sharedScratchworkItemInfo)
                                            .then(function (result) {
                                                var itm = result.data;
                                                _activeItemInfo.sharedScratchworkItemInfo =
                                                    new SharedScratchworkItemInfo(
                                                        itm.itemId,
                                                        itm.studentId,
                                                        itm.accessionNumber,
                                                        itm.content);
                                                deferred.resolve();
                                            },
                                            function (result) {
                                                logger.error('saveActiveScratchwork.saveSharedScratchwork failed: ' + angular.toJson(result));
                                                deferred.reject();
                                            });
                                    } else {
                                        deferred.resolve();
                                    }
                                });
                        } else {
                            deferred.resolve();
                        }

                        logger.exitingFn();

                        return deferred.promise;
                    };
                    function saveEReaderScratchwork(forceSave) {

                        var deferred = $q.defer();

                        if ((forceSave || _isScratchworkActive)) {

                            logger.setLoggerName('saveEReaderScratchwork').enteringFn();

                            _ereaderItem.scratchwork = angular.toJson(_ereaderItem.scratchwork);

                            repository.saveSharedScratchwork(_ereaderItem)
                                .then(function (result) {
                                    var itm = result.data;
                                    _ereaderItem.itemId = itm.itemId;
                                    _ereaderItem.studentId = itm.studentId;
                                    _ereaderItem.accessionNumber = itm.accessionNumber;
                                    _ereaderItem.scratchwork = getScratchworkObjectFromJson(itm.content);

                                    initializeEReaderScratchworkItemStructureIfRequired();

                                    deferred.resolve();
                                },
                                function (result) {
                                    _ereaderItem.scratchwork = getScratchworkObjectFromJson(_ereaderItem.scratchwork);
                                    logger.error('saveEReaderScratchwork.saveSharedScratchwork failed: ' + angular.toJson(result));
                                    deferred.reject();
                                });
                        } else {
                            deferred.resolve();
                        }

                        return deferred.promise;
                    };
                    function saveEReaderChildItemScratchwork(forceSave) {

                        var deferred = $q.defer();

                        if ((forceSave || _isScratchworkActive) && isEReaderItem()) {

                            logger.setLoggerName('saveEReaderChildItemScratchwork').enteringFn();

                            repository.saveScratchwork(_activeItemInfo)
                                .then(function (result) {
                                    if (result.data) {
                                        setActiveItem(
                                            new ItemInfo(
                                                _activeItemInfo.blockId,
                                                _activeItemInfo.itemId,
                                                _activeItemInfo.studentId,
                                                result.data.content,
                                                _activeItemInfo.itemMode,
                                                _activeItemInfo.sharedScratchworkItemInfo,
                                                _activeItemInfo.baseAccessionNumber
                                            ));
                                    }

                                    deferred.resolve();
                                },
                                function (result) {
                                    logger.error('saveEReaderChildItemScratchwork.saveScratchwork failed: ' + angular.toJson(result));
                                    deferred.reject();
                                });
                        } else {
                            deferred.resolve();
                        }

                        return deferred.promise;
                    };
                    function saveScratchwork(forceSave) {

                        var deferred = $q.defer();

                        logger.setLoggerName('saveScratchwork').enteringFn();

                        if (isEReaderItem()) {
                            saveEReaderScratchwork(forceSave)
                                .then(function () {
                                    if (isEReaderQuestionsPanelOpen) {
                                        saveEReaderChildItemScratchwork(forceSave)
                                            .then(function () {
                                                deferred.resolve();
                                            });
                                    } else {
                                        deferred.resolve();
                                    }
                                });
                        } else {
                            saveActiveScratchwork(forceSave)
                                .then(function () {
                                    deferred.resolve();
                                });
                        }

                        return deferred.promise;
                    };

                    function toolbarScratchworkClicked() {
                        var deferred = $q.defer();

                        saveScratchwork(true)
                            .then(function () {

                                _isScratchworkActive = !_isScratchworkActive;

                                if (!_isScratchworkActive) {
                                    enableDisableTabsForOnTheWayToSchool();
                                    toggleScratchwork();
                                    setMode(namesOfToolModes.None);

                                    deferred.resolve();
                                    return deferred.promise;
                                }

                                if (isEReaderItem()) {
                                    getItem()   //  Get Child Item
                                        .then(function () {
                                            getEReaderItem()    //  Get Parent Item
                                                .then(function () {
                                                    enableDisableTabsForOnTheWayToSchool();
                                                    setMode(namesOfToolModes.Draw);
                                                    toggleScratchwork();
                                                    clearScratchworkCanvas();
                                                    setEReaderCanvasDimensions();
                                                    showExistingScratchwork();

                                                    deferred.resolve();
                                                });
                                        });
                                } else {
                                    getItem()
                                        .then(function () {
                                            getSharedItem()
                                                .then(function () {
                                                    setMode(namesOfToolModes.Draw);
                                                    toggleScratchwork();
                                                    clearScratchworkCanvas();
                                                    setCanvasDimensions();
                                                    showExistingScratchwork();

                                                    deferred.resolve();
                                                });
                                        });
                                }
                            });

                        if (_isScratchworkActive) {
                            recordObservable(eventTypeEnums.SCRATCHWORKMODEOFF, _ereaderItem.newLocationId);
                        }
                        else {
                            recordObservable(eventTypeEnums.SCRATCHWORKMODEON, _ereaderItem.newLocationId);
                        }

                        $rootScope.$emit(globalConstants.EVENTNAMES.scratchworkToggledEvent, _isScratchworkActive);

                        return deferred.promise;
                    };
                    function toolbarScratchworkDrawClicked() {
                        setMode(namesOfToolModes.Draw);
                        toggleDraw();
                        recordObservable(eventTypeEnums.SCRATCHWORKDRAWMODEON, _ereaderItem.newLocationId);
                    };
                    function toolbarScratchworkEraseClicked() {
                        setMode(namesOfToolModes.Erase);
                        toggleErase();
                        recordObservable(eventTypeEnums.SCRATCHWORKERASEMODEON, _ereaderItem.newLocationId);
                    };
                    function toolbarScratchworkHighlightClicked() {
                        setMode(namesOfToolModes.Highlight);
                        toggleHighlight();
                        recordObservable(eventTypeEnums.SCRATCHWORKHIGHLIGHTMODEON, _ereaderItem.newLocationId);
                    };
                    function toolbarScratchworkClearClicked() {
                        clearScratchworkCanvas();
                        clearActiveItemScratchwork();
                        recordObservable(eventTypeEnums.CLEARSCRATCHWORK, _ereaderItem.newLocationId);
                    };

                    function getLayoutNameForId(id) {

                        var returnValue = null;

                        angular.forEach(globalConstants.ITEMLAYOUTS, function (parentValue, parentKey) {
                            angular.forEach(parentValue, function (value, key) {
                                if (key === 'code' && id === value) {
                                    returnValue = parentValue.value;
                                }
                            });
                        });

                        return returnValue;
                    };

                    function bindToItemEvents() {
                        $rootScope.$on(globalConstants.EVENTNAMES.itemChangedEvent, itemChangedEventOccurred);
                    };
                    function itemChangedEventOccurred(event, itemId) {

                        var itemLayoutName = getLayoutNameForId(appState.itemInfo.itemLayoutId);

                        logger.setLoggerName('itemChangedEventOccurred')
                            .debug(
                                'itemChangedEventOccurred - ' +
                                'itemId passed in: ' + itemId +
                                ', appState..studentId: ' + appState.studentInfo.studentId +
                                ', appState..blockId: ' + appState.blockInfo.blockId +
                                ', appState..itemId: ' + appState.itemInfo.itemId +
                                ', itemLayoutName: ' + itemLayoutName +
                                ', appState..baseAccessionNumber: ' + appState.itemInfo.baseAccessionNumber +
                                ', appState..accessionNumber: ' + appState.itemInfo.accessionNumber);

                        var itemInfo = new ItemInfo
                            (
                                appState.blockInfo.blockId, appState.itemInfo.itemId, appState.studentInfo.studentId, null, itemLayoutName,
                                new SharedScratchworkItemInfo(appState.itemInfo.itemId, appState.studentInfo.studentId, appState.itemInfo.baseAccessionNumber, null),
                                appState.itemInfo.baseAccessionNumber
                            );

                        reinitializeWritingScratchwork();

                        logger.debug('calling changeActiveItem from itemChangedEventOccurred with ' + angular.toJson(itemInfo));
                        changeActiveItem(itemInfo);
                    };

                    function reinitializeScrollableEReaderItems() {
                        _scratchworkConfigInfo.iframeMainItemContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameMainContainer);
                        _scratchworkConfigInfo.iframeItemCanvasContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvasContainer);
                        _scratchworkConfigInfo.iframeItemCanvasElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvas);
                        _scratchworkConfigInfo.iframeItemContentElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameContent);

                        var id = _scratchworkConfigInfo.iframeItemCanvasElement.get(0).id;
                        if (angular.isString(id) && id !== '') {
                            paperInContext().setup(id);
                            initializePaperJS();
                            logger.debug('reinitializeScrollableEReaderItems --- Setup PaperJS for Id: ' + id);
                        } else {
                            logger.debug('reinitializeScrollableEReaderItems --- Could not call paperpaperInContext().setup(id) as canvas id is unknown');
                        }
                    };

                    function enableDisableTabsForOnTheWayToSchool() {
                        var tabs = angular.element(namesOfSelectors.EReaderIFrame).contents().find('.tabs');
                        if (isIFrameScratchwork() && isOnTheWayToSchool() && isActive()) {
                            if (tabs && tabs.length) {
                                tabs.css('pointer-events', 'none');
                            }
                        } else {
                            if (tabs && tabs.length) {
                                tabs.css('pointer-events', '');
                            }
                        }
                    }

                    function bindToEReaderEvents() {
                        $rootScope.$on(globalConstants.EVENTNAMES.eReaderNavigationEvent, EReaderNavigationOccurred);
                        $rootScope.$on(globalConstants.EVENTNAMES.questionsPanelToggled, EReaderQuestionsPanelToggledOccurred);
                        $rootScope.$on(globalConstants.EVENTNAMES.interactiveStimuliIFrameCompiledEvent, InteractiveStimuliIFrameCompiledEventOccurred);
                    };
                    function EReaderNavigationOccurred(event, parameters) {

                        logger.setLoggerName(globalConstants.EVENTNAMES.eReaderNavigationEvent)
                            .debug(globalConstants.EVENTNAMES.eReaderNavigationEvent + ' parameters: ' + angular.toJson(parameters));

                        if (_ereaderItem) {
                            //_ereaderItem.studentId = parameters.studentId;
                            _ereaderItem.blockId = parameters.blockId;
                            _ereaderItem.itemId = parameters.itemId;
                            _ereaderItem.accessionNumber = parameters.accNum;
                            _ereaderItem.needsScratchwork = parameters.needScratchwork;
                            _ereaderItem.newLocationId = parameters.newLocationId;
                            _ereaderItem.oldLocationId = parameters.oldLocationId;
                            _ereaderItem.scratchwork = initializeEReaderScratchworkItemStructureIfRequired(true);

                            getEReaderItem()
                                .then(function () {
                                    if (isIFrameScratchwork()) {
                                        reinitializeScrollableEReaderItems();
                                    }
                                    enableDisableTabsForOnTheWayToSchool();
                                    clearScratchworkCanvas();
                                    setMode(namesOfToolModes.None);
                                    setEReaderCanvasDimensions();
                                    showExistingScratchwork();
                                });
                        }

                    };
                    function EReaderQuestionsPanelToggledOccurred(event, toggleValue) {

                        isEReaderQuestionsPanelOpen = toggleValue;

                        //  Need to initialize the eReader elements every time the QuestionPanel is opened as the elements are dynamic.
                        if (isEReaderQuestionsPanelOpen) {
                            $timeout(function() {
                                    _scratchworkConfigInfo.ereaderMainItemContainerElement = angular.element(namesOfSelectors.EReaderMainItemContainer);
                                    _scratchworkConfigInfo.ereaderItemCanvasContainerElement = angular.element(namesOfSelectors.EReaderItemCanvasContainer);
                                    _scratchworkConfigInfo.ereaderItemCanvasElement = angular.element(namesOfSelectors.EReaderItemCanvas);
                                    _scratchworkConfigInfo.ereaderItemContentElement = angular.element(namesOfSelectors.EReaderItemContent);

                                    var id = _scratchworkConfigInfo.ereaderItemCanvasElement.get(0).id;
                                    if (isCanvasIdValid(id)) {
                                        paperInContext().setup(id);
                                        logger.debug('EReaderQuestionsPanelToggledOccurred --- Setup PaperJS for Id: ' + id);
                                    } else {
                                        logger.debug('EReaderQuestionsPanelToggledOccurred --- Could not call paper.setup(id) as id is unknown.');
                                    }
                                }, 500)
                                .then(function() {
                                    logger.debug('EReaderQuestionsPanelToggledOccurred --- Loading active question panel scratchwork for block: '
                                                    + _activeItemInfo.blockId + ', itemId: ' + _activeItemInfo.itemId);
                                    changeActiveItem(_activeItemInfo);
                                });
                        }
                    };
                    function InteractiveStimuliIFrameCompiledEventOccurred(event, parameters) {
                        if (isIFrameScratchwork()) {
                            $timeout(function() {
                                    //_scratchworkConfigInfo.iframeMainItemContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameMainContainer);
                                    //_scratchworkConfigInfo.iframeItemCanvasContainerElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvasContainer);
                                    //_scratchworkConfigInfo.iframeItemCanvasElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvas);
                                    //_scratchworkConfigInfo.iframeItemContentElement = angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameContent);

                                    //var id = _scratchworkConfigInfo.iframeItemCanvasElement.get(0).id;
                                    //if (angular.isString(id) && id !== '') {
                                    //    paperInContext().setup(id);
                                    //    initializePaperJS();
                                    //    logger.debug('InteractiveStimuliIFrameCompiledEventOccurred --- Setup PaperJS for Id: ' + id);
                                    //} else {
                                    //    logger.debug('InteractiveStimuliIFrameCompiledEventOccurred --- Could not call paperpaperInContext().setup(id) as canvas id is unknown');
                                    //}

                                    reinitializeScrollableEReaderItems();

                                }, 500)
                                .then(function() {
                                    logger.debug('InteractiveStimuliIFrameCompiledEventOccurred --- Loading active question panel scratchwork for block: '
                                        + _activeItemInfo.blockId + ', itemId: ' + _activeItemInfo.itemId);
                                    changeActiveItem(_activeItemInfo);
                                });
                        }
                    };

                    function getScratchworkContentForAutoSave() {

                        var scratchworkContent = {
                            shouldSave: false,
                            isEReaderItem: false,
                            isSharedStimulusItem: false,
                            parentContent: null,
                            itemContent: null
                        };

                        if (isActive()) {

                            scratchworkContent.shouldSave = true;

                            scratchworkContent.itemContent = {
                                studentId: _activeItemInfo.studentId,
                                blockId: _activeItemInfo.blockId,
                                itemId: _activeItemInfo.itemId,
                                scratchwork: _activeItemInfo.scratchwork,
                            };

                            if (isEReaderItem()) {
                                scratchworkContent.isEReaderItem = true;
                                scratchworkContent.parentContent = {
                                    studentId: _activeItemInfo.studentId,
                                    blockId: _activeItemInfo.blockId,
                                    itemId: _ereaderItem.itemId,
                                    scratchwork: angular.toJson(_ereaderItem.scratchwork)
                                };
                            } else if (isSharedStimulusItem()) {
                                scratchworkContent.isSharedStimulusItem = true;
                                scratchworkContent.parentContent = {
                                    studentId: _activeItemInfo.studentId,
                                    blockId: _activeItemInfo.blockId,
                                    itemId: _activeItemInfo.sharedScratchworkItemInfo.itemId,
                                    scratchwork: _activeItemInfo.sharedScratchworkItemInfo.scratchwork
                                };
                            }
                        }

                        return scratchworkContent;
                    };
                    function saveScratchworkContentForAutoSave() {

                        var deferred = $q.defer();

                        if (isActive()) {

                            logger.debug('Saving on auto save.');

                            saveScratchwork().then(function () {
                                deferred.resolve();
                            });
                        } else {
                            deferred.resolve();
                        }

                        return deferred.promise;
                    };

                    function recordObservable(observableType, extendedInfo) {
                        observableEventService.raiseEvent(observableType, null, null, null, null, extendedInfo);
                    };

                    function reinitializeWritingScratchwork() {

                        if (isSubjectWritingAndExtendedText() === false) {
                            return;
                        }

                        _scratchworkConfigInfo.writingMainItemContainerElement = angular.element(namesOfSelectors.WritingMainItemContainer);
                        _scratchworkConfigInfo.writingItemCanvasContainerElement = angular.element(namesOfSelectors.WritingItemCanvasContainer);
                        _scratchworkConfigInfo.writingItemCanvasElement = angular.element(namesOfSelectors.WritingItemCanvas);
                        _scratchworkConfigInfo.writingItemContentElement = angular.element(namesOfSelectors.WritingItemContent);

                        if (_scratchworkConfigInfo.writingItemCanvasElement.length) {
                            var id = _scratchworkConfigInfo.writingItemCanvasElement.get(0).id;
                            if (isCanvasIdValid(id)) {
                                paperInContext().setup(id);
                                logger.debug('reinitializeWritingScratchwork --- Setup PaperJS for Id: ' + id);
                            } else {
                                logger.debug('reinitializeWritingScratchwork --- Could not call paper.setup(id) as id is unknown.');
                            }
                        }
                    };

                    function hide() {
                        if (angular.element(namesOfSelectors.CanvasContainer).length) {
                            angular.element(namesOfSelectors.CanvasContainer).hide();
                        }
                        if (angular.element(namesOfSelectors.EReaderItemCanvasContainer).length) {
                            angular.element(namesOfSelectors.EReaderItemCanvasContainer).hide();
                        }
                        if (angular.element(namesOfSelectors.WritingItemCanvasContainer).length) {
                            angular.element(namesOfSelectors.WritingItemCanvasContainer).hide();
                        }
                    };
                    function show() {
                        if (angular.element(namesOfSelectors.CanvasContainer).length) {
                            angular.element(namesOfSelectors.CanvasContainer).show();
                        }
                        if (angular.element(namesOfSelectors.EReaderItemCanvasContainer).length) {
                            angular.element(namesOfSelectors.EReaderItemCanvasContainer).show();
                        }
                        if (angular.element(namesOfSelectors.WritingItemCanvasContainer).length) {
                            angular.element(namesOfSelectors.WritingItemCanvasContainer).show();
                        }
                    };

                    function getEnabledTooltip() {
                        setToolTip(namesOfToolModes.Scratchwork, namesOfStates.Enabled);
                        return _toolbarInfo.toolbarInfo.titleText;
                    };
                    function getDisabledTooltip() {
                        setToolTip(namesOfToolModes.Scratchwork, namesOfStates.Disabled);
                        return _toolbarInfo.toolbarInfo.titleText;
                    };

                    //  Initialize Scratchwork
                    setActiveItem(null);
                    setMode(namesOfToolModes.None);

                    //  Initialize PaperJS
                    initializePaperJS();

                    //  Bind to events
                    bindToEReaderEvents();
                    bindToItemEvents();

                    logger.setLoggerName('Scratchwork').exitingFn();

                    return {
                        contentInfo: _contentInfo,
                        toolbarInfo: _toolbarInfo,

                        changeActiveItem: changeActiveItem,
                        isActive: isActive,

                        getScratchworkContentForAutoSave: getScratchworkContentForAutoSave,
                        saveScratchworkContentForAutoSave: saveScratchworkContentForAutoSave,

                        toolbarScratchworkClicked: toolbarScratchworkClicked,
                        toolbarScratchworkDrawClicked: toolbarScratchworkDrawClicked,
                        toolbarScratchworkEraseClicked: toolbarScratchworkEraseClicked,
                        toolbarScratchworkHighlightClicked: toolbarScratchworkHighlightClicked,
                        toolbarScratchworkClearClicked: toolbarScratchworkClearClicked,

                        show: show,
                        hide: hide,

                        getEnabledTooltip: getEnabledTooltip,
                        getDisabledTooltip: getDisabledTooltip
                    };
                };

                //#endregion

                function resetZoom() {
                    angular.element(namesOfSelectors.ToolbarBackground).css('zoom', 1.33);
                    angular.element(namesOfSelectors.Toolbar).css('zoom', 1.33);

                    if (angular.element(namesOfSelectors.TabStrip).length) {
                        angular.element(namesOfSelectors.TabStrip).css('zoom', 1.33);
                    }
                    if (angular.element(namesOfSelectors.EReaderTabStrip).length) {
                        angular.element(namesOfSelectors.EReaderTabStrip).css('zoom', 1.33);
                    }

                    angular.element(namesOfSelectors.ToolbarBackground).css('zoom', 'reset');
                    angular.element(namesOfSelectors.Toolbar).css('zoom', 'reset');

                    if (angular.element(namesOfSelectors.TabStrip).length) {
                        angular.element(namesOfSelectors.TabStrip).css('zoom', 'reset');
                    }
                    if (angular.element(namesOfSelectors.EReaderTabStrip).length) {
                        angular.element(namesOfSelectors.EReaderTabStrip).css('zoom', 'reset');
                    }
                };
                function toolbarScratchworkClickedOccurred(event, parameters) {
                    if (scratchworkManager) {
                        resetZoom();
                        scratchworkManager.toolbarScratchworkClicked();
                    }
                };
                function bindToEvents() {
                    $rootScope.$on(globalConstants.EVENTNAMES.toolbarScratchworkClicked, toolbarScratchworkClickedOccurred);
                };

                function createScratchwork(subjectId) {

                    var scratchworkConfigurationInfoObj =
                        new ScratchworkConfigurationInfo(
                            angular.element(namesOfSelectors.MainContainer),                    // mainContainerElement
                            angular.element(namesOfSelectors.CanvasContainer),                  // canvasContainerElement
                            angular.element(namesOfSelectors.ParentCanvas),                     // parentCanvasElement
                            angular.element(namesOfSelectors.ParentContent),                    // parentContentElement
                            angular.element(namesOfSelectors.ItemCanvas),                       // itemCanvasElement
                            angular.element(namesOfSelectors.ItemContent),                      // itemContentElement

                            angular.element(namesOfSelectors.EReaderMainItemContainer),         // ereaderMainItemContainerElement
                            angular.element(namesOfSelectors.EReaderItemCanvasContainer),       // ereaderItemCanvasContainerElement
                            angular.element(namesOfSelectors.EReaderItemCanvas),                // ereaderItemCanvasElement
                            angular.element(namesOfSelectors.EReaderItemContent),               // ereaderItemContentElement

                            angular.element(namesOfSelectors.WritingMainItemContainer),         // writingMainItemContainerElement
                            angular.element(namesOfSelectors.WritingItemCanvasContainer),       // writingItemCanvasContainerElement
                            angular.element(namesOfSelectors.WritingItemCanvas),                // writingItemCanvasElement
                            angular.element(namesOfSelectors.WritingItemContent),               // writingItemContentElement

                            angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameMainContainer),      // iframeMainItemContainerElement
                            angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvasContainer),    // iframeItemCanvasContainerElement
                            angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameCanvas),             // iframeItemCanvasElement
                            angular.element(namesOfSelectors.EReaderIFrame).contents().find(namesOfSelectors.IFrameContent)             // iframeItemContentElement
                        );

                    var scratchworkToolbarInfoObj =
                        new ScratchworkToolbarInfo(
                            new ToolbarInfo(
                                namesOfToolModes.Scratchwork,
                                toolTips.scratchwork,
                                toolTips.scratchwork.enabled,
                                cssToolbarStyles.scratchwork,
                                cssToolbarStyles.scratchwork.inactive),
                            new ToolbarInfo(
                                namesOfToolModes.ToolWrapper,
                                toolTips.toolWrapper,
                                toolTips.toolWrapper.enabled,
                                cssToolbarStyles.toolWrapper,
                                cssToolbarStyles.toolWrapper.inactive),
                            new ToolbarInfo(
                                namesOfToolModes.Draw,
                                toolTips.draw,
                                toolTips.draw.enabled,
                                cssToolbarStyles.draw,
                                cssToolbarStyles.draw.inactive),
                            new ToolbarInfo(
                                namesOfToolModes.Erase,
                                toolTips.erase,
                                toolTips.erase.enabled,
                                cssToolbarStyles.erase,
                                cssToolbarStyles.erase.inactive),
                            new ToolbarInfo(
                                namesOfToolModes.Highlight,
                                toolTips.highlight,
                                toolTips.highlight.enabled,
                                cssToolbarStyles.highlight,
                                cssToolbarStyles.highlight.inactive),
                            new ToolbarInfo(
                                namesOfToolModes.Clear,
                                toolTips.clear,
                                toolTips.clear.enabled,
                                cssToolbarStyles.clear,
                                cssToolbarStyles.clear.inactive)
                        );

                    var scratchworkContentInfoObj =
                        new ScratchworkContentInfo(
                            new ContentInfo(cssToolbarStyles.content, cssToolbarStyles.content.inactive),           //  parentContentInfo
                            new ContentInfo(cssToolbarStyles.content, cssToolbarStyles.content.inactive),           //  itemContentInfo
                            new ContentInfo(cssToolbarStyles.scratchPad, cssToolbarStyles.scratchPad.inactive),     //  scratchPadInfo
                            new ContentInfo(cssToolbarStyles.canvas, cssToolbarStyles.canvas.inactive),             //  parentCanvasInfo
                            new ContentInfo(cssToolbarStyles.canvas, cssToolbarStyles.canvas.inactive),             //  itemCanvasInfo

                            new ContentInfo(cssToolbarStyles.scratchPad, cssToolbarStyles.scratchPad.inactive),     //  scratchPadEReaderInfo
                            new ContentInfo(cssToolbarStyles.content, cssToolbarStyles.scratchPad.inactive),        //  ereaderItemContentInfo
                            new ContentInfo(cssToolbarStyles.canvas, cssToolbarStyles.canvas.inactive),             //  ereaderItemCanvasInfo

                            new ContentInfo(cssToolbarStyles.scratchPad, cssToolbarStyles.scratchPad.inactive),     //  scratchPadWritingInfo
                            new ContentInfo(cssToolbarStyles.content, cssToolbarStyles.scratchPad.inactive),        //  writingItemContentInfo
                            new ContentInfo(cssToolbarStyles.canvas, cssToolbarStyles.canvas.inactive),             //  writingItemCanvasInfo

                            new ContentInfo(cssToolbarStyles.scratchPad, cssToolbarStyles.scratchPad.inactive),     //  scratchPadIFrameInfo
                            new ContentInfo(cssToolbarStyles.content, cssToolbarStyles.scratchPad.inactive),        //  iframeItemContentInfo
                            new ContentInfo(cssToolbarStyles.canvas, cssToolbarStyles.canvas.inactive)              //  iframeItemCanvasInfo
                        );

                    scratchworkManager = new Scratchwork(subjectId, scratchworkConfigurationInfoObj, scratchworkToolbarInfoObj, scratchworkContentInfoObj);

                    bindToEvents();

                    return scratchworkManager;
                };

                return {
                    models: {
                        ItemInfo: ItemInfo,
                        SharedScratchworkItemInfo: SharedScratchworkItemInfo,
                        ScratchworkConfigurationInfo: ScratchworkConfigurationInfo
                    },
                    createScratchwork: createScratchwork,
                    cssToolbarStyles: cssToolbarStyles
                };
            }]);
}());
