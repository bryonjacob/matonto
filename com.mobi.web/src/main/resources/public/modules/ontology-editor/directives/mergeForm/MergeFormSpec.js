/*-
 * #%L
 * com.mobi.web
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 - 2018 iNovex Information Systems, Inc.
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
describe('Merge Form directive', function() {
    var $compile, scope, $q, ontologyStateSvc, util, catalogManagerSvc;

    beforeEach(function() {
        module('templates');
        module('mergeForm');
        mockUtil();
        mockPrefixes();
        mockOntologyState();
        mockCatalogManager();
        injectTrustedFilter();
        injectHighlightFilter();

        inject(function(_$q_, _$compile_, _$rootScope_, _ontologyStateService_, _utilService_, _catalogManagerService_, _prefixes_) {
            $q = _$q_;
            $compile = _$compile_;
            scope = _$rootScope_;
            ontologyStateSvc = _ontologyStateService_;
            util = _utilService_;
            catalogManagerSvc = _catalogManagerService_;
            prefixes = _prefixes_;
        });

        scope.branch = {'@id': 'branchId'};
        scope.removeBranch = false;
        scope.target = undefined;
        catalogManagerSvc.localCatalog = {'@id': 'catalogId'};
        this.element = $compile(angular.element('<merge-form branch="branch" is-user-branch="dvm.os.listItem.userBranch" target="target" remove-branch="removeBranch"></merge-form>'))(scope);
        scope.$digest();
        this.controller = this.element.controller('mergeForm');
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        $q = null;
        ontologyStateSvc = null;
        util = null;
        this.element.remove();
    });

    describe('controller bound variable', function() {
        it('branch is one way bound', function() {
            this.controller.branch = {'@id': 'test'};
            scope.$digest();
            expect(scope.branch).toEqual({'@id': 'branchId'});
        });
        it('target is two way bound', function() {
            this.controller.target = {};
            scope.$digest();
            expect(scope.target).toEqual({});
        });
        it('removeBranch is two way bound', function() {
            this.controller.removeBranch = true;
            scope.$digest();
            expect(scope.removeBranch).toEqual(true);
        });
    });
    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.prop('tagName')).toBe('DIV');
            expect(this.element.hasClass('merge-form')).toBe(true);
        });
        _.forEach(['branch-select', 'checkbox'], function(item) {
            it('for ' + item, function() {
                expect(this.element.find(item).length).toBe(1);
            });
        });
        it('with a .merge-message', function() {
            expect(this.element.querySelectorAll('.merge-message').length).toBe(1);
        });
        it('depending on whether the branch is a UserBranch', function() {
            expect(this.element.find('checkbox').length).toEqual(1);

            ontologyStateSvc.listItem.userBranch = true;
            scope.$digest();
            expect(this.element.find('checkbox').length).toEqual(0);
        });
        it('depending on whether the branch is the master branch', function() {
            expect(this.element.find('checkbox').length).toEqual(1);

            this.controller.branchTitle = 'MASTER';
            ontologyStateSvc.listItem.userBranch = true;
            scope.$digest();
            expect(this.element.find('checkbox').length).toEqual(0);
        });
        it('depending on whether a target has been selected', function() {
            expect(this.element.find('commit-difference-tabset').length).toBe(0);

            this.controller.target = {};
            scope.$digest();
            expect(this.element.find('commit-difference-tabset').length).toBe(1);
        });
    });
    describe('controller methods', function() {
        describe('should collect differences when changing the target branch', function() {
            beforeEach(function() {
                ontologyStateSvc.listItem.merge.difference = {};
            });
            it('unless the target is empty', function() {
                this.controller.changeTarget();
                expect(catalogManagerSvc.getBranchHeadCommit).not.toHaveBeenCalled();
                expect(catalogManagerSvc.getDifference).not.toHaveBeenCalled();
                expect(ontologyStateSvc.listItem.merge.difference).toBeUndefined();
            });
            describe('when target is not empty', function() {
                beforeEach(function() {
                    this.controller.target = {'@id': 'target'};
                });
                it('unless an error occurs', function() {
                    catalogManagerSvc.getBranchHeadCommit.and.returnValue($q.when({'commit': {'@id': 'targetHead'}}));
                    catalogManagerSvc.getDifference.and.returnValue($q.reject('Error'));
                    this.controller.changeTarget();
                    scope.$apply();
                    expect(catalogManagerSvc.getBranchHeadCommit).toHaveBeenCalled();
                    expect(catalogManagerSvc.getDifference).toHaveBeenCalled();
                    expect(util.createErrorToast).toHaveBeenCalledWith('Error');
                    expect(ontologyStateSvc.listItem.merge.difference).toBeUndefined();
                });
                it('successfully', function() {
                    var difference = {additions: [], deletions: []};
                    catalogManagerSvc.getBranchHeadCommit.and.returnValue($q.when({'commit': {'@id': 'targetHead'}}));
                    catalogManagerSvc.getDifference.and.returnValue($q.when(difference));
                    this.controller.changeTarget();
                    scope.$apply();
                    expect(catalogManagerSvc.getBranchHeadCommit).toHaveBeenCalled();
                    expect(catalogManagerSvc.getDifference).toHaveBeenCalled();
                    expect(util.createErrorToast).not.toHaveBeenCalled();
                    expect(ontologyStateSvc.listItem.merge.difference).toEqual(difference);
                });
            });
        });
    });
});