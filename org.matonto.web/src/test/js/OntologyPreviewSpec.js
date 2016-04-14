describe('Ontology Preview directive', function() {
    var $compile,
        scope,
        ontologyManagerSvc;

    mockOntologyManager();
    mockPrefixes();
    beforeEach(function() {
        module('ontologyPreview');

        inject(function(ontologyManagerService) {
            ontologyManagerSvc = ontologyManagerService;
        });

        inject(function(_$compile_, _$rootScope_) {
            $compile = _$compile_;
            scope = _$rootScope_;
        });
    });

    injectDirectiveTemplate('modules/mapper/directives/ontologyPreview/ontologyPreview.html');

    describe('in isolated scope', function() {
        beforeEach(function() {
            scope.ontology = {};

            this.element = $compile(angular.element('<ontology-preview ontology="ontology"></ontology-preview>'))(scope);
            scope.$digest();
        });

        it('ontology should be two way bound', function() {
            var controller = this.element.controller('ontologyPreview');
            controller.ontology = {'@id': ''};
            scope.$digest();
            expect(scope.ontology).toEqual({'@id': ''});
        });
    });
    describe('controller methods', function() {
        beforeEach(function() {
            scope.ontology = {'@id': '', matonto: {classes: [{}, {}, {}, {}, {}, {}]}};

            this.element = $compile(angular.element('<ontology-preview ontology="ontology"></ontology-preview>'))(scope);
            scope.$digest();
        });
        it('should create an ontology title', function() {
            var controller = this.element.controller('ontologyPreview');
            var result = controller.createTitle();

            expect(ontologyManagerSvc.getEntityName).toHaveBeenCalledWith(controller.ontology);
            expect(typeof result).toBe('string');
        });
        it('should create a description of the ontology', function() {
            var controller = this.element.controller('ontologyPreview');
            var result = controller.createDescription();
            expect(typeof result).toBe('string');
        });
        it('should create a list of the classes in the ontology and set the number of classes', function() {
            ontologyManagerSvc.getEntityName.calls.reset();
            var controller = this.element.controller('ontologyPreview');
            controller.full = false;
            controller.createClassList();
            expect(controller.numClasses).toBe(scope.ontology.matonto.classes.length);
            expect(ontologyManagerSvc.getEntityName.calls.count()).toBe(controller.numClassPreview);
            
            ontologyManagerSvc.getEntityName.calls.reset();
            controller.full = true;
            controller.createClassList();
            expect(controller.numClasses).toBe(scope.ontology.matonto.classes.length);
            expect(ontologyManagerSvc.getEntityName.calls.count()).toBe(scope.ontology.matonto.classes.length);
        });
        it('should get the list of classes in the ontology', function() {
            var controller = this.element.controller('ontologyPreview');
            spyOn(controller, 'createClassList').and.callThrough();
            var result = controller.getClassList();
            expect(controller.createClassList).not.toHaveBeenCalled();
            expect(Array.isArray(result)).toBe(true);
        });
    });
    describe('replaces the element with the correct html', function() {
        beforeEach(function() {
            this.element = $compile(angular.element('<ontology-preview ontology="ontology"></ontology-preview>'))(scope);
            scope.$digest();
        });
        it('for wrapping containers', function() {
            expect(this.element.hasClass('ontology-preview')).toBe(true);
        });
        it('depending on whether ontology was passed', function() {
            expect(this.element.children().length).toBe(0);

            scope.ontology = {};
            scope.$digest();
            expect(this.element.children().length).toBe(1);
        });
        it('depending on the length of the class list', function() {
            scope.ontology = {'@id': '', matonto: {classes: [{}]}};
            scope.$digest();
            expect(this.element.querySelectorAll('a.header-link').length).toBe(0);

            scope.ontology = {'@id': 'test', matonto: {classes: [{}, {}, {}, {}, {}, {}]}};
            scope.$digest();
            expect(this.element.querySelectorAll('a.header-link').length).toBe(1);
        });
        it('depending on how many classes are showing', function() {
            var controller = this.element.controller('ontologyPreview');
            scope.ontology = {'@id': '', matonto: {classes: [{}, {}, {}, {}, {}, {}]}};
            scope.$digest();
            var link = angular.element(this.element.querySelectorAll('a.header-link')[0]);
            expect(link.text()).toBe('See More');
            controller.full = true;
            scope.$digest();
            expect(link.text()).toBe('See Less');
        });
        it('with the correct number of list items for classes', function() {
            var controller = this.element.controller('ontologyPreview');
            scope.ontology = {'@id': '', matonto: {classes: [{}]}};
            scope.$digest();
            expect(this.element.querySelectorAll('.classes li').length).toBe(controller.getClassList().length);
        });
    });
    it('calls createClassList and sets full on click of link', function() {
        scope.ontology = {'@id': '', matonto: {classes: [{}, {}, {}, {}, {}, {}]}};
        var element = $compile(angular.element('<ontology-preview ontology="ontology"></ontology-preview>'))(scope);
        scope.$digest();
        var controller = element.controller('ontologyPreview');
        spyOn(controller, 'getClassList').and.callThrough();
        
        angular.element(element.querySelectorAll('a.header-link')[0]).triggerHandler('click');
        expect(controller.full).toBe(true);
        expect(controller.getClassList).toHaveBeenCalled();
    });
});