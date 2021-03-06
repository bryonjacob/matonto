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
        .module('ontologyPropertyOverlay', [])
        .directive('ontologyPropertyOverlay', ontologyPropertyOverlay);

        ontologyPropertyOverlay.$inject = ['ontologyStateService', 'REGEX', 'propertyManagerService', 'utilService', 'ontologyUtilsManagerService', 'prefixes'];

        function ontologyPropertyOverlay(ontologyStateService, REGEX, propertyManagerService, utilService, ontologyUtilsManagerService, prefixes) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'modules/ontology-editor/directives/ontologyPropertyOverlay/ontologyPropertyOverlay.html',
                scope: {},
                controllerAs: 'dvm',
                controller: function() {
                    var dvm = this;
                    var pm = propertyManagerService;
                    dvm.prefixes = prefixes;
                    dvm.ontoUtils = ontologyUtilsManagerService;
                    dvm.os = ontologyStateService;
                    dvm.iriPattern = REGEX.IRI;
                    dvm.util = utilService;
                    dvm.properties = _.union(pm.ontologyProperties, _.keys(dvm.os.listItem.annotations.iris));

                    dvm.isOntologyProperty = function() {
                        return !!dvm.os.ontologyProperty && _.some(pm.ontologyProperties, property => dvm.os.ontologyProperty === property);
                    }
                    dvm.isAnnotationProperty = function() {
                        return !!dvm.os.ontologyProperty && _.has(dvm.os.listItem.annotations.iris, dvm.os.ontologyProperty);
                    }
                    dvm.selectProp = function() {
                        dvm.os.ontologyPropertyValue = '';
                        if (dvm.os.ontologyProperty === prefixes.owl + 'deprecated') {
                            dvm.os.ontologyPropertyType = prefixes.xsd + 'boolean';
                            dvm.os.ontologyPropertyLanguage = '';
                        } else {
                            dvm.os.ontologyPropertyType = undefined;
                            dvm.os.ontologyPropertyLanguage = 'en';
                        }
                    }
                    dvm.addProperty = function() {
                        var value, added = false;
                        if (dvm.isOntologyProperty()) {
                            value = dvm.os.ontologyPropertyIRI;
                            added = pm.addId(dvm.os.listItem.selected, dvm.os.ontologyProperty, dvm.os.ontologyPropertyIRI);
                        } else if (dvm.isAnnotationProperty()) {
                            value = dvm.os.ontologyPropertyValue;
                            added = pm.addValue(dvm.os.listItem.selected, dvm.os.ontologyProperty, dvm.os.ontologyPropertyValue, dvm.os.ontologyPropertyType, dvm.os.ontologyPropertyLanguage);
                        }
                        if (added) {
                            dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, createJson(value, dvm.os.ontologyPropertyType, dvm.os.ontologyPropertyLanguage));
                            dvm.ontoUtils.saveCurrentChanges();
                        } else {
                            dvm.util.createWarningToast('Duplicate property values not allowed');
                        }
                        dvm.os.showOntologyPropertyOverlay = false;
                    }
                    dvm.editProperty = function() {
                        var oldObj = angular.copy(_.get(dvm.os.listItem.selected, "['" + dvm.os.ontologyProperty + "']['" + dvm.os.ontologyPropertyIndex + "']"));
                        var value, edited = false;
                        if (dvm.isOntologyProperty()) {
                            value = dvm.os.ontologyPropertyIRI;
                            edited = pm.editId(dvm.os.listItem.selected, dvm.os.ontologyProperty, dvm.os.ontologyPropertyIndex, value);
                        } else if (dvm.isAnnotationProperty()) {
                            value = dvm.os.ontologyPropertyValue;
                            edited = pm.editValue(dvm.os.listItem.selected, dvm.os.ontologyProperty, dvm.os.ontologyPropertyIndex, value, dvm.os.ontologyPropertyType, dvm.os.ontologyPropertyLanguage);
                        }
                        if (edited) {
                            dvm.os.addToDeletions(dvm.os.listItem.ontologyRecord.recordId, createJson(_.get(oldObj, '@value', _.get(oldObj, '@id')), _.get(oldObj, '@type'), _.get(oldObj, '@language')));
                            dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, createJson(value, dvm.os.ontologyPropertyType, dvm.os.ontologyPropertyLanguage));
                            dvm.ontoUtils.saveCurrentChanges();
                        } else {
                            dvm.util.createWarningToast('Duplicate property values not allowed');
                        }
                        dvm.os.showOntologyPropertyOverlay = false;
                    }
                    dvm.cannotEdit = function() {
                        return dvm.propertyForm.$invalid;
                    }

                    function createJson(value, type, language) {
                        var valueObj = {};
                        if (dvm.isOntologyProperty()) {
                            valueObj = {'@id': value};
                        } else if (dvm.isAnnotationProperty()) {
                            valueObj = pm.createValueObj(value, dvm.os.ontologyPropertyType, language);
                        }
                        return dvm.util.createJson(dvm.os.listItem.selected['@id'], dvm.os.ontologyProperty, valueObj);
                    }
                }
            }
        }
})();
