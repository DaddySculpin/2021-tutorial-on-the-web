/*jslint node:true, white:true, devel:true, debug:true, todo:true, nomen:true*/
/*global angular */

(function () {
    'use strict';

    angular.module('sharedServices')
        .factory('languageService', [
            '$log', '$resource', function ($log, $resource) {
                
               var _supportedLanguagesConstants = _makeConstantDictionary({
                    EN: 'en',
                    ES_PR: 'es',
                    EN_US_BILINGUAL: 'en',
                    ES_US_BILINGUAL: 'es',
                    EN_US_DIRECTIONS_ONLY: 'en',
                    ES_US_DIRECTIONS_ONLY: 'es-US'
               });

               var _resourceInfo = {};
                _resourceInfo[_supportedLanguagesConstants.EN] = { path: 'Content/i18nResources/StringResource_en.json', data: null };
                _resourceInfo[_supportedLanguagesConstants.ES_PR] = { path: 'Content/i18nResources/StringResource_es.json', data: null };
                _resourceInfo[_supportedLanguagesConstants.EN_US] = { path: 'Content/i18nResources/StringResource_en.json', data: null };
                _resourceInfo[_supportedLanguagesConstants.ES_US] = { path: 'Content/i18nResources/StringResource_es.json', data: null };
                _resourceInfo[_supportedLanguagesConstants.EN_US_DIRECTIONS_ONLY] = { path: 'Content/i18nResources/StringResource_en.json', data: null };
                _resourceInfo[_supportedLanguagesConstants.ES_US_DIRECTIONS_ONLY] = { path: 'Content/i18nResources/DirectionStringResource_es.json', data: null };

                var _languageData = {};

                var _currentLanguage = _supportedLanguagesConstants.EN;

                return {
                    setLanguage: _setLanguage,
                    getLanguageData: _getLanguageData,
                    getDataForAdminInterfaceDialog : _getDataForAdminInterfaceDialog,
                    SUPPORTED_LANGUAGES: _supportedLanguagesConstants,
                    getResourceByLanguage: _getResourceByLanguage
                };

                function _loadLanguageData(language) {
                    var resInfo = _resourceInfo[language];
                    var filePath = angular.isUndefined(resInfo) || resInfo === null ? null : resInfo.path;
                    if (filePath === null) {
                        throw new RangeError('Language resource file path is not defined: ' + language);
                    }
                    return $resource(filePath).get();
                }

                function isLanguageDataEmpty() {
                    // why 4 ? angular adds $promise, $resolved, $cancelRequest immediately to $resource calls
                    // we have many more than 4 keys in the returned language data, so this is safe.
                    if (Object.keys(_languageData).length < 4 ) {
                        return true;
                    }
                    return false;
                }

                function _setLanguage(lang) {

                    if (_currentLanguage !== lang || isLanguageDataEmpty()) {
                        _currentLanguage = lang || _supportedLanguagesConstants.EN;

                        var langResource = _resourceInfo[lang] || null;

                        if (langResource === null) {
                            throw new RangeError('Unrecognized language code: ' + lang);
                        }

                        var data = langResource.data || null;

                        if (data !== null) {
                            angular.copy(data, _languageData);
                        } else {
                            data = langResource.data = _loadLanguageData(lang);
                            if (data === null) {
                                throw new Error('An error has occurred while trying to load resource file: ' + lang + ', ' + langResource.filePath);
                            }
                            data.$promise.then(
                                function(res) {
                                    angular.copy(res, _languageData);
                                },
                                function(err) {
                                    $log.warn('Failed to load language resource file: ' + lang + ', ' + langResource.filePath);
                                });
                        }
                    }
                }

                function _getDataForAdminInterfaceDialog() {
                    var lang = localStorage.getItem('adminLanguage');
                    if (lang === null) {
                        throw new Error('An error has occurred while trying to load the adminLanguage from the local storage');
                    }
                    //else just load the set of admin language string from resource for the admin diaplog on student inteface
                    var langResource = _resourceInfo[lang] || null;
                    if (langResource === null) {
                        throw new RangeError('Unrecognized language code: ' + lang);
                    }
                    var data = langResource.data || null;
                    if (data !== null) {
                        return data;
                    } else {
                        data = langResource.data = _loadLanguageData(lang);
                        if (data === null) {
                            throw new Error('An error has occurred while trying to load resource file: ' + lang + ', ' + langResource.filePath);
                        }
                        data.$promise.then(
                            function (res) {
                                return res;
                            },
                            function (err) {
                                $log.warn('Failed to load language resource file: ' + lang + ', ' + langResource.filePath);
                            });
                        return data;
                    }
                }

                //#region Utility functions
                function _makeConstantDictionary(obj, recursive) {
                    var rc = {};
                    for (var lang in obj) {
                        if (!recursive && !obj.hasOwnProperty(lang)) {
                            continue;
                        }
                        Object.defineProperty(rc, lang, {
                            configurable: false,
                            enumerable: true,
                            value: obj[lang],
                            writable: false
                        });
                    }
                    return rc;
                }
                //#endregion

                function _getLanguageData() {

                    if (isLanguageDataEmpty()) {
                        _setLanguage(_supportedLanguagesConstants.EN);
                    }
                    return _languageData;
                }

                function _getResourceByLanguage(lang) {
                    if (!!!lang)
                        lang = _supportedLanguagesConstants.EN;
                    var langResource = _resourceInfo[lang];
                    var data = _loadLanguageData(lang);

                    if (data === null) {
                        throw new Error('An error has occurred while trying to load resource file: ' + lang + ', ' + langResource.path);
                    }
                    data.$promise.then(
                        function (res) {
                            return res;
                        },
                        function (err) {
                            $log.warn('Failed to load language resource file: ' + lang + ', ' + langResource.filePath);
                        });
                    return data;
                }
            }
        ]);
}());
