/*jslint node:true, white:true, devel:true, debug:true, todo:true nomen:true, plusplus:true */
/*global angular */

(function () {
    'use strict';

    angular.module('appStateInfoModule')
        //TODO: This should be a constant instead of a service
        .service('constantService', [
            function () {
                var _eventNames = {
                    eReaderNavigationEvent: 'eReaderNavigationEvent',

                    ttsActivatedEvent: 'ttsActivatedEvent',
                    ttsDeactivatedEvent: 'ttsDeactivatedEvent',

                    zoomInClickedEvent: 'zoomInClickedEvent',
                    zoomOutClickedEvent: 'zoomOutClickedEvent',

                    nextBlockNavEvent: 'nextBlockNavEvent',
                    nextItemButtonClickedEvent: 'nextItemButtonClickedEvent',
                    previousItemButtonClickedEvent: 'previousItemButtonClickedEvent',

                    themeChangedEvent: 'themeChangedEvent',

                    blockChangedEvent: 'blockChangedEvent',

                    questionsPanelToggled: 'questionsPanelToggled',

                    blockTimerSuspend: 'blockTimerSuspend',
                    blockTimerResume: 'blockTimerResume',

                    itemChangedEvent: 'itemChangedEvent',
                    dialogItemChangedEvent: 'dialogItemChangedEvent',
                    reviewItemLoadingEvent: 'reviewItemLoadingEvent',
                    itemStatusChangedEvent: 'itemStatusChangedEvent',
                    sceneNameChangedEvent: 'sceneNameChangedEvent',
                    tabChangedEvent: 'tabChangedEvent',

                    toolbarScratchworkClicked: 'toolbarScratchworkClicked',
                    scratchworkToggledEvent: 'scratchworkToggledEvent',
                    scratchworkSubToolToggledEvent: 'scratchworkSubToolToggledEvent',
                    scratchworkRenderedEvent: 'scratchworkRenderedEvent',

                    toolbarCalculatorClicked: 'toolbarCalculatorClicked',

                    assessmentEndedEvent: 'assessmentEndedEvent',

                    ckEditorDialogOpenedEvent: 'ckEditorDialogOpenedEvent',
                    ckEditorDialogClosedEvent: 'ckEditorDialogClosedEvent',

                    // Occurs when the user clicks on a 'Formatted Reference' (lookback) button.
                    formattedReferenceClicked: 'formattedReferenceClicked',

                    itemLoaded: 'itemLoaded',
                    adjustmentItemLoaded: 'adjustmentItemLoaded',

                    enaepModalUpdateDynamicContentEvent: 'enaepModalUpdateDynamicContentEvent',
                    enaepModalDialogOpenedEvent: 'enaepModalDialogOpenedEvent',
                    enaepModalDialogClosedEvent: 'enaepModalDialogClosedEvent',

                    enaepErrorEvent: 'enaepErrorEvent',

                    studentResponseChangedEvent: 'studentResponseChangedEvent',
                    studentSessionPaused: 'studentSessionPaused',
                    studentSessionResumed: 'studentSessionResumed',
                    studentSessionAdvanced: 'studentSessionAdvanced',
                    zoomPerformedEvent: 'zoomPerformedEvent',

                    equationEditorButtonClickedEvent: 'equationEditorButtonClickedEvent',
                    equationEditorCloseClickedEvent: 'equationEditorCloseClickedEvent',
                    equationEditorTabClickedEvent: 'equationEditorTabClickedEvent',
                    equationEditorStateChangedEvent: 'equationEditorStateChangedEvent',
                    equationAreaKeyDownEvent: 'equationAreaKeyDownEvent',

                    clearAnswerClickedEvent: 'clearAnswerClickedEvent',
                    pageLimitExceededEvent: 'pageLimitExceededEvent',
                    clickYesEvent: 'clickYesEvent',
                    clickNoEvent: 'clickNoEvent',
                    clickOKEvent: 'clickOKEvent',

                    resumeStateInfoLoadedEvent: 'resumeStateInfoLoadedEvent',

                    itemUnloadingEvent: 'itemUnloadingEvent',
                    itemContentRenderedEvent: 'itemContentRenderedEvent',
                    parentItemContentRenderedEvent: 'parentItemContentRenderedEvent',

                    equationAreaGotFocusEvent: 'equationAreaGotFocusEvent',
                    equationAreaLostFocusEvent: 'equationAreaLostFocusEvent',
                    equationAreaActivatedEvent: 'equationAreaActivatedEvent',

                    snapshotCapturingEvent: 'snapshotCapturingEvent',
                    snapshotCapturedEvent: 'snapshotCapturedEvent',

                    interactiveStimuliIFrameCompiledEvent: 'interactiveStimuliIFrameCompiledEvent',

                    bilingualToggleEvent: 'bilingualToggleEvent',

                    performOverriddenNextNavEvent: 'performOverriddenNextNavEvent',
                    performOverriddenPrevNavEvent: 'performOverriddenPrevNavEvent',

                    helpToggledOn: 'helpToggledOn',
                    helpToggledOff: 'helpToggledOff',

                    toolbarReceiveForwardFocus: 'toolbarReceiveForwardFocus',
                    toolbarReceiveBackwardFocus: 'toolbarReceiveBackwardFocus',
                    toolbarLostFocusEvent: 'toolbarLostFocusEvent',

                    // This event is used by tutorialHelperService to communicate the user language selection via tutorial to the platform
                    // languageSelectionCtrl is the intended audience.
                    languageSelectEvent: 'languageSelectEvent',

                    writingEditorInstanceReadyEvent: 'writingEditorInstanceReadyEvent',
                    selLimitExceededEvent: 'selLimitExceededEvent',
                    maxCharLimitReachedEvent: 'maxCharLimitReachedEvent',
                    
                    //This event is used by numericValidationDirective
                    numericValidationFailedEvent: 'numericValidationFailedEvent'
                };

                var _webApi = {
                    baseUrl: '/api/'
                };

                var _itemLayouts = {
                    SINGLE_COLUMN: { code: 1, value: 'Single column' },
                    VERTICAL_SPLIT: { code: 2, value: 'Vertical split' },
                    HORIZONTAL_SPLIT: { code: 3, value: 'Horizontal split' },
                    SHARED_STIMULUS_PARENT: { code: 4, value: 'Shared Stimulus Parent' },
                    SHARED_STIMULUS_CHILD: { code: 5, value: 'Shared Stimulus Child' },
                    EREADER_PARENT: { code: 6, value: 'eReader Parent' },
                    EREADER_CHILD: { code: 7, value: 'eReader Child' },
                    getItemLayoutName: getItemLayoutName
                };

                function getItemLayoutName(code) {
                    var rc = 'unknown';
                    for (var il in this) {
                        if (this[il].code === code) {
                            rc = il.toLowerCase();
                            break;
                        }
                    }
                    return rc;
                }

                var _toolIds = {
                    highlighter: 2,
                    textToSpeech: 3,
                    switchTheme: 6,
                    tI30xsCalculator: 9,
                    tI108Calculator: 10,
                    scratchPad: 11,
                    zoomIn: 12,
                    zoomOut: 13,
                    bilingualToggle: 14,
                    equationEditor: 15,
                    // settings for following tools are not available in the server-side layer.All tools with negative ids are excluded from dynamic state changes based on db settings
                    help: -10,
                    timerTool: -11,
                    progressIndicatorTool: -12
                };

                var _accommodationsEnum = {
                    NEW_JERSEY: '1',
                    UTAH: '2'
                };

                var _rulePackEnum = {
                    OtherInfo: 'OtherInfo',
                    ZipCode: 'ZipCode',
                    NoAnswered: 'NoAnswered'
                };


                var _eventTypes = {
                    ENAEP_ERROR: 'ERROR'
                };

                var _itemDirection = {
                    none: 0,
                    previous: 1,
                    next: 2
                };

                var _SQSettings = {
                    OptOutCoreSQs: 1,
                    OptOutSubjectSQs: 2,
                    OptOutCAFSSQs: 4,
                    InsertRaceEthnicityInstruction: 8
                };

                var _NumericValidationSettings = {
                    numericValidationFailedNonNumericKeysPresent: 1,
                    numericValidationFailedNumberOfDigitsRequirementNotMet: 2,
                    numericValidationFailedInputLessThanAllowed: 3,
                    numericValidationFailedInputGreaterThanAllowed: 4,
                    numericValidationFailedInputOutsideAllowedRange: 5,
                    messagePlaceholder: '*message*',
                    numericValidationMessageVariableText1: /<numericValidationMessageVariableText1>/,
                    numericValidationMessageVariableText2: /<numericValidationMessageVariableText2>/
                };
                

                var _isMathMLEquationEmpty = function(mml) {
                    var emptyMathML1 = '<math xmlns="http://www.w3.org/1998/Math/MathML"/>';
                    var spaceCharacter = '<mo>&#x000A0;</mo>';
                    var emptyMathMLAfterReplace = '<math xmlns="http://www.w3.org/1998/Math/MathML"></math>';

                    if (mml === emptyMathML1) {
                        // it matches atleast 1 empty mathml equation
                        return true;
                    }
                    if (typeof mml.replace === 'function') {
                        var noSpaces = mml.replace(new RegExp(spaceCharacter, 'g'), '');
                        if (noSpaces === emptyMathMLAfterReplace) {
                            return true;
                        }
                    }

                    return false;
                };

                var _blockTimeType = {
                    NONE: 1,
                    FIXED: 2,
                    MAX: 3
                };

                var _language = {
                    ENGLISH: 'en',
                    SPANISH: 'es'
                };

                var _subject = {
                    READING: { id: 1, code: 'RED', language: _language.ENGLISH, name: "Reading" },
                    MATH: { id: 2, code: 'MAT', language: _language.ENGLISH, name: "Mathematics" },
                    SCIENCE: { id: 3, code: 'SCI', language: _language.ENGLISH, name: "Science" },
                    WRITING: { id: 4, code: 'WRI', language: _language.ENGLISH, name: "Writing" },
                    GEOGRAPHY: { id: 5, code: 'GEO', language: _language.ENGLISH, name: "Geography" },
                    USHISTORY: { id: 6, code: 'HIS', language: _language.ENGLISH, name: "U.S. History" },
                    CIVICS: { id: 7, code: 'CIV', language: _language.ENGLISH, name: "Civics" },
                    ART: { id: 8, code: 'ART', language: _language.ENGLISH, name: "Arts" },
                    ECONOMICS: { id: 9, code: 'ECN', language: _language.ENGLISH, name: "Economics" },
                    MUSIC: { id: 10, code: 'MUS', language: _language.ENGLISH, name: "Music" },
                    VISUALARTS: { id: 11, code: 'VIS', language: _language.ENGLISH, name: "Visual Arts" },
                    TECHLIT: { id: 12, code: 'TEL', language: _language.ENGLISH, name: "Tech Lit" },
                    MATHPUERTORICO: { id: 13, code: 'MPR', language: _language.SPANISH, name: "Matemáticas" }
                };

                var _itemTypeEnum = {
                    CONTENT: { id: 1, code: 'CONTENT' },
                    TIMELEFTMESSAGE: { id: 2, code: 'TIMELEFTMESSAGE' },
                    TIMEOUTMESSAGE: { id: 3, code: 'TIMEOUTMESSAGE' },
                    HELP: { id: 4, code: 'HELP' },
                    DIRECTIONS: { id: 5, code: 'DIRECTIONS' },
                    TUTORIAL: { id: 6, code: 'TUTORIAL' },
                    THANKYOU: { id: 7, code: 'THANKYOU' },
                    SQNOTANSWERED: { id: 8, code: 'SQNOTANSWERED' },
                    ZIPCODEMESSAGE: { id: 9, code: 'ZIPCODEMESSAGE' },
                    ADJUSTMENT: { id: 12, code: 'ADJUSTMENT' },
                    LANGUAGE_SELECTION: { id: 13, code: 'LANGUAGESELECTION' },
                    DIALOG: { id: 15, code: 'DIALOG' },
                    DIRECTIONSHOTSCK: { id: 17, code: 'DIRECTIONSHOTSCK' },
                    BLOCKREVIEW: { id: 220, code: 'BLOCKREVIEW' },
                    EXTENDEDTEXT: { id: 110, code: 'EXTENDEDTEXT' },
                    OTHERSPECIFY: { id: 11, code: 'OTHERSPECIFY', accessionNumberEn: 'OtherSpecify', accessionNumberSp: 'OtrSpecifysp' },
                    FILLINBLANK: { id: 90, code: 'FILLINBLANK' },
                    MULTIPLEFILLINBLANK: { id: 100, code: 'MULTIPLEFILLINBLANK' },
                    BQMULTIPLEFILLINBLANK: { id: 103, code: 'BQMULTIPLEFILLINBLANK' },
                    BQEXTENDEDTEXT: { id: 112, code: 'BQEXTENDEDTEXT' },
                    BQNUMERIC: { id: 102, code: 'BQNUMERIC' },
                    BQMULTIPLENUMERIC: { id: 101, code: 'BQMULTIPLENUMERIC' },
                    BQMCSS: { id: 71, code: 'BQMCSS' },
                    BQMCMS: { id: 81, code: 'BQMCMS' },
                    REVIEW: { id: 220, code: 'REVIEW' },
                    WRITING_DIALOG: { id: 15, code: 'DIALOG', accessionNumberEn: 'RespLimit' },
                    SELLIMIT_DIALOG: { id: 15, code: 'DIALOG', accessionNumberEn: 'SelLimit' },
                    MAXCHARLIMIT_DIALOG: { id: 15, code: 'DIALOG', accessionNumberEn: 'RespLimit' },
                    NUMERICVALIDATION_DIALOG: { id: 15, code: 'DIALOG', accessionNumberEn: 'NumVal' },
                    GRIDMS: { id: 40, code: 'GRIDMS' },
                    BQCHOICES: { id: 72, code: 'BQChoices' },                    

                    MATCHSS: { id: 10, code: "MATCHSS " },
                    MATCHMS: { id: 20, code: "MATCHMS " },
                    GRIDSS: { id: 30, code: "GRIDSS " },
                    ZONESSS: { id: 50, code: "ZONESSS" },
                    ZONESMS: { id: 60, code: "ZONESMS" },
                    MCSS: { id: 70, code: "MCSS " },
                    MCMS: { id: 80, code: "MCMS " },
                    COMPOSITE: { id: 120, code: "COMPOSITE " },
                    COMPOSITECR: { id: 130, code: "COMPOSITECR " },
                    LEADER: { id: 140, code: "LEADER " },
                    INTERACTIVE: { id: 152, code: "INTERACTIVE" },
                    INLINECHOICELISTMS: { id: 153, code: "INLINECHOICELISTMS" },
                    SBT: { id: 170, code: "SBT" },
                    READINGNONSBT: { id: 172, code: "READINGNONSBT" },
                    INLINECHOICELISTSS: { id: 221, code: "INLINECHOICELISTSS" },
                    isDirectional: _isDirectionalItemType,
                    isDialogItemType: _isDialogItemType,
                    getItemTypeCode: _getItemTypeCode
                };

                function _getItemTypeCode(itemTypeId) {
                    var rc = 'UNKNOWN';
                    for (var it in this) {
                        if (this[it].id === itemTypeId) {
                            rc = it;
                            break;
                        }
                    }
                    return rc;
                }

                function _isDialogItemType(itemTypeId) {
                    switch (itemTypeId) {
                        case this.DIALOG.id:
                        case this.OTHERSPECIFY.id:
                        case this.SQNOTANSWERED.id:
                        case this.ZIPCODEMESSAGE.id:
                        case this.TIMELEFTMESSAGE.id:
                        case this.TIMEOUTMESSAGE.id:
                        case this.WRITING_DIALOG.id:
                        case this.SELLIMIT_DIALOG.id:
                        case this.MAXCHARLIMIT_DIALOG.id:
                            return true;
                    }
                    return false;
                }

                function _isDirectionalItemType(itemTypeId) {
                    switch (itemTypeId) {
                        case this.TIMELEFTMESSAGE.id:
                        case this.TIMEOUTMESSAGE.id:
                        case this.HELP.id:
                        case this.DIRECTIONS.id:
                        case this.TUTORIAL.id:
                        case this.THANKYOU.id:
                        case this.SQNOTANSWERED.id:
                        case this.ZIPCODEMESSAGE.id:
                        case this.DIALOG.id:
                        case this.BLOCKREVIEW.id:
                        case this.OTHERSPECIFY.id:
                        case this.WRITING_DIALOG.id:
                        case this.SELLIMIT_DIALOG.id:
                        case this.MAXCHARLIMIT_DIALOG.id:
                            return true;
                    }
                    return false;
                }

                var _writingViewModes = {
                    WRITE_ONLY: 1,
                    SPLIT: 2,
                    PASSAGE_ONLY: 3
                };

                var _themeEnum = {
                    BRUSHED: { name: 'brushed' },
                    LOW: { name: 'low' },
                    HIGH: { name: 'high' }
                };

                /// 20151020: per discussion, stating that blockTypeId definition should not change semantically,
                /// copied definition from database table [BlockType] for determining block type semantic
                /// (e.g. cognitive?  questionnaire?, etc.)
                var _blockTypeEnum = {
                    COGNITIVE: { id: 1, name: 'Cognitive' },
                    CORESTUDENTQUESTIONNAIRE: { id: 2, name: 'Core Student Questionnaire' },
                    SUBJECTSTUDENTQUESTIONNAIRE: { id: 3, name: 'Subject Student Questionnaire' },
                    INSTRUCTIONS: { id: 4, name: 'Instructions' },
                    PROTOTYPEQUESTIONS: { id: 5, name: 'Prototype Questions' },
                    HANDSONTASKS: { id: 6, name: 'Hands On Tasks' },
                    REVIEWITEM: { id: 7, name: 'ReviewItem' },
                    NAEPVALIDITYSTUDIESSTUDENTQUESTIONNAIRE: { id: 8, name: 'NAEP Validity Studies Student Questionnaire' },
                    NVSDIRECTIONSBLOCK: { id: 9, name: 'NVS Directions Block' },

                    isCognitive: function (e) {
                        switch (e) {
                            case _blockTypeEnum.COGNITIVE.id:
                            case _blockTypeEnum.HANDSONTASKS.id:
                                return true;

                        }
                        return false;
                    },
                    isQuestionnaire: function (e) {
                        switch (e) {
                            case _blockTypeEnum.CORESTUDENTQUESTIONNAIRE.id:
                            case _blockTypeEnum.SUBJECTSTUDENTQUESTIONNAIRE.id:
                            case _blockTypeEnum.PROTOTYPEQUESTIONS.id:
                            case _blockTypeEnum.NAEPVALIDITYSTUDIESSTUDENTQUESTIONNAIRE.id:
                                return true;

                        }
                        return false;
                    }
                };

                var _bilingualStateEnum = Object.freeze({
                    NONE: Object.freeze({ name: "None" }),
                    BILINGUAL: Object.freeze({ name: "Bilingual" }),
                    DIRECTIONS_ONLY: Object.freeze({ name: "Directions Only" })
                });

                var _assessmentGroups = [{
                    code: 'GRADE4',
                    assessedGroupId: 1,
                    label: 'Grade 4'
                }, {
                    code: 'GRADE8',
                    assessedGroupId: 2,
                    label: 'Grade 8'
                }, {
                    code: 'GRADE12',
                    assessedGroupId: 3,
                    label: 'Grade 12'
                }];

                return {
                    STUDENT_LOGIN_URL: '/app/student/studentShell.html#/studentLogin', // default
                    STUDENT_LOGIN_URL_ES: '/app/student/studentShell.html#/studentLogin/es',
                    ADMIN_LOGIN_URL: '/app/admin/adminshell.html#/adminLogin',
                    ADMIN_DATA_API_URL: 'api/AdminData/',
                    GET_ENVIRONMENT_INFO_PATH: 'getEnvironmentInfo/',

                    EVENTNAMES: _eventNames,
                    WEBAPI: _webApi,
                    ITEMLAYOUTS: _itemLayouts,
                    TOOLIDS: _toolIds,
                    ACCOMMODATIONS: _accommodationsEnum,
                    RULEPACKS: _rulePackEnum,
                    EVENTTYPES: _eventTypes,
                    ITEMDIRECTION: _itemDirection,
                    SQSETTINGS: _SQSettings,
                    NUMERICVALIDATIONSETTINGS:_NumericValidationSettings,

                    isMathMLEquationEmpty: _isMathMLEquationEmpty,

                    //  BEGIN - Moved here from appStateInfoService
                    BLOCKTIMETYPES: _blockTimeType,
                    LANGUAGETYPES: _language,
                    SUBJECTS: _subject,
                    ITEMTYPES: _itemTypeEnum,
                    WRITINGVIEWMODES: _writingViewModes,
                    THEMES: _themeEnum,
                    BLOCKTYPES: _blockTypeEnum,
                    BILINGUALSTATES: _bilingualStateEnum,
                    //  END - Moved here from appStateInfoService

                    assessmentGroups: _assessmentGroups
                };
            }
        ]);
})();