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
        .module('iriSelect', [])
        .directive('iriSelect', iriSelect);

        iriSelect.$inject = ['ontologyStateService', 'ontologyUtilsManagerService'];

        function iriSelect(ontologyStateService, ontologyUtilsManagerService) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'modules/ontology-editor/directives/iriSelect/iriSelect.html',
                scope: {
                    displayText: '<',
                    mutedText: '<',
                    isDisabledWhen: '<',
                    isRequiredWhen: '<',
                    multiSelect: '<?',
                    onChange: '&'
                },
                bindToController: {
                    bindModel: '=ngModel',
                    selectList: '<'
                },
                controllerAs: 'dvm',
                controller: ['$scope', function($scope) {
                    var dvm = this;
                    var os = ontologyStateService;
                    $scope.multiSelect = angular.isDefined($scope.multiSelect) ? $scope.multiSelect : true;

                    dvm.ontoUtils = ontologyUtilsManagerService;
                    dvm.values = [];

                    dvm.getOntologyIri = function(iri) {
                        return _.get(dvm.selectList, "['" + iri + "']", os.listItem.ontologyId);
                    }
                    dvm.getValues = function(searchText) {
                        dvm.values = dvm.ontoUtils.getSelectList(_.keys(dvm.selectList), searchText, dvm.ontoUtils.getDropDownText);
                    }
                }]
            }
        }
})();
