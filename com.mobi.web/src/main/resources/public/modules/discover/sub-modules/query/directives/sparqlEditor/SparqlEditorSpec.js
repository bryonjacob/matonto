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
describe('SPARQL Editor directive', function() {
    var $compile, scope, prefixes;

    beforeEach(function() {
        module('templates');
        module('sparqlEditor');
        injectTrustedFilter();
        injectHighlightFilter();
        mockPrefixes();
        mockSparqlManager();

        module(function($provide) {
            $provide.value('escapeHTMLFilter', jasmine.createSpy('escapeHTMLFilter'));
        });

        inject(function(_$compile_, _$rootScope_, _prefixes_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            prefixes = _prefixes_;
        });

        this.element = $compile(angular.element('<sparql-editor></sparql-editor>'))(scope);
        scope.$digest();
        this.controller = this.element.controller('sparqlEditor');
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        prefixes = null;
        this.element.remove();
    });

    describe('initializes with the correct values', function() {
        it('for prefixes', function() {
            expect(this.controller.prefixList.length).toBe(_.keys(prefixes).length);
        });
    });
    describe('replaces the element with the correct html', function() {
        it('for a form', function() {
            expect(this.element.prop('tagName')).toBe('FORM');
        });
        it('based on form-group', function() {
            expect(this.element.querySelectorAll('.form-group').length).toBe(1);
        });
        it('with a dataset-form-group', function() {
            expect(this.element.find('dataset-form-group').length).toBe(1);
        });
        it('with a ui-codemirror', function() {
            expect(this.element.find('ui-codemirror').length).toBe(1);
        });
    });
});