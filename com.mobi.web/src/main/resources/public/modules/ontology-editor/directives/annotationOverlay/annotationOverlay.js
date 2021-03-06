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
        .module('annotationOverlay', [])
        .directive('annotationOverlay', annotationOverlay);

        annotationOverlay.$inject = ['propertyManagerService', 'ontologyStateService', 'utilService', 'ontologyUtilsManagerService', 'prefixes'];

        function annotationOverlay(propertyManagerService, ontologyStateService, utilService, ontologyUtilsManagerService, prefixes) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'modules/ontology-editor/directives/annotationOverlay/annotationOverlay.html',
                scope: {},
                controllerAs: 'dvm',
                controller: function() {
                    var dvm = this;
                    dvm.ontoUtils = ontologyUtilsManagerService;
                    dvm.pm = propertyManagerService;
                    dvm.os = ontologyStateService;
                    dvm.util = utilService;
                    dvm.prefixes = prefixes;
                    dvm.annotations = _.keys(dvm.os.listItem.annotations.iris);

                    function createJson(value, type, language) {
                        var valueObj = dvm.pm.createValueObj(value, type, language);
                        return dvm.util.createJson(dvm.os.listItem.selected['@id'], dvm.os.annotationSelect, valueObj);
                    }

                    dvm.disableProp = function(annotation) {
                        return annotation === prefixes.owl + 'deprecated' && _.has(dvm.os.listItem.selected, "['" + prefixes.owl + 'deprecated' + "']");
                    }
                    dvm.selectProp = function() {
                        dvm.os.annotationValue = '';
                        if (dvm.os.annotationSelect === prefixes.owl + 'deprecated') {
                            dvm.os.annotationType = prefixes.xsd + 'boolean';
                            dvm.os.annotationLanguage = '';
                        } else {
                            dvm.os.annotationType = undefined;
                            dvm.os.annotationLanguage = 'en';
                        }
                    }
                    dvm.addAnnotation = function() {
                        var added = dvm.pm.addValue(dvm.os.listItem.selected, dvm.os.annotationSelect, dvm.os.annotationValue, dvm.os.annotationType, dvm.os.annotationLanguage);
                        if (added) {
                            dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, createJson(dvm.os.annotationValue, dvm.os.annotationType, dvm.os.annotationLanguage));
                            dvm.ontoUtils.saveCurrentChanges();
                            dvm.ontoUtils.updateLabel();
                        } else {
                            dvm.util.createWarningToast('Duplicate property values not allowed');
                        }
                        dvm.os.showAnnotationOverlay = false;
                    }
                    dvm.editAnnotation = function() {
                        var oldObj = angular.copy(_.get(dvm.os.listItem.selected, "['" + dvm.os.annotationSelect + "']['" + dvm.os.annotationIndex + "']"));
                        var edited = dvm.pm.editValue(dvm.os.listItem.selected, dvm.os.annotationSelect, dvm.os.annotationIndex, dvm.os.annotationValue, dvm.os.annotationType, dvm.os.annotationLanguage);
                        if (edited) {
                            dvm.os.addToDeletions(dvm.os.listItem.ontologyRecord.recordId, createJson(_.get(oldObj, '@value'), _.get(oldObj, '@type'), _.get(oldObj, '@language')));
                            dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, createJson(dvm.os.annotationValue, dvm.os.annotationType, dvm.os.annotationLanguage));
                            dvm.ontoUtils.saveCurrentChanges();
                            dvm.ontoUtils.updateLabel();
                        } else {
                            dvm.util.createWarningToast('Duplicate property values not allowed');
                        }
                        dvm.os.showAnnotationOverlay = false;
                    }
                }
            }
        }
})();
