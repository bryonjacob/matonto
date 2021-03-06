/*-
 * #%L
 * com.mobi.web
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 iNovex Information Systems, Inc.
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */
(function() {
    'use strict';

    angular
        /**
         * @ngdoc overview
         * @name sparqlManager
         *
         * @description
         * The `sparqlManager` module only provides the `sparqlManagerService` service which
         * provides access to the Mobi SPARQL query REST endpoint and state variables for
         * the SPARQL Editor
         */
        .module('sparqlManager', [])
        /**
         * @ngdoc service
         * @name sparqlManager.service:sparqlManagerService
         * @requires util.service:utilService
         * @requires httpService.service:httpService
         *
         * @description
         * `sparqlManagerService` is a service that provides access to the Mobi SPARQL query
         * REST endpoint and various state variables for the SPARQL Editor.
         */
        .service('sparqlManagerService', sparqlManagerService);

        sparqlManagerService.$inject = ['$http', '$q', '$httpParamSerializer', 'utilService', 'httpService', 'REST_PREFIX'];

        function sparqlManagerService($http, $q, $httpParamSerializer, utilService, httpService, REST_PREFIX) {
            var prefix = REST_PREFIX + 'sparql';
            var self = this;
            var util = utilService;

            /**
             * @ngdoc property
             * @name prefixes
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string[]}
             *
             * @description
             * The list of selected prefixes for use in the
             * {@link sparqlEditor.directive:sparqlEditor SPARQL editor}.
             */
            self.prefixes = [];
            /**
             * @ngdoc property
             * @name queryString
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string}
             *
             * @description
             * The query string from the {@link sparqlEditor.directive:sparqlEditor SPARQL editor} to
             * be ran against the Mobi repository.
             */
            self.queryString = '';
            /**
             * @ngdoc property
             * @name datasetRecordIRI
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string}
             *
             * @description
             * The IRI of a DatasetRecord in the Mobi repository to perform the query against.
             */
            self.datasetRecordIRI = '';
            /**
             * @ngdoc property
             * @name data
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {Object[]}
             *
             * @description
             * The results from the running the {@link sparqlManager.service:sparqlManagerService#queryString}.
             */
            self.data = undefined;
            /**
             * @ngdoc property
             * @name errorMessage
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string}
             *
             * @description
             * An error message obtained from attempting to run a SPARQL query against the Mobi repository.
             */
            self.errorMessage = '';
            /**
             * @ngdoc property
             * @name errorDetails
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string}
             *
             * @description
             * Details about an error obtained from attempting to run a SPARQL query against the Mobi repository.
             */
            self.errorDetails = '';
            /**
             * @ngdoc property
             * @name infoMessage
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string}
             *
             * @description
             * A generic information message to be used when there is no data.
             */
            self.infoMessage = 'Please submit a query to see results here.';
            /**
             * @ngdoc property
             * @name currentPage
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {number}
             *
             * @description
             * The current page of {@link sparqlManager.service:sparqlManagerService#data results} to be
             * displayed in the {@link sparqlResultTable.directive:sparqlResultTable SPARQL result table}.
             */
            self.currentPage = 0;
            /**
             * @ngdoc property
             * @name links
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {Object}
             *
             * @description
             * The URLs for the next and previous page of results from running the
             * {@link sparqlManager.service:sparqlManagerService#queryString query}.
             */
            self.links = {
                next: '',
                prev: ''
            };
            /**
             * @ngdoc property
             * @name limit
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {number}
             *
             * @description
             * The number of results to return at one time from {@link sparqlManager.service:sparqlManager#queryRdf querying}
             * the repository.
             */
            self.limit = 100;
            /**
             * @ngdoc property
             * @name totalSize
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {number}
             *
             * @description
             * The total number of results from running the {@link sparqlManager.service:sparqlManagerService#queryString query}
             * with {@link sparqlManager.service:sparqlManager#queryRdf queryRdf}.
             */
            self.totalSize = 0;
            /**
             * @ngdoc property
             * @name bindings
             * @propertyOf sparqlManager.service:sparqlManagerService
             * @type {string[]}
             *
             * @description
             * The binding names in the result of running the {@link sparqlManager.service:sparqlManagerService#queryString query}.
             */
            self.bindings = [];

            /**
             * @ngdoc method
             * @name reset
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Resets all state variables.
             */
            self.reset = function() {
                self.prefixes = [];
                self.queryString = '';
                self.datasetRecordIRI = '';
                self.data = undefined;
                self.errorMessage = '';
                self.infoMessage = 'Please submit a query to see results here.';
                self.currentPage = 0;
                self.links = {
                    next: '',
                    prev: ''
                };
                self.totalSize = 0;
                self.bindings = [];
            }

            /**
             * @ngdoc method
             * @name query
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Calls the GET /sparql REST endpoint to conduct a SPARQL query using the provided query
             * and optionally using the provided DatasetRecord IRI to limit the query to a dataset.
             *
             * @param {string} query The SPARQL query string to submit
             * @param {string} datasetRecordIRI The IRI of the DatasetRecord to restrict the query to
             * @param {string} id The identifier for this call
             * @return {Promise} A Promise that resolves to the data from the response or rejects with an
             * error message.
             */
            self.query = function(query, datasetRecordIRI = '', id = '') {
                var config = { params: { query } };
                if (datasetRecordIRI) {
                    config.params.dataset = datasetRecordIRI;
                }
                var promise = id ? httpService.get(prefix, config, id) : $http.get(prefix, config);
                return promise.then(response => response.data, util.rejectError);
            }
            /**
             * @ngdoc method
             * @name pagedQuery
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Calls the GET /sparql/page REST endpoint to conduct a SPARQL query using the provided query and
             * optionally using the provided DatasetRecord IRI and pagination parameters to limit the query to
             * a dataset.
             *
             * @param {string} query The SPARQL query string to submit
             * @param {Object} paramObj The Object which contains all of the params to set
             * @param {string} paramObj.datasetRecordIRI The IRI of the DatasetRecord to restrict the query to
             * @param {string} paramObj.id The identifier for this call
             * @param {number} [paramObj.limit=100] The number of results per page
             * @param {number} [paramObj.page=0] The page of results that you want to retrieve
             * @return {Promise} A Promise that resolves to the data from the response or rejects with an
             * error message.
             */
            self.pagedQuery = function(query, paramObj) {
                var limit = _.get(paramObj, 'limit', 100);
                var config = {
                    params: {
                        query,
                        limit,
                        offset: _.get(paramObj, 'page', 0) * limit
                    }
                };
                if (_.has(paramObj, 'datasetRecordIRI')) {
                    config.params.dataset = paramObj.datasetRecordIRI;
                }
                var url = prefix + '/page';
                var promise = _.has(paramObj, 'id') ? httpService.get(url, config, paramObj.id) : $http.get(url, config);
                return promise.then($q.when, util.rejectError);
            }
            /**
             * @ngdoc method
             * @name downloadResults
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Calls the GET /mobirest/sparql endpoint using the `window.location` variable which
             * will start a download of the results of running the current
             * {@link sparqlManager.service:sparqlManagerService#queryString query} and
             * {@link sparqlManager.service:sparqlManagerService#prefixes prefixes}, optionally using
             * the selected {@link sparqlManager.service:sparqlManagerService#datasetRecordIRI dataset},
             * in the specified file type with an optional file name.
             *
             * @param {string} fileType The type of file to download based on file extension
             * @param {string=''} fileName The optional name of the downloaded file
             */
            self.downloadResults = function(fileType, fileName = '') {
                var paramsObj = {
                    query: getPrefixString() + this.queryString,
                    fileType
                };
                if (fileName) {
                    paramsObj.fileName = fileName;
                }
                if (self.datasetRecordIRI) {
                    paramsObj.dataset = self.datasetRecordIRI;
                }
                util.startDownload(prefix + '?' + $httpParamSerializer(paramsObj));
            }
            /**
             * @ngdoc method
             * @name queryRdf
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Calls the GET /sparql/page REST endpoint to conduct a SPARQL query using the current
             * {@link sparqlManager.service:sparqlManagerService#queryString query} and
             * {@link sparqlManager.service:sparqlManagerService#prefixes prefixes}, optionally using
             * the selected {@link sparqlManager.service:sparqlManagerService#datasetRecordIRI dataset},
             * and sets the results to {@link sparqlManager.service:sparqlManagerService#data data}.
             */
            self.queryRdf = function() {
                self.currentPage = 0;
                self.data = undefined;
                self.errorMessage = '';
                self.errorDetails = '';
                self.infoMessage = '';

                var prefixes = getPrefixString();
                var config = {
                    params: {
                        query: prefixes + self.queryString,
                        limit: self.limit,
                        offset: self.currentPage * self.limit
                    }
                };
                if (self.datasetRecordIRI) {
                    config.params.dataset = self.datasetRecordIRI;
                }
                $http.get(prefix + '/page', config)
                    .then(onSuccess, response => self.errorMessage = getMessage(response));
            }
            /**
             * @ngdoc method
             * @name setResults
             * @methodOf sparqlManager.service:sparqlManagerService
             *
             * @description
             * Sets the results of a SPARQL query to the appropriate state variables using the passed HTTP
             * response containing the results.
             *
             * @param {Object} response A HTTP response object containing paginated SPARQL query results
             */
            self.setResults = function(url) {
                util.getResultsPage(url, response => $q.reject(getMessage(response)))
                    .then(onSuccess, errorMessage => self.errorMessage = errorMessage);
            }

            function onSuccess(response) {
                if (_.get(response, 'data.bindings', []).length) {
                    self.bindings = response.data.bindings;
                    self.data = response.data.data;
                    var headers = response.headers();
                    self.totalSize = _.get(headers, 'x-total-count', 0);
                    var links = util.parseLinks(_.get(headers, 'link', ''));
                    self.links.prev = _.get(links, 'prev', '');
                    self.links.next = _.get(links, 'next', '');
                } else {
                    self.infoMessage = 'There were no results for the submitted query.';
                }
            }
            function getMessage(response) {
                self.errorDetails = _.get(response, 'data.details', '');
                return util.getErrorMessage(response, 'A server error has occurred. Please try again later.');
            }
            function getPrefixString() {
                return self.prefixes.length ? 'PREFIX ' + _.join(self.prefixes, '\nPREFIX ') + '\n\n' : '';
            }
        }
})();
