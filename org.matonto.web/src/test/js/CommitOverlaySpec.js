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
describe('Commit Overlay directive', function() {
    var $compile, scope, $q, catalogManagerSvc, stateManagerSvc, ontologyStateSvc, element, controller, catalogId;
    var commitId = 'commitId';
    var error = 'error';

    beforeEach(function() {
        module('templates');
        module('commitOverlay');
        mockOntologyState();
        mockCatalogManager();
        mockStateManager();

        inject(function(_$compile_, _$rootScope_, _$q_, _catalogManagerService_, _stateManagerService_,
            _ontologyStateService_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            $q = _$q_;
            catalogManagerSvc = _catalogManagerService_;
            stateManagerSvc = _stateManagerService_;
            ontologyStateSvc = _ontologyStateService_;
        });

        element = $compile(angular.element('<commit-overlay></commit-overlay>'))(scope);
        scope.$digest();
        controller = element.controller('commitOverlay');
        catalogId = _.get(catalogManagerSvc.localCatalog, '@id', '');
    });

    describe('replaces the element with the correct html', function() {
        it('for a div', function() {
            expect(element.prop('tagName')).toBe('DIV');
        });
        it('based on .commit-overlay', function() {
            expect(element.hasClass('commit-overlay')).toBe(true);
        });
        it('based on form', function() {
            expect(element.find('form').length).toBe(1);
        });
        it('based on error-message', function() {
            expect(element.find('error-message').length).toBe(0);
            controller.errorMessage = 'error';
            scope.$digest();
            expect(element.find('error-message').length).toBe(1);
        });
        it('based on info-message', function() {
            expect(element.find('info-message').length).toBe(0);
            controller.showMessage = true;
            scope.$digest();
            expect(element.find('info-message').length).toBe(1);
        });
        it('based on text-area', function() {
            expect(element.find('text-area').length).toBe(1);
        });
        it('based on .btn-container', function() {
            expect(element.querySelectorAll('.btn-container').length).toBe(1);
        });
        it('based on .btn', function() {
            expect(element.querySelectorAll('.btn').length).toBe(2);
        });
    });
    describe('controller methods', function() {
        describe('commit should call the correct manager functions', function() {
            var branchDeferred;
            beforeEach(function() {
                branchDeferred = $q.defer();
                catalogManagerSvc.createBranchCommit.and.returnValue(branchDeferred.promise);
            });
            describe('when createBranchCommit is resolved', function() {
                var updateDeferred;
                beforeEach(function() {
                    updateDeferred = $q.defer();
                    branchDeferred.resolve(commitId);
                    stateManagerSvc.updateOntologyState.and.returnValue(updateDeferred.promise);
                });
                it('and when updateOntologyState is resolved', function() {
                    ontologyStateSvc.listItem.inProgressCommit.additions = ['test'];
                    ontologyStateSvc.listItem.inProgressCommit.deletions = ['test'];
                    updateDeferred.resolve('');
                    controller.commit();
                    scope.$digest();
                    expect(catalogManagerSvc.createBranchCommit).toHaveBeenCalledWith(
                        ontologyStateSvc.listItem.branchId, ontologyStateSvc.listItem.recordId, catalogId,
                        controller.comment);
                    expect(stateManagerSvc.updateOntologyState).toHaveBeenCalledWith(ontologyStateSvc.listItem.recordId,
                        ontologyStateSvc.listItem.branchId, commitId);
                    expect(ontologyStateSvc.clearInProgressCommit).toHaveBeenCalled();
                    expect(ontologyStateSvc.showCommitOverlay).toBe(false);
                });
                it('and when updateOntologyState is rejected', function() {
                    updateDeferred.reject(error);
                    controller.commit();
                    scope.$digest();
                    expect(catalogManagerSvc.createBranchCommit).toHaveBeenCalledWith(
                        ontologyStateSvc.listItem.branchId, ontologyStateSvc.listItem.recordId, catalogId,
                        controller.comment);
                    expect(stateManagerSvc.updateOntologyState).toHaveBeenCalledWith(ontologyStateSvc.listItem.recordId,
                        ontologyStateSvc.listItem.branchId, commitId);
                    expect(controller.error).toEqual(error);
                });
            });
            it('when createBranchCommit is rejected', function() {
                branchDeferred.reject(error);
                controller.commit();
                scope.$digest();
                expect(catalogManagerSvc.createBranchCommit).toHaveBeenCalledWith(ontologyStateSvc.listItem.branchId,
                    ontologyStateSvc.listItem.recordId, catalogId, controller.comment);
                expect(stateManagerSvc.updateOntologyState).not.toHaveBeenCalled();
                expect(controller.error).toEqual(error);
            });
        });
    });
});