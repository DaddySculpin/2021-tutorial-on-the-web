
(function () {
    'use strict';

    angular.module('loggerServiceModule')
        .service('loggerService', ['$log',
            function ($log) {

                function Logger(logName) {
                    /// <summary>
                    /// Logger class
                    /// </summary>
                    /// <param name="logName">Name of the log.</param>
                    /// <returns>This Logger instance</returns>

                    var _logName;
                    var _fnName;
                    var _fnNamePrefix;

                    var namesOfLogTypes = {
                        Log: 'LOG',
                        Info: 'INFO',
                        Warn: 'WARN',
                        Error: 'ERROR',
                        Debug: 'DEBUG'
                    };

                    _logName = !logName ? 'DEFAULT' : logName;

                    function buildLogMessage(logType, message, exception) {
                        /// <summary>
                        /// Builds the log message.
                        /// </summary>
                        /// <param name="logType">Type of the log.</param>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>The built message</returns>

                        var msg = '##(' + _logName + ') ' + logType
                                    + ' [' + (new Date()).toUTCString() + ']'
                                    + ' [' + (!_fnName ? '' : _fnName) + ']'
                                    + (!message ? '' : ' MESSAGE: ' + message)
                                    + (!exception ? '' : ' EXCEPTION: ' + exception);
                        return msg;
                    };

                    function setLoggerName(fnName) {
                        /// <summary>
                        /// Sets the name of the logger.
                        /// </summary>
                        /// <param name="fnName">Name of the function.</param>
                        /// <returns>This Logger instance</returns>

                        _fnName = fnName;
                        return this;
                    };

                    function enteringFn() {
                        /// <summary>
                        /// Entering the function.
                        /// </summary>
                        /// <returns>This Logger instance</returns>

                        $log.info(buildLogMessage(namesOfLogTypes.Info, 'Entering'));

                        //  Reset the logger name to undefined.
                        setLoggerName();

                        return this;
                    };
                    function exitingFn() {
                        /// <summary>
                        /// Exiting the function.
                        /// </summary>
                        /// <returns>This Logger instance</returns>

                        $log.info(buildLogMessage(namesOfLogTypes.Info, 'Exiting'));
                        return this;
                    };

                    function log(message, exception) {
                        /// <summary>
                        /// Logs the specified message.
                        /// </summary>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>This Logger instance</returns>

                        $log.log(buildLogMessage(namesOfLogTypes.Log, message, message));
                        return this;
                    };
                    function info(message, exception) {
                        /// <summary>
                        /// Logs the specified message as Information.
                        /// </summary>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>This Logger instance</returns>

                        $log.info(buildLogMessage(namesOfLogTypes.Info, message, exception));
                        return this;
                    };
                    function warn(message, exception) {
                        /// <summary>
                        /// Logs the specified message as Warning.
                        /// </summary>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>This Logger instance</returns>

                        $log.warn(buildLogMessage(namesOfLogTypes.Warn, message, exception));
                        return this;
                    };
                    function error(message, exception) {
                        /// <summary>
                        /// Logs the specified message as Error.
                        /// </summary>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>This Logger instance</returns>

                        $log.error(buildLogMessage(namesOfLogTypes.Error, message, exception));
                        return this;
                    };
                    function debug(message, exception) {
                        /// <summary>
                        /// Logs the specified message as Debug.
                        /// </summary>
                        /// <param name="message">The message.</param>
                        /// <param name="exception">The exception.</param>
                        /// <returns>This Logger instance</returns>

                        $log.debug(buildLogMessage(namesOfLogTypes.Debug, message, exception));
                        return this;
                    };

                    return {
                        setLoggerName: setLoggerName,

                        enteringFn: enteringFn,
                        exitingFn: exitingFn,

                        log: log,
                        info: info,
                        warn: warn,
                        error: error,
                        debug: debug
                    };
                };

                function create(logName) {
                    /// <summary>
                    /// Creates a new Logger with the specified log name.
                    /// </summary>
                    /// <param name="logName">Name of the log.</param>
                    /// <returns>The newly created Logger instance</returns>
                    var logger = new Logger(logName);

                    return logger;

                };

                return {
                    create: create
                };
            }]);
}());
