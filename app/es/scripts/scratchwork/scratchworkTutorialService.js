
(function () {
    'use strict';

    angular.module('scratchworkModule')
        .service('scratchworkTutorialService', ['loggerService',
            function (loggerService) {

                //#region   Constants

                var namesOfSelectors = {
                    scratchPadId: '#scratchPadTutorial',
                    itemContentId: '#tutorial',
                    itemCanvasId: '#scratchPadTutorialItemCanvas',
                    itemFrameId: '#tutorial',
                    scratchPadParentCanvas: '#scratchPadParentCanvas',
                    scratchPadItemCanvas: '#scratchPadItemCanvas'
                };
                var namesOfToolModes = {
                    None: 'none',
                    Draw: 'draw',
                    Highlight: 'highlight',
                    Erase: 'erase',
                    Clear: 'clear'
                };
                var cssStyles = {
                    scratchpad: {
                        active: "scratchPadInEditMode",
                        inactive: "scratchPadInReadOnlyMode"
                    },
                    content: {
                        active: "studentAssessmentContainerInReadOnlyMode",
                        inactive: "studentAssessmentContainerInEditMode"
                    },
                    canvas: {
                        active: "canvasInEditModeForTutorial",
                        inactive: "canvasInReadModeForTutorial"
                    },
                    cursors: {
                        draw: "drawCursor",
                        erase: "eraseCursor",
                        highlight: "highlighterCursor"
                    }
                };
                var canvasDimensions = {
                    width: 1152,
                    height: 720
                };

                var targetDimension = {
                    width: 2160,
                    height: 1350
                };

                var toolConfig = (function () {
                    var draw = {
                        strokeColor: '#990000',
                        strokeWidth: 3,
                        blendMode: 'destination-over'
                    };
                    var highlight = {
                        strokeColor: '#FFFF00',
                        strokeWidth: 36,
                        blendMode: 'xor',
                        opacity: 0.3
                    };
                    var erase = {
                        strokeColor: 'white',
                        strokeWidth: 30,
                        blendMode: 'destination-out'
                    };

                    function get(toolMode) {
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
                        get: get
                    };
                }());

                //#endregion

                var logger = loggerService.create('SW-TUT');
                var scratchworkManager;
                var accessionNumber;

                function resetTutorialCanvas() {

                    logger.setLoggerName('resetTutorialCanvas').enteringFn();

                    angular.element(namesOfSelectors.scratchPadId)
                        .attr('class', '')
                        .css('width', '0')
                        .css('height', '0')
                        .css('z-index', '-1')
                        .hide();
                    angular.element(namesOfSelectors.itemCanvasId)
                        .attr('class', '')
                        .css('width', '0')
                        .css('height', '0')
                        .css('z-index', '-1')
                        .hide();

                    logger.debug('Scratchwork for tutorial canvas has been reset.');

                    logger.setLoggerName('resetTutorialCanvas').exitingFn();
                };

                function ScratchworkForTutorial() {
                    logger.setLoggerName('ScratchworkForTutorial').enteringFn();

                    var currentPaperPath;
                    var paperTool;
                    var itemCanvas;
                    var itemView;
                    var itemProject;
                    var _isActive = false;
                    var _activeMode = null;
                    var _wasDrawingPerformed = false;

                    var isDrag = false;

                    var originalCanvasDimensions = {
                        width: 0,
                        height: 0
                    };

                    var scale = 0.5;
                    var drawScale = scale;
                    var highlightScale = scale;
                    var eraseScale = scale;

                    var _contentInfo = {
                        scratchPadInfo: {
                            contentStyle: cssStyles.scratchpad.inactive
                        },
                        itemCanvasInfo: {
                            contentStyle: cssStyles.canvas.inactive
                        },
                        itemContentInfo: {
                            contentStyle: cssStyles.content.inactive
                        }
                    };

                    function maskAreas(canvas) {
                        // return;

                        function createShape(ShapeCtr, name, coords) {
                            var c = coords.slice();
                            c.unshift(null);
                            var rc = new (Function.prototype.bind.apply(ShapeCtr, c));
                            rc.name = name;
                            return rc;
                        }

                        function getClipAreasByAccnum() {
                            var clipArray = [];
                            var accnum = accessionNumber;
                            accnum = accnum && accnum.toLowerCase();
                            var ratio = Math.min(window.innerWidth / 1152, window.innerHeight / 768);
                            var ScaleValue = function (v) { return v * ratio;};
                            var tabHeight = 80;
                            var captionBannerHeight = 102;
                            switch (true) {
                                case accnum === 'ui-m4':
                                    for (var r = [140, 236], ri = 0; ri < r.length; ri++) {
                                        for (var c = [244, 477, 392, 625], ci = 0; ci < c.length; ci++) {
                                            clipArray.push(createShape(Path.Rectangle, 'R' + ri + 'C' + ci, [ScaleValue(c[ci]), ScaleValue(r[ri]), ScaleValue(32), ScaleValue(32)]));
                                        }
                                    }
                                    clipArray.push(createShape(Path.Rectangle, 'ClearAnswer', [ScaleValue(215), ScaleValue(328), ScaleValue(125), ScaleValue(40)]));
                                    clipArray.push(createShape(Path.Rectangle, 'TextEntry', [ScaleValue(198), ScaleValue(460), ScaleValue(119), ScaleValue(62)]));
                                    break;
                                case accnum === 'ui-m8':
                                    for (var r = [140, 236], ri = 0; ri < r.length; ri++) {
                                        for (var c = [244, 477, 392, 625], ci = 0; ci < c.length; ci++) {
                                            clipArray.push(createShape(Path.Rectangle, 'R' + ri + 'C' + ci, [ScaleValue(c[ci]), ScaleValue(r[ri]), ScaleValue(32), ScaleValue(32)]));
                                        }
                                    }
                                    clipArray.push(createShape(Path.Rectangle, 'ClearAnswer', [ScaleValue(215), ScaleValue(328), ScaleValue(125), ScaleValue(40)]));
                                    clipArray.push(createShape(Path.Rectangle, 'TextEntry', [ScaleValue(198), ScaleValue(560), ScaleValue(119), ScaleValue(62)]));
                                    break;
                                case accnum === 'ui-m12':
                                    for (var r = [140, 236], ri = 0; ri < r.length; ri++) {
                                        for (var c = [244, 477, 392, 625], ci = 0; ci < c.length; ci++) {
                                            clipArray.push(createShape(Path.Rectangle, 'R' + ri + 'C' + ci, [ScaleValue(c[ci]), ScaleValue(r[ri]), ScaleValue(32), ScaleValue(32)]));
                                        }
                                    }
                                    clipArray.push(createShape(Path.Rectangle, 'ClearAnswer', [ScaleValue(215), ScaleValue(328), ScaleValue(125), ScaleValue(40)]));
                                    clipArray.push(createShape(Path.Rectangle, 'TextEntry', [ScaleValue(198), ScaleValue(485), ScaleValue(119), ScaleValue(62)]));
                                    break;
                                case accnum === 'ui-r':
                                    clipArray.push(createShape(Path.Rectangle, 'TopBanner', [0, 0, window.innerWidth, ScaleValue(13)]));
                                    clipArray.push(createShape(Path.Rectangle, 'PageNavigator', [ScaleValue(5), ScaleValue(286), ScaleValue(40), ScaleValue(208)]));
                                    break;
                                case accnum === 'ui-s':
                                    for (var r = [620, 1025], ri = 0; ri < r.length; ri++) {
                                        for (var c = [146, 221, 296, 371], ci = 0; ci < c.length; ci++) {
                                            clipArray.push(createShape(Path.Rectangle, 'R' + ri + 'C' + ci, [ScaleValue(r[ri]), ScaleValue(c[ci]), ScaleValue(32), ScaleValue(32)]));
                                        }
                                    }
                                    clipArray.push(createShape(Path.Rectangle, 'ClearAnswer', [ScaleValue(591), ScaleValue(444), ScaleValue(125), ScaleValue(40)]));
                                    break;
                            }
                            clipArray.push(createShape(Path.Rectangle, 'Top', [0, 0,
                                window.innerWidth, ScaleValue(45)]));  // caption banner
                            clipArray.push(createShape(Path.Rectangle, 'Caption', [0, window.innerHeight - ScaleValue(100),
                                window.innerWidth, ScaleValue(50)]));  // caption banner
                            return clipArray;
                        }

                        if (isSWTMaskApplied) return;
                        if (!canvas) return;
                        var a = getClipAreasByAccnum();
                        if (!a || !a.length) return;

                        var mask = createShape(paper.Path.Rectangle, 'Mask', [0, 0, canvasDimensions.width, canvasDimensions.height]);
                        a.forEach(function(item) {
                            var oldMask = mask;
							try {
								mask = oldMask.exclude(item);
								oldMask.remove();
							} catch (e) {
								mask = oldMask;
							}
                        });
                        mask.clipMask = true;
                        // mask.fillColor = 'red';
                        // mask.opacity = 0.2;
                        // paper.view.update();

                        a.forEach(function(item) {
							try {
								item.remove();
							} catch (e) {}
                        });

                        isSWTMaskApplied = true;

                        //debug
                        //a.forEach((item) => {
                        //    item.fillColor = 'red';
                        //    item.opacity = .5;
                        //});
                        //paper.view.draw();
                    }

                    function initializePaperJSReferences() {

                        logger
                            .setLoggerName('initializePaperJSReferences')
                            .enteringFn()
                            .debug('initializePaperJSReferences() called. Re-establishing references.');

                        itemCanvas = angular.element(namesOfSelectors.itemCanvasId);

                        if (itemCanvas && itemCanvas.length) {
                            itemView = paper.View._viewsById[itemCanvas.get(0).id];
                            itemProject = itemView._project;

                            itemView._project.activate();
                            paperTool.activate();

                            if (itemProject.activeLayer) {
                                itemProject.activeLayer.removeChildren();
                            }

                            isSWTMaskApplied = false;
                        }

                        logger.setLoggerName('initializePaperJSReferences').exitingFn();
                    };
                    function initializePaperJS() {

                        logger.setLoggerName('initializePaperJS').enteringFn();

                        logger.debug('initializePaperJS() called.');

                        paperTool = new paper.Tool();
                        paperTool.id = 'paperToolTutorial';
                        paperTool.on('mousedown', onMouseDown);
                        paperTool.on('mousedrag', onMouseDrag);
                        paperTool.on('mouseup', onMouseUp);

                        initializePaperJSReferences();

                        logger.setLoggerName('initializePaperJS').exitingFn();
                    };
                    function initialize() {

                        logger.setLoggerName('initialize').enteringFn();

                        logger.debug('initialize() called.');

                        initializePaperJS();

                        _contentInfo.scratchPadInfo.contentStyle = cssStyles.scratchpad.inactive;
                        _contentInfo.itemCanvasInfo.contentStyle = cssStyles.canvas.inactive;
                        _contentInfo.itemContentInfo.contentStyle = cssStyles.content.inactive;

                        logger.setLoggerName('initialize').exitingFn();
                    };
                    function dispose() {

                        logger.setLoggerName('dispose').enteringFn();

                        logger.debug('dispose() called.');

                        if (paperTool) {
                            logger.debug('Attempting to cleanup paper tool.');
                            if (paperTool.responds('mousedown')) {
                                paperTool.off('mousedown', onMouseDown);
                                logger.debug('Removed mousedown.');
                            }
                            if (paperTool.responds('mousedrag')) {
                                paperTool.off('mousedown', onMouseDrag);
                                logger.debug('Removed mousedrag.');
                            }
                            if (paperTool.responds('mouseup')) {
                                paperTool.off('mouseup', onMouseUp);
                                logger.debug('Removed mouseup.');
                            }
                        }

                        _contentInfo.scratchPadInfo.contentStyle = cssStyles.scratchpad.inactive;
                        _contentInfo.itemCanvasInfo.contentStyle = cssStyles.canvas.inactive;
                        _contentInfo.itemContentInfo.contentStyle = cssStyles.content.inactive;

                        resetTutorialCanvas();

                        currentPaperPath = null;
                        paperTool = null;
                        itemCanvas = null;
                        itemView = null;
                        itemProject = null;

                        logger.setLoggerName('dispose').exitingFn();
                    };

                    function isDrawableMode() {

                        logger.setLoggerName('isDrawableMode').enteringFn();

                        var returnValue = _isActive === true
                            && (_activeMode === namesOfToolModes.Draw
                                || _activeMode === namesOfToolModes.Highlight
                                || _activeMode === namesOfToolModes.Erase);

                        logger.debug('Is Drawable Mode: ' + returnValue);

                        logger.setLoggerName('isDrawableMode').exitingFn();

                        return returnValue;
                    };

                    function getCanvasProject(canvasId) {

                        var view = paper.View._viewsById[canvasId];

                        if (!view) {
                            return null;
                        }

                        var project = view._project;

                        return project;
                    };
                    function activateCanvasUnderMouse(event) {

                        logger.setLoggerName('activateCanvasUnderMouse').enteringFn();

                        var canvas = event.target.id;
                        var view = paper.View._viewsById[canvas];

                        if (!view) {
                            logger.debug('View is invalid for canvas id: ' + canvas);
                            logger.setLoggerName('activateCanvasUnderMouse').exitingFn();
                            return false;
                        }

                        view._project.activate();

                        logger.setLoggerName('activateCanvasUnderMouse').exitingFn();

                        return true;
                    };
                    function onMouseDown(e) {

                        var cfg;

                        if (isDrawableMode() === false) {
                            return;
                        }

                        isDrag = true;

                        if (activateCanvasUnderMouse(e.event) === false) {
                            return;
                        }

                        cfg = toolConfig.get(_activeMode);

                        currentPaperPath = new paper.Path({
                            strokeColor: cfg.strokeColor,
                            strokeWidth: cfg.strokeWidth * drawScale
                        });
                        if (_activeMode === namesOfToolModes.Highlight) {
                            currentPaperPath.opacity = cfg.opacity;
                            currentPaperPath.strokeWidth = cfg.strokeWidth * highlightScale;
                        }
                        currentPaperPath.blendMode = cfg.blendMode;

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

                        _wasDrawingPerformed = true;

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
                    };

                    function setCanvasDimensions() {

                        var ratio = Math.min(window.innerWidth / 1152, window.innerHeight / 768);

                        var $tutElm = angular.element('#tutFrame');

                        var frameHeight = $tutElm.height();
                        var frameWidth = $tutElm.width();
                        canvasDimensions.width = frameWidth;
                        canvasDimensions.height = frameHeight;
                        var frameLeft = $('#main-container').position().left;
                        var frameTop = 50 * ratio;

                        var $canvasElm = angular.element(namesOfSelectors.itemCanvasId);

                        originalCanvasDimensions.width = $canvasElm.width();
                        originalCanvasDimensions.height = $canvasElm.height();

                        //logger.debug('originalCanvasDimensions --- width: ' + originalCanvasDimensions.width + ' height: ' + originalCanvasDimensions.height);

                        angular.element(namesOfSelectors.itemCanvasId).css('position', 'absolute')
                            .css('width', frameWidth).css('height', frameHeight)
                            .css('left', frameLeft).css('top', frameTop)
                            .attr('width', frameWidth).attr('height', frameHeight);

                        paper.view.viewSize = new paper.Size(frameWidth, frameHeight);

                    };
                    function resetCanvasDimensions() {

                        var $canvasElm = angular.element(namesOfSelectors.itemCanvasId);

                        $canvasElm
                            .css('width', originalCanvasDimensions.width).css('height', originalCanvasDimensions.height)
                            .attr('width', originalCanvasDimensions.width).attr('height', originalCanvasDimensions.height);

                        paper.view.viewSize = new paper.Size(originalCanvasDimensions.width, originalCanvasDimensions.height);
                    };

                    var isSWTMaskApplied = false;

                    function activate() {

                        logger.setLoggerName('activate').enteringFn();

                        logger.debug('Activate called.');

                        _isActive = true;

                        var $canvas = angular.element(namesOfSelectors.itemCanvasId);
                        $canvas.show();

                        setCanvasDimensions();

                        maskAreas($canvas[0]);

                        _contentInfo.scratchPadInfo.contentStyle = cssStyles.scratchpad.active;
                        _contentInfo.itemCanvasInfo.contentStyle = cssStyles.canvas.active;
                        _contentInfo.itemContentInfo.contentStyle = cssStyles.content.active;

                        logger.setLoggerName('activate').exitingFn();
                    };
                    function deactivate() {

                        logger.setLoggerName('deactivate').enteringFn();

                        logger.debug('Deactivate called.');

                        _isActive = false;

                        resetCanvasDimensions();

                        _contentInfo.scratchPadInfo.contentStyle = cssStyles.scratchpad.inactive;
                        _contentInfo.itemCanvasInfo.contentStyle = cssStyles.canvas.inactive;
                        _contentInfo.itemContentInfo.contentStyle = cssStyles.content.inactive;

                        angular.element(namesOfSelectors.itemCanvasId).hide();

                        logger.setLoggerName('deactivate').exitingFn();
                    };

                    function drawEllipse(x, y, width, height) {
                        var ratio = Math.min(window.innerWidth / 1152, window.innerHeight / 768);
                        drawScale = .53;
                        var ScaleValue = function (v) { return v * ratio;};
                        var path = new Path.Ellipse({
                            point: [ScaleValue(x * drawScale), ScaleValue(y * drawScale)],
                            size: [ScaleValue(width * drawScale), ScaleValue(height * drawScale)]
                        });

                        var cfg;

                        logger.setLoggerName('drawEllipse').enteringFn();

                        if (_isActive === true) {

                            logger.debug('drawEllipse called with point: ' + path.point + ', size: ' + path.size);

                            cfg = toolConfig.get(namesOfToolModes.Draw);

                            currentPaperPath = path;
                            currentPaperPath.strokeColor = cfg.strokeColor;
                            currentPaperPath.strokeWidth = cfg.strokeWidth;
                            currentPaperPath.blendMode = cfg.blendMode;

                            itemView.draw();
                        }

                        logger.setLoggerName('drawEllipse').exitingFn();
                    };
                    function drawCircle(x, y, radius) {

                        var pt;
                        var cfg;

                        logger.setLoggerName('drawCircle').enteringFn();

                        if (_isActive === true) {

                            logger.debug('drawCircle called with x: ' + x + ', y: ' + y + ', radius: ' + radius);

                            cfg = toolConfig.get(namesOfToolModes.Draw);
                            pt = new Point(x * drawScale, y * drawScale);

                            currentPaperPath = new Path.Circle(pt, radius * drawScale);
                            currentPaperPath.strokeColor = cfg.strokeColor;
                            currentPaperPath.strokeWidth = cfg.strokeWidth * drawScale;
                            currentPaperPath.blendMode = cfg.blendMode;

                            itemView.draw();
                        }

                        logger.setLoggerName('drawCircle').exitingFn();
                    };
                    function highlight(x, y, width) {

                        var rectangle;
                        var cfg;

                        logger.setLoggerName('highlight').enteringFn();

                        if (_isActive === true) {

                            logger.debug('highlight called with x: ' + x + ', y: ' + y + ', width: ' + width);

                            cfg = toolConfig.get(namesOfToolModes.Highlight);
                            rectangle = new Rectangle(x * highlightScale, y * highlightScale, width * highlightScale, cfg.strokeWidth * highlightScale);

                            currentPaperPath = new Path.Rectangle(rectangle);
                            currentPaperPath.fillColor = cfg.strokeColor;
                            currentPaperPath.blendMode = cfg.blendMode;
                            currentPaperPath.opacity = cfg.opacity;

                            itemView.draw();
                        }

                        logger.setLoggerName('highlight').exitingFn();
                    };
                    function clear() {

                        logger.setLoggerName('clear').enteringFn();

                        if (_isActive === true) {

                            logger.debug('Clear called.');

                            if (itemProject) {
                                if (itemProject.activeLayer) {
                                    itemProject.activeLayer.removeChildren();
                                    itemProject.view.update();
                                } 
                                itemProject.clear();
                                itemProject.remove();
                            }

                            var elm = angular.element(namesOfSelectors.itemCanvasId);

                            if (elm && elm.length) {

                                var id = elm.get(0).id;

                                if (angular.isString(id) && id !== '') {

                                    paper.setup(id);
                                    logger.debug('scratchworkForTutorial - clear - paper.setup(' + id + ') called.');

                                    initializePaperJSReferences();

                                } else {
                                    logger.debug('scratchworkForTutorial - clear - Could not call paper.setup(id) as canvas id is unknown.');
                                }
                            } else {
                                logger.debug('scratchworkForTutorial - clear - Could not call paper.setup(id) as canvas element is unknown.');
                            }
                        }

                        logger.setLoggerName('clear').exitingFn();
                    };

                    function eraseCanvas(x, y, width) {

                        var rectangle;
                        var cfg;

                        logger.setLoggerName('eraseCanvas').enteringFn();

                        if (_isActive === true) {

                            logger.debug('eraseCanvas called with x: ' + x + ', y: ' + y + ', width: ' + width);

                            cfg = toolConfig.get(namesOfToolModes.Erase);
                            rectangle = new Rectangle(x * eraseScale, y * eraseScale, width * eraseScale, cfg.strokeWidth * eraseScale);

                            currentPaperPath = new Path.Rectangle(rectangle);
                            currentPaperPath.fillColor = cfg.strokeColor;
                            currentPaperPath.blendMode = cfg.blendMode;

                            itemView.draw();
                        }

                        logger.setLoggerName('eraseCanvas').exitingFn();
                    };

                    function setMode(mode) {

                        var cursorStyle = '';
                        _activeMode = mode;

                        logger.debug('setMode() called with mode: ' + mode);

                        switch (_activeMode) {
                            case namesOfToolModes.Draw:
                                cursorStyle = cssStyles.cursors.draw;
                                break;

                            case namesOfToolModes.Highlight:
                                cursorStyle = cssStyles.cursors.highlight;
                                break;

                            case namesOfToolModes.Erase:
                                cursorStyle = cssStyles.cursors.erase;
                                break;

                            case namesOfToolModes.None:
                            default:
                                currentPaperPath = null;
                                break;
                        };

                        _contentInfo.scratchPadInfo.contentStyle = cssStyles.scratchpad.active + ' ' + cursorStyle;
                    };
                    function enableDrawMode() {

                        logger.debug('enableDrawMode() called.');

                        setMode(namesOfToolModes.Draw);
                    };
                    function disableDrawMode() {

                        logger.debug('disableDrawMode() called.');

                        setMode(namesOfToolModes.None);
                    };
                    function enableHighlightMode() {

                        logger.debug('enableHighlightMode() called.');

                        setMode(namesOfToolModes.Highlight);
                    };
                    function disableHighlightMode() {

                        logger.debug('disableHighlightMode() called.');

                        setMode(namesOfToolModes.None);
                    };
                    function enableEraseMode() {

                        logger.debug('enableEraseMode() called.');

                        setMode(namesOfToolModes.Erase);
                    };
                    function disableEraseMode() {

                        logger.debug('disableEraseMode() called.');

                        setMode(namesOfToolModes.None);
                    };

                    function wasAnyScratchworkActivityPerformed() {

                        var returnValue = (_wasDrawingPerformed);

                        logger.debug(
                            'wasAnyScratchworkActivityPerformed() called. returnValue: ' + returnValue +
                            '. Drawing path size: ' + ((returnValue && currentPaperPath && currentPaperPath.segments) ? currentPaperPath.segments.length : 0));

                        return returnValue;
                    };


                    initialize();

                    logger.setLoggerName('ScratchworkForTutorial').exitingFn();

                    return {
                        activate: activate,
                        deactivate: deactivate,

                        drawCircle: drawCircle,
                        drawEllipse: drawEllipse,
                        highlight: highlight,
                        clear: clear,
                        eraseCanvas: eraseCanvas,

                        enableDrawMode: enableDrawMode,
                        disableDrawMode: disableDrawMode,
                        enableHighlightMode: enableHighlightMode,
                        disableHighlightMode: disableHighlightMode,
                        enableEraseMode: enableEraseMode,
                        disableEraseMode: disableEraseMode,
                        wasAnyScratchworkActivityPerformed: wasAnyScratchworkActivityPerformed,

                        dispose: dispose,

                        contentInfo: _contentInfo
                    };
                };


                function createScratchworkForTutorial(accNum) {

                    logger.setLoggerName('createScratchworkForTutorial').enteringFn();

                    logger.debug('createScratchworkForTutorial() called.');

                    if (!scratchworkManager) {

                        logger.debug('Creating scratchwork for tutorial.');

                        scratchworkManager = new ScratchworkForTutorial();

                        logger.debug('Scratchwork for tutorial has been created and is available for use.');
                    }
                    accessionNumber = accNum;

                    logger.setLoggerName('createScratchworkForTutorial').exitingFn();

                    return scratchworkManager;
                };
                function disposeScratchworkForTutorial() {

                    logger.setLoggerName('disposeScratchworkForTutorial').enteringFn();

                    logger.debug('disposeScratchworkForTutorial() called.');

                    if (scratchworkManager) {
                        scratchworkManager.dispose();
                        scratchworkManager = null;
                    } else {
                        resetTutorialCanvas();
                    }

                    logger.debug('Scratchwork for tutorial has been disposed and is no longer available.');

                    logger.setLoggerName('disposeScratchworkForTutorial').exitingFn();

                    return null;
                };
                function clear() {

                    logger.setLoggerName('clear').enteringFn();

                    logger.debug('clear() called.');

                    if (scratchworkManager) {
                        scratchworkManager.clear();
                    }

                    logger.debug('Scratchwork for tutorial has been cleared.');

                    logger.setLoggerName('clear').exitingFn();

                    return null;
                };

                return {
                    createScratchworkForTutorial: createScratchworkForTutorial,
                    disposeScratchworkForTutorial: disposeScratchworkForTutorial,
                    clear: clear
                };
            }]);
}());
