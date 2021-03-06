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
describe('Text Input directive', function() {
    var $compile, scope;

    beforeEach(function() {
        module('templates');
        module('textInput');

        inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            scope = _$rootScope_;
        });

        scope.bindModel = '';
        scope.changeEvent = jasmine.createSpy('changeEvent');
        scope.displayText = '';
        scope.mutedText = '';
        scope.required = true;
        scope.inputName = '';
        this.element = $compile(angular.element('<text-input ng-model="bindModel" change-event="changeEvent()" display-text="displayText" muted-text="mutedText" required="required" input-name="inputName"></text-input>'))(scope);
        scope.$digest();
        this.isolatedScope = this.element.isolateScope();
    });

    afterEach(function() {
        $compile = null;
        scope = null;
        this.element.remove();
    });

    describe('in isolated scope', function() {
        it('bindModel should be two way bound', function() {
            this.isolatedScope.bindModel = 'Test';
            scope.$digest();
            expect(scope.bindModel).toEqual('Test');
        });
        it('changeEvent should be called in parent scope when invoked', function() {
            this.isolatedScope.changeEvent();
            expect(scope.changeEvent).toHaveBeenCalled();
        });
        it('displayText should be one way bound', function() {
            this.isolatedScope.displayText = 'Test';
            scope.$digest();
            expect(scope.displayText).toBe('');
        });
        it('mutedText should be one way bound', function() {
            this.isolatedScope.mutedText = 'Test';
            scope.$digest();
            expect(scope.mutedText).toBe('');
        });
        it('required should be one way bound', function() {
            this.isolatedScope.required = false;
            scope.$digest();
            expect(scope.required).toBe(true);
        });
        it('inputName should be one way bound', function() {
            this.isolatedScope.inputName = 'Test';
            scope.$digest();
            expect(scope.inputName).toBe('');
        });
    });
    describe('replaces the element with the correct html', function() {
        it('for wrapping containers', function() {
            expect(this.element.hasClass('form-group')).toBe(true);
        });
        it('with a custom-label', function() {
            expect(this.element.find('custom-label').length).toBe(1);
        });
        it('with a input element for text', function() {
            expect(this.element.querySelectorAll('input[type="text"]').length).toBe(1);
        });
        it('depending on whether it is required or not', function() {
            var input = angular.element(this.element.querySelectorAll('input[type="text"]')[0]);
            expect(input.attr('required')).toBeTruthy();

            scope.required = false;
            scope.$digest();
            expect(input.attr('required')).toBeFalsy();
        });
    });
    it('should call changeEvent when the text in the input changes', function() {
        var input = angular.element(this.element.querySelectorAll('input[type="text"]')[0]);
        input.val('Test').triggerHandler('input');
        expect(scope.changeEvent).toHaveBeenCalled();
    });
});