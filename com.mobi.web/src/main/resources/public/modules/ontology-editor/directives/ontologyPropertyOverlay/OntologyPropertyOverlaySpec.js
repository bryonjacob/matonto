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
describe('Ontology Property Overlay directive', function() {
    var $compile, scope, ontologyStateSvc, propertyManagerSvc, ontoUtils, util, ontoUtils, prefixes;

    beforeEach(function() {
        module('templates');
        module('ontologyPropertyOverlay');
        injectRegexConstant();
        injectHighlightFilter();
        injectTrustedFilter();
        mockOntologyState();
        mockPropertyManager();
        mockUtil();
        mockOntologyUtilsManager();
        mockPrefixes();

        inject(function(_$compile_, _$rootScope_, _ontologyStateService_, _propertyManagerService_, _ontologyUtilsManagerService_, _utilService_, _prefixes_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            ontologyStateSvc = _ontologyStateService_;
            propertyManagerSvc = _propertyManagerService_;
            ontoUtils = _ontologyUtilsManagerService_;
            util = _utilService_;
            prefixes = _prefixes_;
        });

        propertyManagerSvc.ontologyProperties = ['ontologyProperty'];
        ontologyStateSvc.listItem.annotations.iris = {annotation: 'ontologyId'};
        this.element = $compile(angular.element('<ontology-property-overlay></ontology-property-overlay>'))(scope);
        scope.$digest();
        this.controller = this.element.controller('ontologyPropertyOverlay');
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        ontoUtils = null;
        propertyManagerSvc = null;
        ontologyStateSvc = null;
        util = null;
        prefixes = null;
        this.element.remove();
    });

    it('initializes with the correct values', function() {
        expect(this.controller.properties).toEqual(['ontologyProperty', 'annotation']);
    });
    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.prop('tagName')).toBe('DIV');
            expect(this.element.hasClass('ontology-property-overlay')).toBe(true);
            expect(this.element.find('form').length).toBe(1);
        });
        it('with a h6', function() {
            expect(this.element.find('h6').length).toBe(1);
        });
        it('depending on whether a property is being edited', function() {
            [
                {
                    value: true,
                    heading: 'Edit Property',
                    button: 'Edit'
                },
                {
                    value: false,
                    heading: 'Add Property',
                    button: 'Add'
                }
            ].forEach(function(test) {
                ontologyStateSvc.editingOntologyProperty = test.value;
                scope.$digest();

                var header = this.element.find('h6');
                expect(header.length).toBe(1);
                expect(header[0].innerHTML).toBe(test.heading);
                var buttons = this.element.querySelectorAll('button.btn-primary');
                expect(buttons.length).toBe(1);
                expect(buttons[0].innerHTML).toBe(test.button);
            }, this);
        });
        it('depending on whether it is owl:deprecated', function() {
            spyOn(this.controller, 'isAnnotationProperty').and.returnValue(true);
            ontologyStateSvc.ontologyProperty = prefixes.owl + 'deprecated';
            scope.$digest();
            expect(this.element.querySelectorAll('.form-group').length).toBe(1);
            expect(this.element.find('text-area').length).toBe(0);
            expect(this.element.find('language-select').length).toBe(0);
            expect(this.element.find('radio-button').length).toBe(2);
        });
        it('depending on whether it is an annotation', function() {
            spyOn(this.controller, 'isAnnotationProperty').and.returnValue(true);
            scope.$digest();
            expect(this.element.querySelectorAll('.form-group').length).toBe(1);
            expect(this.element.find('text-area').length).toBe(1);
            expect(this.element.find('language-select').length).toBe(1);
            expect(this.element.find('radio-button').length).toBe(0);
        });
        it('depending on whether it is an ontology property', function() {
            spyOn(this.controller, 'isOntologyProperty').and.returnValue(true);
            scope.$digest();
            expect(this.element.querySelectorAll('.form-group').length).toBe(2);
            expect(this.element.find('custom-label').length).toBe(2);
            expect(this.element.find('input').length).toBe(1);
            expect(this.element.find('p').length).toBe(1);
            expect(this.element.find('ng-message').length).toBe(2);
        });
        it('with a .btn-container', function() {
            expect(this.element.querySelectorAll('.btn-container').length).toBe(1);
        });
    });
    describe('controller methods', function() {
        describe('isOntologyProperty should return the proper value', function() {
            it('when ontologyStateService.ontologyProperty is falsy', function() {
                ontologyStateSvc.ontologyProperty = '';
                expect(this.controller.isOntologyProperty()).toBe(false);
            });
            describe('when ontologyStateService.ontologyProperty is truthy', function() {
                beforeEach(function() {
                    ontologyStateSvc.ontologyProperty = 'id';
                });
                it('and propertyManagerService.ontologyProperties is empty', function() {
                    propertyManagerSvc.ontologyProperties = [];
                    expect(this.controller.isOntologyProperty()).toBe(false);
                });
                it('and propertyManagerService.ontologyProperties does not contain ontologyProperty', function() {
                    propertyManagerSvc.ontologyProperties = ['other'];
                    expect(this.controller.isOntologyProperty()).toBe(false);
                });
                it('and propertyManagerService.ontologyProperties does contain ontologyProperty', function() {
                    propertyManagerSvc.ontologyProperties = ['id'];
                    expect(this.controller.isOntologyProperty()).toBe(true);
                });
            });
        });
        describe('isAnnotationProperty should return the proper value', function() {
            it('when ontologyStateService.ontologyProperty is falsy', function() {
                ontologyStateSvc.ontologyProperty = '';
                expect(this.controller.isAnnotationProperty()).toBe(false);
            });
            describe('when ontologyStateService.ontologyProperty is truthy', function() {
                beforeEach(function() {
                    ontologyStateSvc.ontologyProperty = 'id';
                });
                it('and ontologyStateService.listItem.annotations.iris is empty', function() {
                    ontologyStateSvc.listItem.annotations.iris = {};
                    expect(this.controller.isAnnotationProperty()).toBe(false);
                });
                it('and ontologyStateService.listItem.annotations.iris does not contain ontologyProperty as a key', function() {
                    ontologyStateSvc.listItem.annotations.iris = {other: 'ontologyId'};
                    expect(this.controller.isAnnotationProperty()).toBe(false);
                });
                it('and ontologyStateService.listItem.annotations.iris does contain ontologyProperty as a key', function() {
                    ontologyStateSvc.listItem.annotations.iris = {id: 'ontologyId'};
                    expect(this.controller.isAnnotationProperty()).toBe(true);
                });
            });
        });
        describe('selectProp sets the correct state if prop is', function() {
            beforeEach(function() {
                ontologyStateSvc.ontologyPropertyValue = 'value';
                ontologyStateSvc.ontologyPropertyType = 'type';
                ontologyStateSvc.ontologyPropertyLanguage = 'language';
            });
            it('owl:deprecated', function() {
                ontologyStateSvc.ontologyProperty = prefixes.owl + 'deprecated';
                this.controller.selectProp();
                expect(ontologyStateSvc.ontologyPropertyValue).toEqual('');
                expect(ontologyStateSvc.ontologyPropertyType).toEqual(prefixes.xsd + 'boolean');
                expect(ontologyStateSvc.ontologyPropertyLanguage).toEqual('');
            });
            it('an annotation or ontology property', function() {
                ontologyStateSvc.ontologyProperty = 'prop';
                this.controller.selectProp();
                expect(ontologyStateSvc.ontologyPropertyValue).toEqual('');
                expect(ontologyStateSvc.ontologyPropertyType).toBeUndefined();
                expect(ontologyStateSvc.ontologyPropertyLanguage).toEqual('en');
            });
        });
        describe('addProperty calls the correct manager functions', function() {
            beforeEach(function() {
                ontologyStateSvc.ontologyProperty = 'prop';
                propertyManagerSvc.addValue.and.returnValue(true);
                propertyManagerSvc.addId.and.returnValue(true);
                spyOn(this.controller, 'isOntologyProperty').and.returnValue(false);
                spyOn(this.controller, 'isAnnotationProperty').and.returnValue(false);
            });
            describe('when isOntologyProperty is true', function() {
                beforeEach(function() {
                    this.controller.isOntologyProperty.and.returnValue(true);
                });
                it('unless it is a duplicate value', function() {
                    propertyManagerSvc.addId.and.returnValue(false);
                    this.controller.addProperty();
                    expect(propertyManagerSvc.addId).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIRI);
                    expect(propertyManagerSvc.addValue).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToAdditions).not.toHaveBeenCalled();
                    expect(ontoUtils.saveCurrentChanges).not.toHaveBeenCalled();
                    expect(util.createWarningToast).toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
                it('successfully', function() {
                    this.controller.addProperty();
                    expect(propertyManagerSvc.addId).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIRI);
                    expect(propertyManagerSvc.addValue).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToAdditions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontoUtils.saveCurrentChanges).toHaveBeenCalled();
                    expect(util.createWarningToast).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
            });
            describe('when isAnnotationProperty is true', function() {
                beforeEach(function() {
                    this.controller.isAnnotationProperty.and.returnValue(true);
                });
                it('unless it is a duplicate value', function() {
                    propertyManagerSvc.addValue.and.returnValue(false);
                    this.controller.addProperty();
                    expect(propertyManagerSvc.addId).not.toHaveBeenCalled();
                    expect(propertyManagerSvc.addValue).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyValue, ontologyStateSvc.ontologyPropertyType, ontologyStateSvc.ontologyPropertyLanguage);
                    expect(ontologyStateSvc.addToAdditions).not.toHaveBeenCalled();
                    expect(ontoUtils.saveCurrentChanges).not.toHaveBeenCalled();
                    expect(util.createWarningToast).toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
                it('successfully', function() {
                    this.controller.addProperty();
                    expect(propertyManagerSvc.addId).not.toHaveBeenCalled();
                    expect(propertyManagerSvc.addValue).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyValue, ontologyStateSvc.ontologyPropertyType, ontologyStateSvc.ontologyPropertyLanguage);
                    expect(ontologyStateSvc.addToAdditions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontoUtils.saveCurrentChanges).toHaveBeenCalled();
                    expect(util.createWarningToast).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
            });
        });
        describe('editProperty calls the correct manager functions', function() {
            beforeEach(function() {
                ontologyStateSvc.ontologyProperty = 'prop';
                propertyManagerSvc.editValue.and.returnValue(true);
                propertyManagerSvc.editId.and.returnValue(true);
                spyOn(this.controller, 'isOntologyProperty').and.returnValue(false);
                spyOn(this.controller, 'isAnnotationProperty').and.returnValue(false);
            });
            describe('when isOntologyProperty is true', function() {
                beforeEach(function() {
                    this.controller.isOntologyProperty.and.returnValue(true);
                });
                it('unless it is a duplicate value', function() {
                    propertyManagerSvc.editId.and.returnValue(false);
                    this.controller.editProperty();
                    expect(propertyManagerSvc.editId).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIndex, ontologyStateSvc.ontologyPropertyIRI);
                    expect(propertyManagerSvc.editValue).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToDeletions).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToAdditions).not.toHaveBeenCalled();
                    expect(ontoUtils.saveCurrentChanges).not.toHaveBeenCalled();
                    expect(util.createWarningToast).toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
                it('successfully', function() {
                    this.controller.editProperty();
                    expect(propertyManagerSvc.editId).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIndex, ontologyStateSvc.ontologyPropertyIRI);
                    expect(propertyManagerSvc.editValue).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToDeletions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontologyStateSvc.addToAdditions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontoUtils.saveCurrentChanges).toHaveBeenCalled();
                    expect(util.createWarningToast).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
            });
            describe('when isAnnotationProperty is true', function() {
                beforeEach(function() {
                    this.controller.isAnnotationProperty.and.returnValue(true);
                });
                it('unless it is a duplicate value', function() {
                    propertyManagerSvc.editValue.and.returnValue(false);
                    this.controller.editProperty();
                    expect(propertyManagerSvc.editId).not.toHaveBeenCalled();
                    expect(propertyManagerSvc.editValue).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIndex, ontologyStateSvc.ontologyPropertyValue, ontologyStateSvc.ontologyPropertyType, ontologyStateSvc.ontologyPropertyLanguage);
                    expect(ontologyStateSvc.addToDeletions).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.addToAdditions).not.toHaveBeenCalled();
                    expect(ontoUtils.saveCurrentChanges).not.toHaveBeenCalled();
                    expect(util.createWarningToast).toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
                it('successfully', function() {
                    this.controller.editProperty();
                    expect(propertyManagerSvc.editId).not.toHaveBeenCalled();
                    expect(propertyManagerSvc.editValue).toHaveBeenCalledWith(ontologyStateSvc.listItem.selected, ontologyStateSvc.ontologyProperty, ontologyStateSvc.ontologyPropertyIndex, ontologyStateSvc.ontologyPropertyValue, ontologyStateSvc.ontologyPropertyType, ontologyStateSvc.ontologyPropertyLanguage);
                    expect(ontologyStateSvc.addToDeletions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontologyStateSvc.addToAdditions).toHaveBeenCalledWith(ontologyStateSvc.listItem.ontologyRecord.recordId, jasmine.any(Object));
                    expect(ontoUtils.saveCurrentChanges).toHaveBeenCalled();
                    expect(util.createWarningToast).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
                });
            });
        });
    });
    it('should call addProperty with the button is clicked', function() {
        spyOn(this.controller, 'addProperty');
        var button = angular.element(this.element.querySelectorAll('.btn-container button.btn-primary')[0]);
        button.triggerHandler('click');
        expect(this.controller.addProperty).toHaveBeenCalled();
    });
    it('should call editProperty with the button is clicked', function() {
        ontologyStateSvc.editingOntologyProperty = true;
        scope.$digest();
        spyOn(this.controller, 'editProperty');
        var button = angular.element(this.element.querySelectorAll('.btn-container button.btn-primary')[0]);
        button.triggerHandler('click');
        expect(this.controller.editProperty).toHaveBeenCalled();
    });
    it('should set the correct state when the cancel button is clicked', function() {
        var button = angular.element(this.element.querySelectorAll('.btn-container button.btn-default')[0]);
        button.triggerHandler('click');
        expect(ontologyStateSvc.showOntologyPropertyOverlay).toBe(false);
    });
});