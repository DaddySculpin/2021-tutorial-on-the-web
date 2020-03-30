import punchoutConfig from '../../punchouts.js';
import { getRequestArgs } from '../../util.js';

const SELECTORS = {
  scratchPadId: '#scratchPadTutorial',
  itemContentId: '#tutorial',
  itemCanvasId: '#scratchPadTutorialItemCanvas',
  itemFrameId: '#tutFrame',
  scratchPadParentCanvas: '#scratchPadParentCanvas',
  scratchPadItemCanvas: '#scratchPadItemCanvas'
};

const TOOLS = {
  None: 'none',
  Draw: 'draw',
  Highlight: 'highlight',
  Erase: 'erase',
  Clear: 'clear'
};

const STYLES = {
  scratchpad: {
    active: 'scratchPadInEditMode',
    inactive: 'scratchPadInReadOnlyMode'
  },
  content: {
    active: 'studentAssessmentContainerInReadOnlyMode',
    inactive: 'studentAssessmentContainerInEditMode'
  },
  canvas: {
    active: 'canvasInEditModeForTutorial',
    inactive: 'canvasInReadModeForTutorial'
  },
  cursors: {
    draw: 'drawCursor',
    erase: 'eraseCursor',
    highlight: 'highlighterCursor'
  }
};

const CANVAS = {
  width: 2160,
  height: 1350
};

const SOURCE = {
  width: 2160,
  height: 1350
};

function getElementDimensions(el) {
  let width = el.width();
  let height = el.height();
  let { top, left } = el.offset();
  return { left, top, width, height };
}

function resizeCanvas() {
  let iframeEl = angular.element(SELECTORS.itemFrameId);
  let { left, top, width, height } = getElementDimensions(iframeEl);
  angular
    .element(SELECTORS.itemCanvasId)
    .css('position', 'absolute')
    .css('width', width)
    .css('height', height)
    .css('left', left)
    .css('top', top);
}

