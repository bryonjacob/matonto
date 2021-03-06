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
describe('Concepts Tab directive', function() {
    var $compile, scope, ontologyStateSvc, propertyManagerSvc;

    beforeEach(function() {
        module('templates');
        module('conceptsTab');
        mockOntologyState();
        mockPropertyManager();

        inject(function(_$compile_, _$rootScope_, _ontologyStateService_, _propertyManagerService_) {
            $compile = _$compile_;
            scope = _$rootScope_;
            ontologyStateSvc = _ontologyStateService_;
            propertyManagerSvc = _propertyManagerService_;
        });

        propertyManagerSvc.conceptSchemeRelationshipList = ['topConceptOf', 'inScheme'];
        ontologyStateSvc.listItem.iriList = ['topConceptOf'];
        ontologyStateSvc.listItem.derivedSemanticRelations = ['derived'];
        this.element = $compile(angular.element('<concepts-tab></concepts-tab>'))(scope);
        scope.$digest();
        this.controller = this.element.controller('conceptsTab');
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        ontologyStateSvc = null;
        propertyManagerSvc = null;
        this.element.remove();
    });

    it('initializes with the correct list of relationships', function() {
        expect(this.controller.relationshipList).toEqual(['derived', 'topConceptOf']);
    });
    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.prop('tagName')).toBe('DIV');
            expect(this.element.hasClass('concepts-tab')).toBe(true);
            expect(this.element.hasClass('row')).toBe(true);
        });
        it('with a concept-hierarchy-block', function() {
            expect(this.element.find('concept-hierarchy-block').length).toBe(1);
        });
        it('with a .editor', function() {
            expect(this.element.querySelectorAll('.editor').length).toBe(1);
        });
        it('with a selected-details', function() {
            expect(this.element.find('selected-details').length).toBe(1);
        });
        it('with a annotation-block', function() {
            expect(this.element.find('annotation-block').length).toBe(1);
        });
        it('with a relationships-block', function() {
            expect(this.element.find('relationships-block').length).toBe(1);
        });
        it('with a usages-block', function() {
            expect(this.element.find('usages-block').length).toBe(1);
        });
    });
});