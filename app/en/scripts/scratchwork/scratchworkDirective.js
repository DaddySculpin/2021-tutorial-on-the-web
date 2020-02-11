
(function () {

    'use strict';

    angular.module('scratchworkModule')
		.directive('enpScratchwork', ['loggerService',
            function (loggerService) {

                var logger = loggerService.create('SW-D').setLoggerName('enpScratchwork').enteringFn();

                var namesOfElements = {
                    IFrame: 'tutorial1',
                    IFrameScratchpadCanvas: 'scratchPadTutorialItemCanvas1'
                };

                var isPaperJSInstalled = false;
                var isIFramePaperJSInstalled = false;

                function link(scope, element, attrs) {

                    function mouseUp(event) {
                        logger.debug('>>>>> enpScratchwork Directive MouseUp Event occurred for: ' + event.target.id);
                    };
                    function mouseDrag(event) {
                        //logger.debug('>>>>> enpScratchwork Directive MouseDrag Event occurred for: ' + event.target.id);
                    };
                    function mouseDown(event) {
                        logger.debug('>>>>> enpScratchwork Directive MouseDown Event occurred for: ' + event.target.id);
                    };

                    function setupPaperJS() {
                        logger.setLoggerName('setupPaperJS').enteringFn();

                        if (isPaperJSInstalled === false) {
                            paper.install(window);
                            isPaperJSInstalled = true;
                            logger.debug('paper.install(window) called.');
                        }

                        logger.setLoggerName('setupPaperJS').exitingFn();
                    };
                    function setupCanvas() {

                        logger.setLoggerName('setupCanvas').enteringFn();

                        if (isPaperJSInstalled === true) {
                            var id = attrs['id'];
                            if (angular.isString(id) && (id !== namesOfElements.IFrameScratchpadCanvas)) {
                                var $canvas = $('#' + id), ch = $canvas.css('height'), cw = $canvas.css('width');
                                paper.setup(id);
                                $canvas.css('height', ch).css('width', cw);
                                logger.debug('paper.setup(' + id + ')');
                            } else {
                                logger.debug('Could not call paper.setup(id) as canvas id is unknown.');
                            }
                        }

                        logger.setLoggerName('setupCanvas').exitingFn();
                    };

                    function setupIFramePaperJS() {
                        logger.setLoggerName('setupIFramePaperJS').enteringFn();

                        if (isIFramePaperJSInstalled === false) {
                            var stimFrameElement = window.document.getElementById(namesOfElements.IFrame);
                            if (angular.isDefined(stimFrameElement)) {
                                stimFrameElement.contentWindow.paper.install(stimFrameElement.contentWindow);
                                isIFramePaperJSInstalled = true;
                                logger.setLoggerName('setupIFramePaperJS').debug('stimFrameElement.contentWindow.paper.install(stimFrameElement.contentWindow) called.');
                            }
                        }

                        logger.setLoggerName('setupIFramePaperJS').exitingFn();
                    };
                    function setupIFrameCanvas() {
                        logger.setLoggerName('setupIFrameCanvas').enteringFn();

                        if (isIFramePaperJSInstalled === true) {
                            var stimFrameElement = window.document.getElementById(namesOfElements.IFrame);
                            if (angular.isDefined(stimFrameElement)) {
                                var id = attrs['id'];
                                if (angular.isString(id) && id === namesOfElements.IFrameScratchpadCanvas) {
                                    logger.debug('stimFrameElement.contentWindow.paper.setup(' + id + ')');
                                    stimFrameElement.contentWindow.paper.setup(id);
                                }
                            }
                        }

                        logger.setLoggerName('setupIFrameCanvas').exitingFn();
                    };

                    function initialize() {
                        logger.setLoggerName('initialize').enteringFn();

                        if (attrs['id'] === namesOfElements.IFrameScratchpadCanvas) {
                            logger.debug('Initializing PaperJS for eReader IFrame scratchwork.');
                            setupIFramePaperJS();
                            setupIFrameCanvas();
                        } else {
                            logger.debug('Initializing PaperJS for regular scratchwork.');
                            setupPaperJS();
                            setupCanvas();
                        }

                        if (isPaperJSInstalled === true || isIFramePaperJSInstalled === true) {
                            element.on('mousedown', mouseDown).on('mouseup', mouseUp).on('mousemove', mouseDrag)
                                .on('touchstart', mouseDown).on('touchend', mouseUp).on('touchmove', mouseDrag);
                        }

                        logger.setLoggerName('initialize').exitingFn();
                    };

                    initialize();
                };

                logger.setLoggerName('enpScratchwork').exitingFn();

                return {
                    restrict: 'A',
                    link: link
                }

            }]);
}());
