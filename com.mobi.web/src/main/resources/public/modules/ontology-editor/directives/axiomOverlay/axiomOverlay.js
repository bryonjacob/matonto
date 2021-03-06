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
        .module('axiomOverlay', [])
        .directive('axiomOverlay', axiomOverlay);

        axiomOverlay.$inject = ['ontologyStateService', 'utilService', 'ontologyUtilsManagerService', 'prefixes', 'manchesterConverterService', 'ontologyManagerService', 'propertyManagerService', '$filter'];

        function axiomOverlay(ontologyStateService, utilService, ontologyUtilsManagerService, prefixes, manchesterConverterService, ontologyManagerService, propertyManagerService, $filter) {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'modules/ontology-editor/directives/axiomOverlay/axiomOverlay.html',
                scope: {
                    axiomList: '<'
                },
                bindToController: {
                    onSubmit: '&?'
                },
                controllerAs: 'dvm',
                controller: function() {
                    var dvm = this;
                    var mc = manchesterConverterService;
                    var om = ontologyManagerService;
                    var pm = propertyManagerService;
                    dvm.ontoUtils = ontologyUtilsManagerService;
                    dvm.os = ontologyStateService;
                    dvm.util = utilService;
                    dvm.errorMessage = '';
                    dvm.axiom = undefined;
                    dvm.values = [];
                    dvm.expression = '';
                    dvm.tabs = {
                        list: true,
                        editor: false
                    };
                    var localNameMap = createLocalNameMap();
                    dvm.editorOptions = {
                        mode: 'text/omn',
                        indentUnit: 4,
                        lineWrapping: true,
                        matchBrackets: true,
                        readOnly: 'nocursor',
                        noNewlines: true,
                        localNames: _.keys(localNameMap)
                    };

                    dvm.getIRINamespace = function(axiom) {
                        return dvm.util.getIRINamespace(_.get(axiom, 'iri'));
                    }
                    dvm.getIRILocalName = function(axiom) {
                        return dvm.util.getIRILocalName(_.get(axiom, 'iri'));
                    }
                    dvm.addAxiom = function() {
                        var axiom = dvm.axiom.iri;
                        var values;
                        // Collect values depending on current tab
                        if (dvm.tabs.editor) {
                            var result = mc.manchesterToJsonld(dvm.expression, localNameMap, om.isDataTypeProperty(dvm.os.listItem.selected));
                            if (result.errorMessage) {
                                dvm.errorMessage = result.errorMessage;
                                return;
                            } else if (result.jsonld.length === 0) {
                                dvm.errorMessage = 'Expression resulted in no values. Please try again.';
                                return;
                            } else {
                                var bnodeId = result.jsonld[0]['@id'];
                                values = [bnodeId];
                                _.forEach(result.jsonld, obj => {
                                    dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, obj);
                                    dvm.os.addEntity(dvm.os.listItem, obj);
                                });
                                dvm.os.listItem.blankNodes[bnodeId] = dvm.expression;
                            }
                        } else if (dvm.tabs.list) {
                            values = dvm.values;
                        }
                        var addedValues = _.filter(values, value => pm.addId(dvm.os.listItem.selected, axiom, value));
                        if (addedValues.length !== values.length) {
                            dvm.util.createWarningToast('Duplicate property values not allowed');
                        }
                        if (addedValues.length) {
                            if (axiom === prefixes.rdfs + 'range') {
                                dvm.os.updatePropertyIcon(dvm.os.listItem.selected);
                            }
                            var valueObjs = _.map(addedValues, value => ({'@id': value}));
                            dvm.os.addToAdditions(dvm.os.listItem.ontologyRecord.recordId, {'@id': dvm.os.listItem.selected['@id'], [axiom]: valueObjs});
                            dvm.ontoUtils.saveCurrentChanges()
                                .then(() => {
                                    if (dvm.onSubmit) {
                                        var returnValues = [];
                                        if (dvm.tabs.list) {
                                            returnValues = _.intersection(values, addedValues);
                                        }
                                        dvm.onSubmit({axiom: axiom, values: returnValues});
                                    }
                                });
                        }
                        dvm.os.showAxiomOverlay = false;
                    }

                    dvm.getValues = function(searchText) {
                        var valuesKey = _.get(dvm.axiom, 'valuesKey');
                        if (!valuesKey) {
                            dvm.array = [];
                            return;
                        }
                        var array = _.keys(_.has(dvm.os.listItem[valuesKey], 'iris') ? dvm.os.listItem[valuesKey].iris : dvm.os.listItem[valuesKey]);
                        var filtered = $filter('removeIriFromArray')(array, dvm.os.listItem.selected['@id']);
                        dvm.array = dvm.ontoUtils.getSelectList(filtered, searchText, dvm.ontoUtils.getDropDownText);
                    }

                    function createLocalNameMap() {
                        var map = {};
                        _.forEach(dvm.os.listItem.iriList, iri => {
                            map[($filter('splitIRI')(iri)).end] = iri;
                        });
                        return map;
                    }
                }
            }
        }
})();