(function() {
  'use strict';

  angular.module('scratchworkModule').service('scratchworkTutorialService', [
    'loggerService',
    function(loggerService) {
      function canvasRatio() {
        let iframeEl = angular.element('#main-container');
        let { width, height } = getElementDimensions(iframeEl);
        let ratio = Math.min(width / SOURCE.width, height / SOURCE.height);
        return ratio;
      }

      function scaleValue(value) {
        return value * canvasRatio();
      }

      let toolConfig = (function() {
        const configs = {
          draw: {
            strokeColor: '#990000',
            strokeWidth: 3,
            blendMode: 'destination-over'
          },
          highlight: {
            strokeColor: '#FFFF00',
            strokeWidth: 36,
            blendMode: 'xor',
            opacity: 0.3
          },
          erase: {
            strokeColor: 'white',
            strokeWidth: 30,
            blendMode: 'destination-out'
          }
        };

        return {
          get(toolMode) {
            return configs[toolMode];
          }
        };
      })();

      let logger = loggerService.create('SW-TUT');
      let scratchworkManager;
      let accessionNumber;

      function resetTutorialCanvas() {
        logger.setLoggerName('resetTutorialCanvas').enteringFn();

        angular
          .element(SELECTORS.scratchPadId)
          .attr('class', '')
          .css('width', '0')
          .css('height', '0')
          .css('z-index', '-1')
          .hide();
        angular
          .element(SELECTORS.itemCanvasId)
          .attr('class', '')
          .css('width', '0')
          .css('height', '0')
          .css('z-index', '-1')
          .hide();

        logger.debug('Scratchwork for tutorial canvas has been reset.');

        logger.setLoggerName('resetTutorialCanvas').exitingFn();
      }

      function ScratchworkForTutorial() {
        logger.setLoggerName('ScratchworkForTutorial').enteringFn();

        let currentPaperPath;
        let paperTool;
        let itemCanvas;
        let itemView;
        let itemProject;
        let _isActive = false;
        let _activeMode = null;
        let _wasDrawingPerformed = false;

        let isDrag = false;

        let originalCanvasDimensions = {
          width: 0,
          height: 0
        };

        let scale = 0.5;
        let drawScale = scale;
        let highlightScale = scale;
        let eraseScale = scale;

        let _contentInfo = {
          scratchPadInfo: {
            contentStyle: STYLES.scratchpad.inactive
          },
          itemCanvasInfo: {
            contentStyle: STYLES.canvas.inactive
          },
          itemContentInfo: {
            contentStyle: STYLES.content.inactive
          }
        };

        function maskAreas(canvas) {
          function createShape(ShapeCtr, name, coords) {
            let c = coords.slice();
            c.unshift(null);
            let rc = new (Function.prototype.bind.apply(ShapeCtr, c))();
            rc.name = name;
            return rc;
          }

          function getClipAreasByAccnum() {
            const clipArray = [];

            // apply accnum specific
            const punchouts = punchoutConfig[accessionNumber] || [];
            for (const punchout of punchouts) {
              const [x, y, w, h] = punchout.coords;
              clipArray.push(
                createShape(Path.Rectangle, punchout.title, [
                  scaleValue(x),
                  scaleValue(y),
                  scaleValue(w),
                  scaleValue(h)
                ])
              );
            }

            // toolbar
            clipArray.push(
              createShape(Path.Rectangle, 'Top', [
                0,
                0,
                window.innerWidth,
                scaleValue(0)
              ])
            );
            // caption banner
            clipArray.push(
              createShape(Path.Rectangle, 'Caption', [
                0,
                window.innerHeight - scaleValue(194),
                window.innerWidth,
                scaleValue(104)
              ])
            );
            return clipArray;
          }

          if (isSWTMaskApplied) return;
          if (!canvas) return;

          let clipsAreas = getClipAreasByAccnum();
          if (!clipsAreas || !clipsAreas.length) return;

          let mask = createShape(paper.Path.Rectangle, 'Mask', [
            0,
            0,
            CANVAS.width,
            CANVAS.height
          ]);

          let { debug } = getRequestArgs();
          if (debug === 'true') {
            mask.fillColor = 'green';
            mask.opacity = 0.05;
          }

          clipsAreas.forEach(function(item) {
            mask = mask.exclude(item);
          });
          mask.clipMask = true;
          isSWTMaskApplied = true;
        }

        function initializePaperJSReferences() {
          logger
            .setLoggerName('initializePaperJSReferences')
            .enteringFn()
            .debug(
              'initializePaperJSReferences() called. Re-establishing references.'
            );

          itemCanvas = angular.element(SELECTORS.itemCanvasId);

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
        }

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
        }

        function initialize() {
          logger.setLoggerName('initialize').enteringFn();
          logger.debug('initialize() called.');

          initializePaperJS();

          _contentInfo.scratchPadInfo.contentStyle = STYLES.scratchpad.inactive;
          _contentInfo.itemCanvasInfo.contentStyle = STYLES.canvas.inactive;
          _contentInfo.itemContentInfo.contentStyle = STYLES.content.inactive;

          logger.setLoggerName('initialize').exitingFn();
        }

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

          _contentInfo.scratchPadInfo.contentStyle = STYLES.scratchpad.inactive;
          _contentInfo.itemCanvasInfo.contentStyle = STYLES.canvas.inactive;
          _contentInfo.itemContentInfo.contentStyle = STYLES.content.inactive;

          resetTutorialCanvas();

          currentPaperPath = null;
          paperTool = null;
          itemCanvas = null;
          itemView = null;
          itemProject = null;

          logger.setLoggerName('dispose').exitingFn();
        }

        function isDrawableMode() {
          logger.setLoggerName('isDrawableMode').enteringFn();

          let returnValue =
            _isActive === true &&
            (_activeMode === TOOLS.Draw ||
              _activeMode === TOOLS.Highlight ||
              _activeMode === TOOLS.Erase);

          logger.debug('Is Drawable Mode: ' + returnValue);

          logger.setLoggerName('isDrawableMode').exitingFn();

          return returnValue;
        }

        function activateCanvasUnderMouse(event) {
          logger.setLoggerName('activateCanvasUnderMouse').enteringFn();

          let canvas = event.target.id;
          let view = paper.View._viewsById[canvas];

          if (!view) {
            logger.debug('View is invalid for canvas id: ' + canvas);
            logger.setLoggerName('activateCanvasUnderMouse').exitingFn();
            return false;
          }

          view._project.activate();

          logger.setLoggerName('activateCanvasUnderMouse').exitingFn();

          return true;
        }
        function onMouseDown(e) {
          let cfg;

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

          if (_activeMode === TOOLS.Highlight) {
            currentPaperPath.opacity = cfg.opacity;
            currentPaperPath.strokeWidth = cfg.strokeWidth * highlightScale;
          }

          currentPaperPath.blendMode = cfg.blendMode;
          currentPaperPath.add(e.point);
        }
        function onMouseDrag(e) {
          if (isDrag === false) {
            return;
          }

          if (activateCanvasUnderMouse(e.event) === false) {
            return;
          }

          currentPaperPath.add(e.point);

          _wasDrawingPerformed = true;
        }
        function onMouseUp(e) {
          if (isDrag === false) {
            return;
          }

          isDrag = false;

          if (activateCanvasUnderMouse(e.event) === false) {
            return;
          }

          currentPaperPath.add(e.point);
        }

        function setCanvasDimensions() {
          let $tutElm = angular.element('#tutFrame');
          let frameHeight = $tutElm.height();
          let frameWidth = $tutElm.width();

          CANVAS.width = frameWidth;
          CANVAS.height = frameHeight;
          let $canvasElm = angular.element(SELECTORS.itemCanvasId);

          resizeCanvas();

          originalCanvasDimensions.width = $canvasElm.width();
          originalCanvasDimensions.height = $canvasElm.height();
          paper.view.viewSize = new paper.Size(frameWidth, frameHeight);
        }

        function resetCanvasDimensions() {
          let $canvasElm = angular.element(SELECTORS.itemCanvasId);

          $canvasElm
            .css('width', originalCanvasDimensions.width)
            .css('height', originalCanvasDimensions.height)
            .attr('width', originalCanvasDimensions.width)
            .attr('height', originalCanvasDimensions.height);

          paper.view.viewSize = new paper.Size(
            originalCanvasDimensions.width,
            originalCanvasDimensions.height
          );
        }

        let isSWTMaskApplied = false;

        function activate() {
          logger.setLoggerName('activate').enteringFn();
          logger.debug('Activate called.');

          _isActive = true;

          let $canvas = angular.element(SELECTORS.itemCanvasId);
          $canvas.show();

          setCanvasDimensions();
          window.addEventListener('resize', setCanvasDimensions);

          maskAreas($canvas[0]);

          _contentInfo.scratchPadInfo.contentStyle = STYLES.scratchpad.active;
          _contentInfo.itemCanvasInfo.contentStyle = STYLES.canvas.active;
          _contentInfo.itemContentInfo.contentStyle = STYLES.content.active;

          logger.setLoggerName('activate').exitingFn();
        }

        function deactivate() {
          logger.setLoggerName('deactivate').enteringFn();
          logger.debug('Deactivate called.');

          _isActive = false;

          resetCanvasDimensions();

          _contentInfo.scratchPadInfo.contentStyle = STYLES.scratchpad.inactive;
          _contentInfo.itemCanvasInfo.contentStyle = STYLES.canvas.inactive;
          _contentInfo.itemContentInfo.contentStyle = STYLES.content.inactive;

          angular.element(SELECTORS.itemCanvasId).hide();
          logger.setLoggerName('deactivate').exitingFn();
        }

        function drawEllipse(x, y, width, height) {
          drawScale = 0.53;
          let path = new Path.Ellipse({
            point: [scaleValue(x * drawScale), scaleValue(y * drawScale)],
            size: [
              scaleValue(width * drawScale),
              scaleValue(height * drawScale)
            ]
          });

          let cfg;

          logger.setLoggerName('drawEllipse').enteringFn();

          if (_isActive === true) {
            logger.debug(
              'drawEllipse called with point: ' +
                path.point +
                ', size: ' +
                path.size
            );

            cfg = toolConfig.get(TOOLS.Draw);

            currentPaperPath = path;
            currentPaperPath.strokeColor = cfg.strokeColor;
            currentPaperPath.strokeWidth = cfg.strokeWidth;
            currentPaperPath.blendMode = cfg.blendMode;

            itemView.draw();
          }

          logger.setLoggerName('drawEllipse').exitingFn();
        }
        function drawCircle(x, y, radius) {
          let pt;
          let cfg;

          logger.setLoggerName('drawCircle').enteringFn();

          if (_isActive === true) {
            logger.debug(
              'drawCircle called with x: ' +
                x +
                ', y: ' +
                y +
                ', radius: ' +
                radius
            );

            cfg = toolConfig.get(TOOLS.Draw);
            pt = new Point(x * drawScale, y * drawScale);

            currentPaperPath = new Path.Circle(pt, radius * drawScale);
            currentPaperPath.strokeColor = cfg.strokeColor;
            currentPaperPath.strokeWidth = cfg.strokeWidth * drawScale;
            currentPaperPath.blendMode = cfg.blendMode;

            itemView.draw();
          }

          logger.setLoggerName('drawCircle').exitingFn();
        }

        function highlight(x, y, width) {
          let rectangle;
          let cfg;

          logger.setLoggerName('highlight').enteringFn();

          if (_isActive === true) {
            logger.debug(
              'highlight called with x: ' +
                x +
                ', y: ' +
                y +
                ', width: ' +
                width
            );

            cfg = toolConfig.get(TOOLS.Highlight);
            rectangle = new Rectangle(
              x * highlightScale,
              y * highlightScale,
              width * highlightScale,
              cfg.strokeWidth * highlightScale
            );

            currentPaperPath = new Path.Rectangle(rectangle);
            currentPaperPath.fillColor = cfg.strokeColor;
            currentPaperPath.blendMode = cfg.blendMode;
            currentPaperPath.opacity = cfg.opacity;

            itemView.draw();
          }

          logger.setLoggerName('highlight').exitingFn();
        }
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

            let elm = angular.element(SELECTORS.itemCanvasId);

            if (elm && elm.length) {
              let id = elm.get(0).id;

              if (angular.isString(id) && id !== '') {
                paper.setup(id);
                logger.debug(
                  `scratchworkForTutorial - clear - paper.setup(${id}) called.`
                );

                initializePaperJSReferences();
              } else {
                logger.debug(
                  'scratchworkForTutorial - clear - Could not call paper.setup(id) as canvas id is unknown.'
                );
              }
            } else {
              logger.debug(
                'scratchworkForTutorial - clear - Could not call paper.setup(id) as canvas element is unknown.'
              );
            }
          }

          logger.setLoggerName('clear').exitingFn();
        }

        function eraseCanvas(x, y, width) {
          let rectangle;
          let cfg;

          logger.setLoggerName('eraseCanvas').enteringFn();

          if (_isActive === true) {
            logger.debug(
              'eraseCanvas called with x: ' +
                x +
                ', y: ' +
                y +
                ', width: ' +
                width
            );

            cfg = toolConfig.get(TOOLS.Erase);
            rectangle = new Rectangle(
              x * eraseScale,
              y * eraseScale,
              width * eraseScale,
              cfg.strokeWidth * eraseScale
            );

            currentPaperPath = new Path.Rectangle(rectangle);
            currentPaperPath.fillColor = cfg.strokeColor;
            currentPaperPath.blendMode = cfg.blendMode;

            itemView.draw();
          }

          logger.setLoggerName('eraseCanvas').exitingFn();
        }

        function setMode(mode) {
          let cursorStyle = '';
          _activeMode = mode;

          logger.debug('setMode() called with mode: ' + mode);

          switch (_activeMode) {
            case TOOLS.Draw:
              cursorStyle = STYLES.cursors.draw;
              break;

            case TOOLS.Highlight:
              cursorStyle = STYLES.cursors.highlight;
              break;

            case TOOLS.Erase:
              cursorStyle = STYLES.cursors.erase;
              break;

            case TOOLS.None:
            default:
              currentPaperPath = null;
              break;
          }

          _contentInfo.scratchPadInfo.contentStyle =
            STYLES.scratchpad.active + ' ' + cursorStyle;
        }

        function enableDrawMode() {
          logger.debug('enableDrawMode() called.');
          setMode(TOOLS.Draw);
        }

        function disableDrawMode() {
          logger.debug('disableDrawMode() called.');
          setMode(TOOLS.None);
        }

        function enableHighlightMode() {
          logger.debug('enableHighlightMode() called.');
          setMode(TOOLS.Highlight);
        }

        function disableHighlightMode() {
          logger.debug('disableHighlightMode() called.');
          setMode(TOOLS.None);
        }

        function enableEraseMode() {
          logger.debug('enableEraseMode() called.');
          setMode(TOOLS.Erase);
        }

        function disableEraseMode() {
          logger.debug('disableEraseMode() called.');
          setMode(TOOLS.None);
        }

        function wasAnyScratchworkActivityPerformed() {
          let returnValue = _wasDrawingPerformed;
          logger.debug(
            'wasAnyScratchworkActivityPerformed() called. returnValue: ' +
              returnValue +
              '. Drawing path size: ' +
              (returnValue && currentPaperPath && currentPaperPath.segments
                ? currentPaperPath.segments.length
                : 0)
          );

          return returnValue;
        }

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

          contentInfo: _contentInfo,

          setCanvasDimensions: setCanvasDimensions
        };
      }

      function createScratchworkForTutorial(accNum) {
        logger.setLoggerName('createScratchworkForTutorial').enteringFn();
        logger.debug('createScratchworkForTutorial() called.');

        if (!scratchworkManager) {
          logger.debug('Creating scratchwork for tutorial.');
          scratchworkManager = new ScratchworkForTutorial();
          logger.debug(
            'Scratchwork for tutorial has been created and is available for use.'
          );
        }
        accessionNumber = accNum;
        logger.setLoggerName('createScratchworkForTutorial').exitingFn();
        return scratchworkManager;
      }
      function disposeScratchworkForTutorial() {
        logger.setLoggerName('disposeScratchworkForTutorial').enteringFn();
        logger.debug('disposeScratchworkForTutorial() called.');

        if (scratchworkManager) {
          scratchworkManager.dispose();
          scratchworkManager = null;
        } else {
          resetTutorialCanvas();
        }

        logger.debug(
          'Scratchwork for tutorial has been disposed and is no longer available.'
        );
        logger.setLoggerName('disposeScratchworkForTutorial').exitingFn();

        return null;
      }
      function clear() {
        logger.setLoggerName('clear').enteringFn();
        logger.debug('clear() called.');
        if (scratchworkManager) {
          scratchworkManager.clear();
        }
        logger.debug('Scratchwork for tutorial has been cleared.');
        logger.setLoggerName('clear').exitingFn();
        return null;
      }

      return {
        createScratchworkForTutorial: createScratchworkForTutorial,
        disposeScratchworkForTutorial: disposeScratchworkForTutorial,
        clear: clear
      };
    }
  ]);
})();
