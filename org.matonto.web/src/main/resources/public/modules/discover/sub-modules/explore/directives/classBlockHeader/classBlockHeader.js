/*-
 * #%L
 * org.matonto.web
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 - 2017 iNovex Information Systems, Inc.
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
         * @name classBlockHeader
         *
         * @description
         * The `classBlockHeader` module only provides the `classBlockHeader` directive which creates
         * the dataset selector to determine what class details are to be shown on the page.
         */
        .module('classBlockHeader', [])
        /**
         * @ngdoc directive
         * @name classBlockHeader.directive:classBlockHeader
         * @scope
         * @restrict E
         * @requires discoverState.service:discoverStateService
         * @requires explore.service:exploreService
         * @requires util.service:utilService
         *
         * @description
         * HTML contents in the class block header which provides a dropdown select to allow users to
         * pick a dataset to determine what class details are to be shown on the page.
         */
        .directive('classBlockHeader', classBlockHeader);
        
        classBlockHeader.$inject = ['discoverStateService', 'exploreService', 'utilService'];

        function classBlockHeader(discoverStateService, exploreService, utilService) {
            return {
                restrict: 'E',
                templateUrl: 'modules/discover/sub-modules/explore/directives/classBlockHeader/classBlockHeader.html',
                replace: true,
                scope: {},
                controllerAs: 'dvm',
                controller: function() {
                    var dvm = this;
                    var es = exploreService;
                    var util = utilService;
                    dvm.ds = discoverStateService;
                    
                    dvm.onSelect = function() {
                        es.getClassDetails(dvm.ds.explore.recordId)
                            .then(details => {
                                dvm.ds.explore.classDetails = details;
                            }, errorMessage => {
                                dvm.ds.explore.classDetails = [];
                                util.createErrorToast(errorMessage);
                            });
                    }
                }
            }
        }
})();