
(function () {
    'use strict';

    angular.module('scratchworkModule')
        .service('scratchworkRepositoryService', ['$http', '$q', 'loggerService',
            function ($http, $q, loggerService) {

                function ScratchworkRepositoryException(message) {
                    this.message = message;
                };

                function ScratchworkRepository() {

                    var logger = loggerService.create('SW-R');
                    var BASE_URL = '/api/scratchwork/';


                    function getScratchworkData(url) {
                        logger.setLoggerName('ScratchworkRepository.getScratchworkData')
                            .debug('url: ' + url);

                        var deferred = $q.defer();
                        $http.get(url)
                            .then(
                                function (result) {
                                    if (result.data) {
                                        logger.debug('Data Received --- studentId: ' + result.data.studentId +
                                                        (result.data.blockId ? (', blockId: ' + result.data.blockId) : '') +
                                                        ', itemId: ' + result.data.itemId +
                                                        ', scratchwork size: ' + (result.data.content ? result.data.content.length : 'null'));
                                    }

                                    deferred.resolve(result);
                                },
                                function (result) {
                                    logger.error('Get Scratchwork was unsuccessful. Result: ' + JSON.stringify(result));
                                    deferred.reject(result);
                                }
                            );
                        return deferred.promise;
                    };
                    function saveScratchworkData(url, data) {

                        var deferred = $q.defer();

                        logger.setLoggerName('ScratchworkRepository.saveScratchworkData')
                            .debug('url: ' + url + ', Data --- ' +
                                    'studentId: ' + data.studentId +
                                    (data.blockId ? (', blockId: ' + data.blockId) : '') +
                                    ', itemId: ' + data.itemId +
                                    ', scratchwork size: ' + (data.content ? data.content.length : 'null'));

                        $http.post(url, data)
                            .then(
                                function (result) {
                                    var data;
                                    if (result.data) {
                                        data = result.data;

                                        logger.debug('Saving saveScratchwork was successful. Result: ' +
                                                        ' studentId: ' + data.studentId +
                                                        (data.blockId ? (', blockId: ' + data.blockId) : '') +
                                                        ', itemId: ' + data.itemId +
                                                        ', scratchwork size: ' + (data.content ? data.content.length : 'null'));
                                    }

                                    deferred.resolve(result);
                                },
                                function (result) {
                                    logger.error('Saving saveScratchwork was unsuccessful. Result: ' + JSON.stringify(result));

                                    deferred.reject(result);
                                });

                        return deferred.promise;
                    };


                    function getScratchwork(blockId, itemId, studentId) {
                        var url = BASE_URL + 'GetScratchwork/' + studentId + '/' + blockId + '/' + itemId;
                        return getScratchworkData(url);
                    };
                    function getSharedScratchwork(studentId, accessionNumber) {
                        var url = BASE_URL + 'GetSharedScratchwork/' + studentId + '/' + accessionNumber;
                        return getScratchworkData(url);
                    };
                    function saveScratchwork(item) {

                        var url = BASE_URL + 'SaveScratchwork';
                        var errorMessage = 'Save Scratchwork: Invalid SVG content cannot be saved. Make sure blockId, itemId and studentId are valid values.';

                        var swData = {
                            scratchworkId: !item.scratchworkId ? 0 : item.scratchworkId,
                            blockId: item.blockId,
                            itemId: item.itemId,
                            studentId: item.studentId,
                            content: item.scratchwork
                        };

                        if (!swData.blockId || !swData.itemId || !swData.studentId) {
                            logger.error(errorMessage);
                            throw new ScratchworkRepositoryException(errorMessage);
                            return;
                        }

                        return saveScratchworkData(url, swData);
                    };
                    function saveSharedScratchwork(item) {

                        var url = BASE_URL + 'SaveSharedScratchwork';
                        var errorMessage = 'Save Scratchwork: Invalid SVG content cannot be saved. Make itemId and studentId are valid values.';

                        var swData = {
                            sharedScratchworkId: !item.sharedScratchworkId ? 0 : item.sharedScratchworkId,
                            studentId: item.studentId,
                            itemId: item.itemId,
                            content: item.scratchwork,
                            accessionNumber: item.accessionNumber
                        };

                        if (!swData.itemId || !swData.studentId) {
                            logger.error(errorMessage);
                            throw new ScratchworkRepositoryException(errorMessage);
                            return;
                        }

                        return saveScratchworkData(url, swData);
                    };


                    return {
                        getScratchwork: getScratchwork,
                        saveScratchwork: saveScratchwork,
                        getSharedScratchwork: getSharedScratchwork,
                        saveSharedScratchwork: saveSharedScratchwork
                    };
                };

                return new ScratchworkRepository();
            }]);
}());
