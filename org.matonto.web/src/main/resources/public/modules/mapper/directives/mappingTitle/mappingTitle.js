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
         * @name mappingTitle
         *
         * @description 
         * The `mappingTitle` module only provides the `mappingTitle` directive 
         * which creates a div containing the name of the current
         * {@link mappingManager.service:mappingManagerService#mapping mapping}
         * and a button to edit the mapping name.
         */
        .module('mappingTitle', [])
        /**
         * @ngdoc directive
         * @name mappingTitle.directive:mappingTitle
         * @scope
         * @restrict E
         * @requires  mappingManager.service:mappingManagerService
         * @requires  mapperState.service:mapperStateService
         *
         * @description 
         * `mappingTitle` is a directive which creates a div with the name of the current 
         * {@link mappingManager.service:mappingManagerService#mapping mapping}. If the current mapping is
         * a brand new mapping, there is also an edit button for changing the mapping name. The directive is 
         * replaced by the contents of its template.
         */
        .directive('mappingTitle', mappingTitle);

        mappingTitle.$inject = ['mappingManagerService', 'mapperStateService'];

        function mappingTitle(mappingManagerService, mapperStateService) {
            return {
                restrict: 'E',
                controllerAs: 'dvm',
                replace: true,
                scope: {},
                controller: function() {
                    var dvm = this;
                    dvm.state = mapperStateService;
                    dvm.mm = mappingManagerService;
                },
                templateUrl: 'modules/mapper/directives/mappingTitle/mappingTitle.html'
            }
        }
})();