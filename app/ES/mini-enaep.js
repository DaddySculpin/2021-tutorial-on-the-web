(function () {
	// history.pushState(null, document.title, location.href);
	// history.pushState(null, document.title, location.href);
	// history.pushState(null, document.title, location.href);
	// history.pushState(null, document.title, location.href);
	// history.pushState(null, document.title, location.href);
	// window.addEventListener('popstate', function (event) {
	// 	history.pushState(null, document.title, location.href);
	// });

	//extracts the variable from the link
	function getRequestArgs() {
		var argStrings = location.search.substr(1).split("\u0026");
		var args = new Object;
		for (var iArg = 0; iArg < argStrings.length; iArg++) {
			var keyAndValue = argStrings[iArg].split("=");
			args[keyAndValue[0]] = keyAndValue[1];
		}
		return args;
	}
	var args = getRequestArgs();
	var subject = args["subject"];
	var currentModule = 0;
	if(args["module"])
		currentModule = parseInt(args["module"]);

	var Strings = {
		"sa_timeRemaining": "Tiempo que queda",
		"STUDENT_PROGRESS_MSG": "",
		"PROGRESSLABEL": "Progreso"
	};

	var Resources = {};

	$.getJSON('./content/i18nResources/StringResource_es.json', function(json) {
		Resources = json;
	});

	// Resolve toolbar button visiblity and configuration
	var toolbarConfigs = {

		'Math4BEs': {
			help: { isVisible: true },
			theme: { isVisible: true },
			zoom: { isVisible: true },
			tts: { isVisible: true },
			scratchwork: {
				isVisible: true,
				pencil: { style: '' },
				highlighter: { style: '' },
				eraser: { style: '' },
				clear: { style: '' }
			},
			bilingualToggle: { isVisible: true },
			equationEditor: { isVisible: true },
			calculator: { isVisible: true },
			timer: { isVisible: true },
			progress: { isVisible: true }
		},

		'Math8BEs': {
			help: { isVisible: true },
			theme: { isVisible: true },
			zoom: { isVisible: true },
			tts: { isVisible: true },
			scratchwork: {
				isVisible: true,
				pencil: { style: '' },
				highlighter: { style: '' },
				eraser: { style: '' },
				clear: { style: '' }
			},
			bilingualToggle: { isVisible: true },
			equationEditor: { isVisible: true },
			calculator: { isVisible: true },
			timer: { isVisible: true },
			progress: { isVisible: true }
		},

		'ReadingDEs': {
			help: { isVisible: true },
			theme: { isVisible: true },
			zoom: { isVisible: true },
			tts: { isVisible: true },
			scratchwork: {
				isVisible: true,
				pencil: { style: '' },
				highlighter: { style: '' },
				eraser: { style: '' },
				clear: { style: '' }
			},
			bilingualToggle: { isVisible: true },
			equationEditor: { isVisible: false },
			calculator: { isVisible: false },
			timer: { isVisible: true },
			progress: { isVisible: true }
		},

		'ScienceBEs': {
			help: { isVisible: true },
			theme: { isVisible: true },
			zoom: { isVisible: true },
			tts: { isVisible: true },
			scratchwork: {
				isVisible: true,
				pencil: { style: '' },
				highlighter: { style: '' },
				eraser: { style: '' },
				clear: { style: '' }
			},
			bilingualToggle: { isVisible: true },
			equationEditor: { isVisible: false },
			calculator: { isVisible: true },
			timer: { isVisible: true },
			progress: { isVisible: true }
		},
	};

	function getToolbarConfig() {
		var args = getRequestArgs();
		console.log(JSON.stringify(args));

		return toolbarConfigs[subject];
	}

	var bookMapArray = {

		'Math4BEs': [
			'Intro-M4-BEs',
			'UI-M4-BEs',
			'EE4-BEs',
			'Practica-M4-BEs',
			'Outro-BEs',
			'Static-Menu-Common-ES'],
		
		'Math8BEs': [
			'Intro-M8-BEs',
			'UI-M8-BEs',
			'EE8-BEs',
			'Practica-M8-BEs',
			'Outro-BEs',
			'Static-Menu-Common-ES'],

		'ScienceBEs': [
			'Intro-S-BEs',
			'UI-S-BEs',
			'Practica-S-BEs',
			'Outro-BEs',
			'Static-Menu-Common-ES'],

		'ReadingDEs': [
			'Intro-R-DEs',
			'UI-R-DEs',
			'Practica-R-DEs',
			'Outro-DEs',
			'Static-Menu-Common-ES'],

	};

	function getBookMapArray() {
		return bookMapArray[subject];
	}

	function noop() { }
	function returnTrue() { return true; }
	function returnFalse() { return false; }
	function returnEmptyString() { return ''; }

	var app = angular.module('TutorialApp');
	app
		.service('eventManagerService', [
			function () {
				return {
					on: function () { return noop; },
					emit: noop
				};
			}
		])
		.service('contentDataService', [
			function () {
				return {
					getBilingualLanguage: function () { return 'es-US'; }
				}
			}
		])
		.service('zoomService', [
			function () {
				return {
					currentZoom: noop
				}
			}
		])
		.service('themeService', ['constantService',
			function (constantService) {
				var theme = constantService.THEMES.BRUSHED.name;
				return {
					setNextTheme: function () {
						switch (theme) {
							case constantService.THEMES.BRUSHED.name:
								theme = constantService.THEMES.LOW.name;
								break;
							case constantService.THEMES.LOW.name:
								theme = constantService.THEMES.HIGH.name;
								break;
							case constantService.THEMES.HIGH.name:
								theme = constantService.THEMES.BRUSHED.name;
								break;
						}
						sessionStorage.currentTheme = theme;
						console.log('[TS] setNextTheme', theme);
						return theme;
					},
					getCurrentThemeName: function () {
						console.log('[TS] getCurrentThemeName', theme);
						return theme;
					},
					setTheme: function (newTheme) {
						theme = newTheme;
					}
				};
			}
		])
		.controller('TutorialCtrl', ['$scope', '$window', '$timeout', 'constantService', 'tutorialHelperService', 'scratchworkTutorialService', 'themeService',
			function ($scope, $window, $timeout, constantService, tutorialHelperService, scratchworkTutorialService, themeService) {

				var tutorialModuleIndex = currentModule;
				var tutorialModules = getBookMapArray();
				var currentTutorialModule = currentModule;

				$scope.showToolbar = true;
				$scope.isInTransition = false;

				tutorialHelperService.init($scope);
				$scope.tutorial = tutorialHelperService.tutorialObject;

				if (!$window.enaepPlatform) $window.enaepPlatform = {};

				$window.enaepPlatform.initializeScratchwork = function () {
					$window.enaepPlatform.scratchworkManager = $scope.scratchworkManager = scratchworkTutorialService.createScratchworkForTutorial(currentTutorialModule);
				};
				$window.enaepPlatform.disposeScratchwork = function () {
					$window.enaepPlatform.scratchworkManager = $scope.scratchworkManager = scratchworkTutorialService.disposeScratchworkForTutorial();
				};
				(function () {
					var orig = $window.enaepPlatform.changeTheme;
					$window.enaepPlatform.changeTheme = function () {
						orig();
						$timeout(function() {
							$scope.currentTheme = themeService.getCurrentThemeName();
						});
					};
				})();

				$scope.currentTheme = constantService.THEMES.BRUSHED.name;
				if(sessionStorage.currentTheme) {
					$scope.currentTheme = sessionStorage.currentTheme;
					themeService.setTheme(sessionStorage.currentTheme);
				}
				else {
					sessionStorage.currentTheme = $scope.currentTheme;
				}

				$scope.toolbarBackgroundStyle = {};

				$scope.toolbar = getToolbarConfig();

				console.log('toolbar config', $scope.toolbar);

				$scope.currentItem = {
					accessionNumber: '',
					sceneName: '',
					blockTitle: 'Tutorial'
				};

				$scope.translation = Strings;

				$scope.grade = 'GRADE 12';

				$scope.progress = {
					isVisible: true,
					value: 0
				};

				$scope.previous = function () {
					if ($scope.isInTransition) return;
					console.log('[PREVIOUS] isInTransition', $scope.isInTransition);
					$scope.isInTransition = true;
					$scope.tutorial.iconStates.previousButtonIconState.setIconState('unclickable');
					if (gotoPrevTutorialItem) gotoPrevTutorialItem();
				};

				$scope.next = function () {
					if ($scope.isInTransition) return;
					console.log('[NEXT] isInTransition', $scope.isInTransition);
					$scope.isInTransition = true;
					$scope.tutorial.iconStates.nextButtonIconState.setIconState('unclickable');
					if (gotoNextTutorialItem) gotoNextTutorialItem();
				};

				$scope.tutorialToolbarSettings = {
					toolbarClass: 'tutorial-toolbar',
					help: {
						visible: returnTrue,
						tooltip: function() { return $scope.tutorial.iconStates.helpIconState.isIconActive() ? Resources.sa_hideHelp : Resources.sa_showHelp; },
						disabled: function () { return $scope.tutorial.iconStates.helpIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.helpIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.helpIconState.isIconUnclickable(); },
						click: noop
					},
					theme: {
						visible: returnTrue,
						tooltip: function() { return $scope.tutorial.iconStates.themeIconState.isIconDisabled() ? Resources.sa_switchThemeTitleDisabled : Resources.sa_switchThemeTitle; },
						disabled: returnFalse,
						active: function () { return $scope.tutorial.iconStates.themeIconState.isIconActive(); },
						unclickable: returnFalse,
						click: function ($event) { return $scope.tutorial.themeIconClicked(); }
					},
					zoomOut: {
						visible: returnTrue,
						tooltip: function() { return $scope.tutorial.iconStates.zoomOutIconState.isIconDisabled() ? Resources.sa_zoomOutDisabled : Resources.sa_zoomOut; },
						disabled: function () { return $scope.tutorial.iconStates.zoomOutIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.zoomOutIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.zoomOutIconState.isIconUnclickable(); },
						click: noop
					},
					zoomIn: {
						visible: returnTrue,
						tooltip: function () { return $scope.tutorial.iconStates.zoomInIconState.isIconDisabled() ? Resources.sa_zoomInDisabled : Resources.sa_zoomIn; },
						disabled: function () { return $scope.tutorial.iconStates.zoomInIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.zoomInIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.zoomInIconState.isIconUnclickable(); },
						click: noop
					},
					readAloud: {
						visible: returnTrue,
						tooltip: function()
						{
							if($scope.tutorial.iconStates.ttsIconState.isIconActive())
								return Resources.sa_readAloudActive;
							return $scope.tutorial.iconStates.ttsIconState.isIconDisabled() ? Resources.sa_readAloudDisabled : Resources.sa_readAloud;
						},
						disabled: function () { return $scope.tutorial.iconStates.ttsIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.ttsIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.ttsIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.ttsIconClicked(); }
					},
					scratchwork: {
						visible: returnTrue,
						tooltip: function()
						{
							if($scope.tutorial.iconStates.scratchworkIconState.isIconActive())
								return Resources.SCRATCHWORK_ACTIVE;
							return $scope.tutorial.iconStates.scratchworkIconState.isIconDisabled() ? Resources.SCRATCHWORK_DISABLED : Resources.SCRATCHWORK_ENABLED;
						},
						active: function () { return $scope.tutorial.iconStates.scratchworkIconState.isIconActive(); },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkIconState.isIconDisabled(); },
						unclickable: function () { return $scope.tutorial.iconStates.scratchworkIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.scratchworkIconClicked(); }
					},
					scratchworkTools: {
						hidden: function () { return $scope.tutorial.iconStates.scratchworkIconWrapperState.isIconInactive(); },
						active: function () { return $scope.tutorial.iconStates.scratchworkIconState.isIconActive(); },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkIconState.isIconDisabled(); }
					},
					scratchworkPencil: {
						tooltip: function()
						{
							if($scope.tutorial.iconStates.scratchworkDrawIconState.isIconActive())
								return Resources.SCRATCHWORK_DRAW_ACTIVE;
							return $scope.tutorial.iconStates.scratchworkDrawIconState.isIconDisabled() ? Resources.SCRATCHWORK_DRAW_DISABLED : Resources.SCRATCHWORK_DRAW_ENABLED;
						},
						class: function () { return $scope.toolbar.scratchwork.pencil.style; },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkDrawIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.scratchworkDrawIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.scratchworkDrawIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.scratchworkDrawIconClicked(); }
					},
					scratchworkHighlighter: {
						tooltip: function()
						{
							if($scope.tutorial.iconStates.scratchworkHighlightIconState.isIconActive())
								return Resources.SCRATCHWORK_HIGHLIGHT_ACTIVE;
							return $scope.tutorial.iconStates.scratchworkHighlightIconState.isIconDisabled() ? Resources.SCRATCHWORK_HIGHLIGHT_DISABLED : Resources.SCRATCHWORK_HIGHLIGHT_ENABLED;
						},
						class: function () { return $scope.toolbar.scratchwork.highlighter.style; },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkHighlightIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.scratchworkHighlightIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.scratchworkHighlightIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.scratchworkHighlightIconClicked(); }
					},
					scratchworkEraser: {
						tooltip: function()
						{
							if($scope.tutorial.iconStates.scratchworkEraseIconState.isIconActive())
								return Resources.SCRATCHWORK_ERASE_ACTIVE;
							return $scope.tutorial.iconStates.scratchworkEraseIconState.isIconDisabled() ? Resources.SCRATCHWORK_ERASE_DISABLED : Resources.SCRATCHWORK_ERASE_ENABLED;
						},
						class: function () { return $scope.toolbar.scratchwork.eraser.style; },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkEraseIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.scratchworkEraseIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.scratchworkEraseIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.scratchworkEraseIconClicked(); }
					},
					scratchworkClear: {
						tooltip: function()
						{
							if($scope.tutorial.iconStates.scratchworkClearIconState.isIconActive())
								return Resources.SCRATCHWORK_CLEAR_ACTIVE;
							return $scope.tutorial.iconStates.scratchworkClearIconState.isIconDisabled() ? Resources.SCRATCHWORK_CLEAR_DISABLED : Resources.SCRATCHWORK_CLEAR_ENABLED;
						},
						class: function () { return $scope.toolbar.scratchwork.clear.style; },
						disabled: function () { return $scope.tutorial.iconStates.scratchworkClearIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.scratchworkClearIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.scratchworkClearIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.scratchworkClearIconClicked(); }
					},
					bilingual: {
						active: function () { return $scope.tutorial.iconStates.bilingualIconState.isIconActive(); },
						visible: function () { return $scope.toolbar.bilingualToggle.isVisible; },
						tooltip: function () { return $scope.tutorial.iconStates.bilingualIconState.isIconDisabled() ? Resources.BILINGUAL_DISABLED_TOOLTIP : Resources.BILINGUAL_ACTIVE_TOOLTIP; },
						style: function () { return $scope.tutorial.iconStyles.bilingualIconStyle.getCurrentIconStyle(); },
						disabled: function () { return $scope.tutorial.iconStates.bilingualIconState.isIconDisabled(); },
						unclickable: function () { return $scope.tutorial.iconStates.bilingualIconState.isIconUnclickable(); },
						click: noop,
						// Bilingual button needs to be driven off of the tutorial helper because the SWT tutorial needs the
						// capability of changing the state of the button WITHOUT changing the bilingual state
						isSpanish: function ($event) { return true; }
					},
					equationEditor: {
						visible: function () { return $scope.toolbar.equationEditor.isVisible; },
						tooltip: function()
						{
							if($scope.tutorial.iconStates.equationEditorIconState.isIconActive())
								return Resources.EQUATION_EDITOR_ACTIVE;
							return $scope.tutorial.iconStates.equationEditorIconState.isIconDisabled() ? Resources.EQUATION_EDITOR_DISABLED : Resources.EQUATION_EDITOR_ENABLED;
						},
						disabled: function () { return $scope.tutorial.iconStates.equationEditorIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.equationEditorIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.equationEditorIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.equationEditorIconClicked(); }
					},
					calculator: {
						visible: function () { return $scope.toolbar.calculator.isVisible; },
						tooltip: function()
						{
							if($scope.tutorial.iconStates.calculatorIconState.isIconActive())
								return Resources.CALCULATOR_TI30XS_ACTIVE_TOOLTIP;
							return $scope.tutorial.iconStates.calculatorIconState.isIconDisabled() ? Resources.CALCULATOR_TI30XS_DISABLED_TOOLTIP : Resources.CALCULATOR_TI30XS_ENABLED_TOOLTIP;
						},
						disabled: function () { return $scope.tutorial.iconStates.calculatorIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.calculatorIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.calculatorIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.tutorial.calculatorIconClicked(); },
						grade: function () { return $scope.grade; }
					},
					display: {
						accessionNumber: {
							visible: returnTrue,
							text: function () { return $scope.currentItem.accessionNumber; }
						},
						readingSceneId: {
							visible: returnFalse,
							text: function () { return $scope.currentItem.sceneName; }
						},
						sbtSceneId: {
							visible: returnFalse,
							text: function () { return $scope.currentItem.sceneName; },
						},
						blockTitle: {
							visible: returnTrue,
							text: function () { return $scope.currentItem.blockTitle; }
						},
						completionIcon: {
							visible: returnFalse
						}
					},
					timer: {
						visible: returnTrue,
						tooltip: function() { return Resources.sa_timerDisabled; },
						disabled: function () { return $scope.tutorial.iconStates.timerIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.timerIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.timerIconState.isIconUnclickable(); },
						click: noop
					},
					timeLeft: {
						visible: function () { return $scope.tutorial.iconStates.timerIconState.isIconActive(); },
						tooltip: returnEmptyString,
						disabled: function () { return !($scope.tutorial.iconStates.timerIconState.isIconActive()); },
						label: function () { return $scope.translation.sa_timeRemaining; },
						value: function () { return $scope.timeLeftText; },
						click: noop
					},
					progress: {
						visible: function () { return $scope.progress.isVisible; },
						tooltip: function () { return $scope.translation.STUDENT_PROGRESS_MSG; },
						label: function () { return $scope.translation.PROGRESSLABEL; }
					},
					progressIndicator: {
						visible: returnTrue,
						value: function () { return $scope.progress.value + '%'; }
					},
					previous: {
						visible: returnTrue,
						tooltip: function () { return $scope.tutorial.iconStates.previousButtonIconState.isIconDisabled() ? Resources.sa_backDisabled : Resources.sa_back; },
						disabled: function () { return $scope.tutorial.iconStates.previousButtonIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.previousButtonIconState.isIconActive(); },
						unclickable: function () { return $scope.tutorial.iconStates.previousButtonIconState.isIconUnclickable(); },
						click: noop
					},
					next: {
						visible: returnTrue,
						tooltip: function () { return $scope.tutorial.iconStates.nextButtonIconState.isIconDisabled() ? Resources.sa_forwardDisabled : Resources.sa_forward; },
						disabled: function () { return $scope.tutorial.iconStates.nextButtonIconState.isIconDisabled(); },
						active: function () { return $scope.tutorial.iconStates.nextButtonIconState.isIconActive(); },
						unclickable: function () { return !$scope.isInTransition && $scope.tutorial.iconStates.nextButtonIconState.isIconUnclickable(); },
						click: function ($event) { return $scope.next($event); }
					}
				};

				function gotoNextTutorialItem() {
					if (tutorialModuleIndex < tutorialModules.length) {
						currentTutorialModule = tutorialModules[tutorialModuleIndex];
						if(tutorialModuleIndex + 1 < tutorialModules.length) {
							window.location.href = 'https://totw-stage.naepims.org/app/es/main.html?subject=' + subject + '&module=' + (tutorialModuleIndex + 1);
							return;
						}
					// 	$scope.progress.value = (tutorialModuleIndex + 1) / tutorialModules.length * 100;
					// 	$('#tutFrame').attr('src', 'tutorials/' + tutorialModules[tutorialModuleIndex++] + '/index.html');
					// 	$timeout(function () {
					// 		$scope.showToolbar = !/^Summary-/.test(currentTutorialModule);
					// 		$scope.currentItem.accessionNumber = currentTutorialModule;
					// 		$scope.isInTransition = false;

					// 		//reset all the buttons
					// 		resetButtons();
					// 		$scope.tutorial.iconStates.zoomOutIconState.setIconState('unavailable');
					// 	});
					}
				}

				function gotoFirstTutorialItem() {
					if (tutorialModuleIndex < tutorialModules.length) {
						currentTutorialModule = tutorialModules[tutorialModuleIndex];
						// if(tutorialModuleIndex + 1 == tutorialModules.length) {
						// 	window.location.replace('https://enaep-public.naepims.org/2018/Tutorial_Intro_Webpage/index.html');
						// 	return;
						// }
						$scope.progress.value = (tutorialModuleIndex + 1) / (tutorialModules.length - 1) * 100;
						if($scope.progress.value >= 95)
							$scope.progress.value = 95;
						$('#tutFrame').attr('src', 'tutorials/' + tutorialModules[tutorialModuleIndex] + '/index.html');
						$timeout(function () {
							$scope.showToolbar = !/^Summary-/.test(currentTutorialModule);
							$scope.currentItem.accessionNumber = currentTutorialModule;
							$scope.isInTransition = false;

							//reset all the buttons
							resetButtons();
							$scope.tutorial.iconStates.zoomOutIconState.setIconState('unavailable');
						});
					}
				}

				function gotoPrevTutorialItem() {
					if (tutorialModuleIndex > 0) {
						currentTutorialModule = tutorialModules[tutorialModuleIndex - 2];
						$scope.progress.value = (tutorialModuleIndex - 1) / tutorialModules.length * 100;
						$('#tutFrame').attr('src', 'tutorials/' + tutorialModules[tutorialModuleIndex - 2] + '/index.html');
						tutorialModuleIndex--;
						$timeout(function () {
							$scope.showToolbar = !/^Summary-/.test(currentTutorialModule);
							$scope.currentItem.accessionNumber = currentTutorialModule;
							$scope.isInTransition = false;

							//reset all the buttons
							resetButtons();
							$scope.tutorial.iconStates.zoomOutIconState.setIconState('unavailable');
						});
					}
				}

				function resetButtons() {
					resetButton($scope.tutorial.iconStates.themeIconState);
					resetButton($scope.tutorial.iconStates.helpIconState);
					resetButton($scope.tutorial.iconStates.ttsIconState);
					resetButton($scope.tutorial.iconStates.zoomOutIconState);
					resetButton($scope.tutorial.iconStates.zoomInIconState);
					resetButton($scope.tutorial.iconStates.scratchworkIconState);
					resetButton($scope.tutorial.iconStates.scratchworkIconWrapperState);
					resetButton($scope.tutorial.iconStates.scratchworkDrawIconState);
					resetButton($scope.tutorial.iconStates.scratchworkEraseIconState);
					resetButton($scope.tutorial.iconStates.scratchworkHighlightIconState);
					resetButton($scope.tutorial.iconStates.scratchworkClearIconState);
					resetButton($scope.tutorial.iconStates.calculatorIconState);
					resetButton($scope.tutorial.iconStates.bilingualIconState);
					resetButton($scope.tutorial.iconStates.equationEditorIconState);
					resetButton($scope.tutorial.iconStates.timerIconState);
					resetButton($scope.tutorial.iconStates.nextButtonIconState);
					resetButton($scope.tutorial.iconStates.previousButtonIconState);

					scratchworkTutorialService.clear();
				}

				function resetButton(iconState) {
					iconState.setIconState('available');
					iconState.setIconState('inactive');
				}

				function resizeContent() {
					var defaultScale = 1.2213541666666667;
					var scale = Math.min(window.innerWidth / 1152, window.innerHeight / 768);

					var width = 1152 * scale;
					var height = 768 * scale;
					$('#main-container').css('width', width + 'px');
					$('#main-container').css('height', height + 'px');

					if(window.innerWidth > width)
						$('#main-container').css('left', ((window.innerWidth - width) / 2) + 'px');
					if(window.innerHeight > height)
						$('#main-container').css('top', ((window.innerHeight - height) / 2) + 'px');
						
					$('#tutFrame').css('width', 1152 * scale + 'px');
					$('#tutFrame').css('height', (768 * scale) - (48 * scale) + 'px');

					$('enaep-toolbar').css('font-size', (scale / defaultScale) + 'px');
				}

				$(document).ready(function () {
					window.onresize = resizeContent;

					gotoFirstTutorialItem();

					$timeout(resizeContent, 100);

					enaepPlatform.setCurrentTheme($scope.currentTheme);
				});
			}]);

})();