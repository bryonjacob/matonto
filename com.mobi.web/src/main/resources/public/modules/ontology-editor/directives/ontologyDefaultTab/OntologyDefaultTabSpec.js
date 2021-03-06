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
describe('Ontology Default Tab directive', function() {
    var $compile, scope, ontologyStateSvc;

    beforeEach(function() {
        module('templates');
        module('ontologyDefaultTab');
        mockOntologyState();

        inject(function(_$compile_, _$rootScope_, _ontologyStateService_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            ontologyStateSvc = _ontologyStateService_;
        });

        this.element = $compile(angular.element('<ontology-default-tab></ontology-default-tab>'))(scope);
        scope.$digest();
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        ontologyStateSvc = null;
        this.element.remove();
    });

    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.prop('tagName')).toBe('DIV');
            expect(this.element.hasClass('ontology-default-tab')).toBe(true);
        });
        it('depending on whether a new ontology is being created', function() {
            expect(this.element.find('open-ontology-tab').length).toBe(1);
            expect(this.element.find('new-ontology-tab').length).toBe(0);

            ontologyStateSvc.showNewTab = true;
            scope.$digest();
            expect(this.element.find('open-ontology-tab').length).toBe(0);
            expect(this.element.find('new-ontology-tab').length).toBe(1);
        });
        it('depending on whether an ontology is being uploaded', function() {
            expect(this.element.find('open-ontology-tab').length).toBe(1);
            expect(this.element.find('upload-ontology-tab').length).toBe(0);

            ontologyStateSvc.showUploadTab = true;
            scope.$digest();
            expect(this.element.find('open-ontology-tab').length).toBe(0);
            expect(this.element.find('upload-ontology-tab').length).toBe(1);
        });
    });
});