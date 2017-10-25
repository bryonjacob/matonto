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
describe('Open Ontology Tab directive', function() {
    var $compile, scope, $q, ontologyStateSvc, ontologyManagerSvc, stateManagerSvc, prefixes, util, mapperStateSvc;

    beforeEach(function() {
        module('templates');
        module('openOntologyTab');
        injectHighlightFilter();
        injectTrustedFilter();
        mockOntologyManager();
        mockOntologyState();
        mockPrefixes();
        mockStateManager();
        mockUtil();
        mockMapperState();

        inject(function(_$compile_, _$rootScope_, _$q_, _ontologyStateService_, _ontologyManagerService_, _stateManagerService_, _prefixes_, _utilService_, _mapperStateService_) {
            $q = _$q_;
            $compile = _$compile_;
            scope = _$rootScope_;
            ontologyStateSvc = _ontologyStateService_;
            ontologyManagerSvc = _ontologyManagerService_;
            stateManagerSvc = _stateManagerService_;
            prefixes = _prefixes_;
            util = _utilService_;
            mapperStateSvc = _mapperStateService_;
        });

        this.records = [{'@id': 'recordA'}, {'@id': 'recordB'}];
        this.records[0][prefixes.dcterms + 'identifier'] = [{'@value': 'A'}];
        this.records[1][prefixes.dcterms + 'identifier'] = [{'@value': 'B'}];
        ontologyManagerSvc.getAllOntologyRecords.and.returnValue($q.when(this.records));
        util.getDctermsValue.and.returnValue('A');
        this.element = $compile(angular.element('<open-ontology-tab></open-ontology-tab>'))(scope);
        scope.$digest();
        this.controller = this.element.controller('openOntologyTab');
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        $q = null;
        ontologyStateSvc = null;
        ontologyManagerSvc = null;
        stateManagerSvc = null;
        prefixes = null;
        utilSvc = null;
        mapperStateSvc = null;
        this.element.remove();
    });

    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.prop('tagName')).toBe('DIV');
            expect(this.element.hasClass('open-ontology-tab')).toBe(true);
            expect(this.element.querySelectorAll('.actions').length).toBe(1);
            expect(this.element.querySelectorAll('.list').length).toBe(1);
            expect(this.element.querySelectorAll('.open-ontology-content').length).toBe(1);
            expect(this.element.querySelectorAll('.ontologies').length).toBe(1);
            expect(this.element.querySelectorAll('.paging-container').length).toBe(1);
        });
        _.forEach(['block', 'block-content', 'form', 'block-footer', 'pagination'], function(item) {
            it('with a ' + item, function() {
                expect(this.element.find(item).length).toBe(1);
            });
        });
        it('with custom buttons to upload an ontology and make a new ontology', function() {
            var buttons = this.element.querySelectorAll('.actions button');
            expect(buttons.length).toBe(2);
            expect(['Upload Ontology', 'New Ontology'].indexOf(angular.element(buttons[0]).text().trim()) >= 0).toBe(true);
            expect(['Upload Ontology', 'New Ontology'].indexOf(angular.element(buttons[1]).text().trim()) >= 0).toBe(true);
        });
        it('depending on whether an ontology is being deleted', function() {
            expect(this.element.querySelectorAll('confirmation-overlay[header-text="\'Delete Ontology\'"]').length).toBe(0);

            this.controller.showDeleteConfirmation = true;
            scope.$digest();
            expect(this.element.querySelectorAll('confirmation-overlay[header-text="\'Delete Ontology\'"]').length).toBe(1);
        });
        it('depending on whether an ontology is being opened', function() {
            expect(this.element.querySelectorAll('confirmation-overlay[header-text="\'Open\'"]').length).toBe(0);

            this.controller.showOpenOverlay = true;
            scope.$digest();
            expect(this.element.querySelectorAll('confirmation-overlay[header-text="\'Open\'"]').length).toBe(1);
        });
        it('depending on whether there is an error deleting an ontology', function() {
            this.controller.showDeleteConfirmation = true;
            scope.$digest();
            expect(this.element.find('error-display').length).toBe(0);
            this.controller.errorMessage = 'Error';
            scope.$digest();
            expect(this.element.find('error-display').length).toBe(1);
        });
        it('depending on what type of ontology is being opened', function() {
            this.controller.showOpenOverlay = true;
            this.controller.type = 'ontology';
            scope.$digest();
            var typeBtns = this.element.querySelectorAll('confirmation-overlay .type');
            expect(angular.element(typeBtns[0]).hasClass('active')).toBe(true);
            expect(angular.element(typeBtns[1]).hasClass('active')).toBe(false);

            this.controller.type = 'vocabulary';
            scope.$digest();
            expect(angular.element(typeBtns[0]).hasClass('active')).toBe(false);
            expect(angular.element(typeBtns[1]).hasClass('active')).toBe(true);
        });
        it('depending on how many unopened ontologies there are, the limit, and the offset', function() {
            this.controller.filteredList = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
            this.controller.limit = 10;
            this.controller.begin = 0;
            scope.$digest();
            expect(this.element.querySelectorAll('.ontologies .ontology').length).toBe(10);
            expect(this.element.querySelectorAll('.ontologies info-message').length).toBe(0);

            this.controller.begin = 10;
            scope.$digest();
            expect(this.element.querySelectorAll('.ontologies .ontology').length).toBe(1);
            expect(this.element.querySelectorAll('.ontologies info-message').length).toBe(0);
        });
        it('depending on if the ontology being deleted is currently being used in the mapping tool', function() {
            this.controller.showDeleteConfirmation = true;
            scope.$digest();
            expect(this.element.find('error-display').length).toBe(0);
            this.controller.mappingErrorMessage = 'Error';
            scope.$digest();
            expect(this.element.find('error-display').length).toBe(1);
        });
    });
    describe('controller methods', function() {
        describe('should open an ontology', function() {
            it('unless an error occurs', function() {
                ontologyStateSvc.openOntology.and.returnValue($q.reject('Error message'));
                this.controller.open();
                scope.$apply();
                expect(ontologyStateSvc.openOntology).toHaveBeenCalledWith(this.controller.recordId, this.controller.recordTitle, this.controller.type);
                expect(this.controller.errorMessage).toBe('Error message');
            });
            it('successfully', function() {
                var ontologyId = 'ontologyId';
                ontologyStateSvc.openOntology.and.returnValue($q.resolve(ontologyId));
                this.controller.open();
                scope.$apply();
                expect(ontologyStateSvc.openOntology).toHaveBeenCalledWith(this.controller.recordId, this.controller.recordTitle, this.controller.type);
                expect(this.controller.errorMessage).toBeUndefined();
            });
        });
        it('should get a page of results', function() {
            var begin = this.controller.begin;
            this.controller.getPage('next');
            expect(this.controller.begin).toBe(begin + this.controller.limit);

            begin = this.controller.begin;
            this.controller.getPage('prev');
            expect(this.controller.begin).toBe(begin - this.controller.limit);
        });
        describe('should show the delete confirmation overlay', function() {
            beforeEach(function() {
                util.getDctermsValue.and.returnValue('title');
            });
            it('and ask the user for confirmation', function() {
                this.controller.showDeleteConfirmationOverlay({'@id': 'record'});
                expect(this.controller.recordId).toBe('record');
                expect(this.controller.recordTitle).toBe('title');
                expect(this.controller.errorMessage).toBe('');
                expect(this.controller.showDeleteConfirmation).toBe(true);
            });
            it('and should warn the user if the ontology is open in the mapping tool', function() {
                mapperStateSvc.sourceOntologies = [{'recordId':'record'}];

                this.controller.showDeleteConfirmationOverlay({'@id': 'record'});

                expect(this.controller.recordId).toBe('record');
                expect(this.controller.recordTitle).toBe('title');
                expect(this.controller.errorMessage).toBe('');
                expect(this.controller.mappingErrorMessage).not.toBeUndefined();
                expect(this.controller.showDeleteConfirmation).toBe(true);
            });
        });
        describe('should delete an ontology', function() {
            beforeEach(function() {
                this.controller.showDeleteConfirmation = true;
                this.controller.recordId = 'recordA';
                stateManagerSvc.getOntologyStateByRecordId.and.returnValue({id: 'state'});
            });
            it('unless an error occurs', function() {
                ontologyManagerSvc.deleteOntology.and.returnValue($q.reject('Error message'));
                this.controller.deleteOntology();
                scope.$apply();
                expect(ontologyManagerSvc.deleteOntology).toHaveBeenCalledWith(this.controller.recordId);
                expect(this.records).toContain(jasmine.objectContaining({'@id': 'recordA'}));
                expect(stateManagerSvc.getOntologyStateByRecordId).not.toHaveBeenCalled();
                expect(stateManagerSvc.deleteState).not.toHaveBeenCalled();
                expect(this.controller.showDeleteConfirmation).toBe(true);
                expect(this.controller.errorMessage).toBe('Error message');
                expect(this.controller.mappingErrorMessage).toBeUndefined();
            });
            it('successfully', function() {
                this.controller.deleteOntology();
                scope.$apply();
                expect(ontologyManagerSvc.deleteOntology).toHaveBeenCalledWith(this.controller.recordId);
                expect(this.records).not.toContain(jasmine.objectContaining({'@id': 'recordA'}));
                expect(stateManagerSvc.getOntologyStateByRecordId).toHaveBeenCalled();
                expect(stateManagerSvc.deleteState).toHaveBeenCalledWith('state');
                expect(this.controller.showDeleteConfirmation).toBe(false);
                expect(this.controller.errorMessage).toBeUndefined();
                expect(this.controller.mappingErrorMessage).toBeUndefined();
            });
        });
        it('should get the list of unopened ontology records', function() {
            ontologyStateSvc.list = [{ontologyRecord: {'recordId': 'recordA'}}];
            this.controller.getAllOntologyRecords('sort');
            scope.$apply();
            expect(ontologyManagerSvc.getAllOntologyRecords).toHaveBeenCalledWith('sort');
            expect(this.controller.filteredList).not.toContain(jasmine.objectContaining({'@id': 'recordA'}));
        });
    });
    it('should filter the ontology list when the filter text changes', function() {
        util.getDctermsValue.and.callFake(function(obj, filter) {
            return obj['@id'] === 'recordA' ? 'test' : '';
        });
        this.controller.filterText = 'test';
        scope.$apply();
        expect(this.controller.filterText).not.toContain(jasmine.objectContaining({'@id': 'recordB'}));
    });
    it('should set the correct state when the new ontology button is clicked', function() {
        var button = angular.element(this.element.querySelectorAll('.actions button')[0]);
        button.triggerHandler('click');
        expect(ontologyStateSvc.showNewTab).toBe(true);
    });
    it('should set the correct state when the upload ontology button is clicked', function() {
        var button = angular.element(this.element.querySelectorAll('.actions button')[1]);
        button.triggerHandler('click');
        expect(ontologyStateSvc.showUploadTab).toBe(true);
    });
    it('should set the correct state when an ontology is clicked', function() {
        var ontology = angular.element(this.element.querySelectorAll('.ontologies .ontology')[0]);
        ontology.triggerHandler('click');
        expect(this.controller.recordId).toBe('recordA');
        expect(this.controller.recordTitle).toBe('A');
        expect(this.controller.showOpenOverlay).toBe(true);
    });
    it('should call showDeleteConfirmationOverlay when a delete link is clicked', function() {
        spyOn(this.controller, 'showDeleteConfirmationOverlay');
        var link = angular.element(this.element.querySelectorAll('.ontologies .ontology .action-container a')[0]);
        link.triggerHandler('click');
        expect(this.controller.showDeleteConfirmationOverlay).toHaveBeenCalledWith(this.controller.filteredList[0]);
    });
    it('should set the correct state when a ontology type button is clicked', function() {
        this.controller.showOpenOverlay = true;
        scope.$digest();
        var typeBtns = this.element.querySelectorAll('confirmation-overlay .type');
        angular.element(typeBtns[0]).triggerHandler('click');
        expect(this.controller.type).toBe('ontology');
        angular.element(typeBtns[1]).triggerHandler('click');
        expect(this.controller.type).toBe('vocabulary');
    });
});