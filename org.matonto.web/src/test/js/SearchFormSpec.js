/*-
 * #%L
 * org.matonto.web
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 - 2017 iNovex Information Systems, Inc.
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
describe('Search Form directive', function() {
    var $compile, scope, $q, element, controller, searchSvc, discoverStateSvc;

    beforeEach(function() {
        module('templates');
        module('searchForm');
        mockDiscoverState();
        mockSearch();

        inject(function(_$compile_, _$rootScope_, _$q_, _searchService_, _discoverStateService_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            $q = _$q_;
            searchSvc = _searchService_;
            discoverStateSvc = _discoverStateService_;
        });

        element = $compile(angular.element('<search-form></search-form>'))(scope);
        scope.$digest();
        controller = element.controller('searchForm');
    });

    describe('controller methods', function() {
        describe('should submit the search query', function() {
            beforeEach(function() {
                discoverStateSvc.search.results = {};
            });
            it('unless an error occurs', function() {
                searchSvc.submitSearch.and.returnValue($q.reject('Error Message'));
                controller.submit();
                scope.$apply();
                expect(searchSvc.submitSearch).toHaveBeenCalledWith(discoverStateSvc.search.keywords.arr, discoverStateSvc.search.keywords.isOr, discoverStateSvc.search.recordId);
                expect(controller.errorMessage).toEqual('Error Message');
                expect(discoverStateSvc.search.results).toBeUndefined();
            });
            it('and set the results', function() {
                searchSvc.submitSearch.and.returnValue($q.when({head: {}}));
                controller.submit();
                scope.$apply();
                expect(searchSvc.submitSearch).toHaveBeenCalledWith(discoverStateSvc.search.keywords.arr, discoverStateSvc.search.keywords.isOr, discoverStateSvc.search.recordId);
                expect(controller.errorMessage).toEqual('');
                expect(discoverStateSvc.search.results).toEqual({head: {}});
            });
        });
    });
    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(element.prop('tagName')).toBe('DIV');
            expect(element.hasClass('search-form')).toBe(true);
        });
        it('with a block', function() {
            expect(element.find('block').length).toEqual(1);
        });
        it('with a block-content', function() {
            expect(element.find('block-content').length).toEqual(1);
        });
        it('with a .and-strike', function() {
            expect(element.querySelectorAll('.and-strike').length).toEqual(1);
        });
        it('with a dataset-form-group', function() {
            expect(element.find('dataset-form-group').length).toEqual(1);
        });
        it('with a block-footer', function() {
            expect(element.find('block-footer').length).toEqual(1);
        });
        it('with a custom-label', function() {
            expect(element.find('custom-label').length).toEqual(1);
        });
        it('with a md-chips', function() {
            expect(element.find('md-chips').length).toEqual(1);
        });
        it('with a button to submit', function() {
            var buttons = element.find('button');
            expect(buttons.length).toEqual(1);
            expect(buttons.text()).toContain('Submit');
        });
        it('depending on whether an error has occurred', function() {
            expect(element.find('error-display').length).toEqual(0);

            controller.errorMessage = 'Test';
            scope.$digest();
            expect(element.find('error-display').length).toEqual(1);
        });
    });
});