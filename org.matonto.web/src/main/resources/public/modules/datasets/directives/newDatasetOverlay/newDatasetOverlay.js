/*-
 * #%L
 * org.matonto.web
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
         * @name newDatasetOverlay
         *
         * @description
         * The `newDatasetOverlay` module only provides the `newDatasetOverlay` directive which creates
         * an overlay with a form to create a Dataset Record.
         */
        .module('newDatasetOverlay', [])
        /**
         * @ngdoc directive
         * @name newDatasetOverlay.directive:newDatasetOverlay
         * @scope
         * @restrict E
         * @requires datasetManager.service:datasetManagerService
         * @requires datasetState.service:datasetStateService
         * @requires util.service:utilService
         *
         * @description
         * `newDatasetOverlay` is a directive that creates an overlay with a form containing fields for creating
         * a new Dataset Record. These field include the title, repository id, dataset IRI, description, and
         * {@link keywordSelect.directive:keywordSelect keywords}. The repository id is a static field for now.
         * The close functionality of the overlay is controlled by a passed function. The directive is replaced
         * by the contents of its template.
         *
         * @param {Function} onClose The method to be called when closing the overlay
         */
        .directive('newDatasetOverlay', newDatasetOverlay);

        newDatasetOverlay.$inject = ['datasetManagerService', 'datasetStateService', 'utilService'];

        function newDatasetOverlay(datasetManagerService, datasetStateService, utilService) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'modules/datasets/directives/newDatasetOverlay/newDatasetOverlay.html',
                scope: {},
                bindToController: {
                    onClose: '&'
                },
                controllerAs: 'dvm',
                controller: function() {
                    var dvm = this;
                    var state = datasetStateService;
                    var dm = datasetManagerService;
                    var util = utilService;
                    dvm.error = '';
                    dvm.recordConfig = {
                        title: '',
                        repositoryId: 'system',
                        datasetIRI: '',
                        description: ''
                    };
                    dvm.keywords = [];

                    dvm.create = function() {
                        dvm.recordConfig.keywords = _.map(dvm.keywords, _.trim);
                        dm.createDatasetRecord(dvm.recordConfig)
                            .then(() => {
                                util.createSuccessToast('Dataset successfully created');
                                state.setResults();
                                dvm.onClose();
                            }, errorMessage => dvm.error = errorMessage);
                    }
                }
            }
        }
})();