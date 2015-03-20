/**
 * @description Google Earth Api Directive Module for AngularJS
 * @version 0.0.1
 * @author Justin Poehnelt <Justin.Poehnelt@gmail.com
 * @author GitHub contributors
 * @license MIT
 * @year 2015
 */
(function (document, window, angular) {
    'use strict';
    angular.module('googleEarth', [])

        .value('googleEarthApiConfig', {
            version: '1',
            optionalSettings: {
                other_params: "sensor=true"
            }
        })

        .provider('googleJsapiUrl', function () {

            var protocol = 'https:';
            var url = '//www.google.com/jsapi';

            this.setProtocol = function (newProtocol) {
                protocol = newProtocol;
            };

            this.setUrl = function (newUrl) {
                url = newUrl;
            };

            this.$get = function () {
                return (protocol ? protocol : '') + url;
            };
        })
        .factory('googleEarthApiPromise', ['$rootScope', '$q', 'googleEarthApiConfig', 'googleJsapiUrl', function ($rootScope, $q, apiConfig, googleJsapiUrl) {
            var apiReady = $q.defer();
            var onLoad = function () {
                // override callback function
                var settings = {
                    callback: function () {
                        var oldCb = apiConfig.optionalSettings.callback;
                        $rootScope.$apply(function () {
                            apiReady.resolve();
                        });

                        if (angular.isFunction(oldCb)) {
                            oldCb.call(this);
                        }
                    }
                };

                settings = angular.extend({}, apiConfig.optionalSettings, settings);

                window.google.load('earth', apiConfig.version, settings);
            };
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');

            script.setAttribute('type', 'text/javascript');
            script.src = googleJsapiUrl;

            if (script.addEventListener) { // Standard browsers (including IE9+)
                script.addEventListener('load', onLoad, false);
            } else { // IE8 and below
                script.onreadystatechange = function () {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        onLoad();
                    }
                };
            }

            head.appendChild(script);

            return apiReady.promise;
        }]).directive('googleEarth', ['googleEarthApiPromise', function (googleEarthApiPromise) {
            return {
                restrict: 'A',
                scope: {
                    mapId: '@'
                },
                template: '<div class="google-earth-map" id="{{mapId}}"></div>',
                link: function (scope) {
                    var ge = null;

                    function init() {
                        google.earth.createInstance(scope.mapId, initCB, failureCB);
                    }

                    function initCB(instance) {
                        ge = instance;
                        ge.getWindow().setVisibility(true);
                    }

                    function failureCB(errorCode) {
                    }

                    googleEarthApiPromise
                        .then(function () {
                            init();
                        }, function () {

                        });
                }
            };

        }]);

})(document, window, window.angular);