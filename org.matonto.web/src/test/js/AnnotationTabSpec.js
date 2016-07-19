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
describe('Annotation Tab directive', function() {
    var $compile,
        scope,
        element,
        stateManagerSvc,
        resObj,
        controller;

    injectBeautifyFilter();
    injectShowAnnotationsFilter();

    beforeEach(function() {
        module('templates');
        module('annotationTab');
        mockStateManager();
        mockResponseObj();

        inject(function(_$compile_, _$rootScope_, _stateManagerService_, _responseObj_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            stateManagerSvc = _stateManagerService_;
            resObj = _responseObj_;
        });
    });

    describe('replaces the element with the correct html', function() {
        beforeEach(function() {
            stateManagerSvc.selected = {
                'prop1': [{'@id': 'value1'}],
                'prop2': [{'@value': 'value2'}]
            };
            stateManagerSvc.ontology = {
                matonto: {
                    annotations: [
                        'prop1'
                    ]
                }
            };
            element = $compile(angular.element('<annotation-tab></annotation-tab>'))(scope);
            scope.$digest();
        });
        it('for a DIV', function() {
            expect(element.prop('tagName')).toBe('DIV');
        });
        it('based on annotation button', function() {
            var icon = element.querySelectorAll('.fa-plus');
            expect(icon.length).toBe(1);
        });
        it('based on listed annotations', function() {
            var formList = element.querySelectorAll('.annotation');
            expect(formList.length).toBe(2);

            stateManagerSvc.selected = undefined;
            scope.$digest();
            formList = element.querySelectorAll('.annotation');
            expect(formList.length).toBe(0);
        });
        it('based on values', function() {
            var values = element.querySelectorAll('.value-container');
            expect(values.length).toBe(2);
        });
        it('based on buttons', function() {
            var editButtons = element.querySelectorAll('[title=Edit]');
            expect(editButtons.length).toBe(1);
            var deleteButtons = element.querySelectorAll('[title=Delete]');
            expect(deleteButtons.length).toBe(2);
        });
    });
    describe('controller methods', function() {
        beforeEach(function() {
            element = $compile(angular.element('<annotation-tab></annotation-tab>'))(scope);
            scope.$digest();
            controller = element.controller('annotationTab');
        });
        it('openAddOverlay sets the correct manager values', function() {
            controller.openAddOverlay();
            expect(stateManagerSvc.editingAnnotation).toBe(false);
            expect(stateManagerSvc.annotationSelect).toEqual(undefined);
            expect(stateManagerSvc.annotationValue).toBe('');
            expect(stateManagerSvc.annotationIndex).toBe(0);
            expect(stateManagerSvc.showAnnotationOverlay).toBe(true);
        });
        it('openRemoveOverlay sets the correct manager values', function() {
            controller.openRemoveOverlay('key', 1);
            expect(stateManagerSvc.key).toBe('key');
            expect(stateManagerSvc.index).toBe(1);
            expect(stateManagerSvc.showRemoveAnnotationOverlay).toBe(true);
        });
        it('editClicked sets the correct manager values', function() {
            var annotation = {localName: 'prop1'};
            stateManagerSvc.selected = {
                'prop1': [{'@value': 'value'}]
            };
            controller.editClicked(annotation, 0);
            expect(stateManagerSvc.editingAnnotation).toBe(true);
            expect(stateManagerSvc.annotationSelect).toEqual(annotation);
            expect(stateManagerSvc.annotationValue).toBe('value');
            expect(stateManagerSvc.annotationIndex).toBe(0);
            expect(stateManagerSvc.showAnnotationOverlay).toBe(true);
        });
    });
});