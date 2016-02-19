(function() {
    'use strict';

    angular
        .module('propertyTree', [])
        .directive('propertyTree', propertyTree);

        function propertyTree() {
            return {
                restrict: 'E',
                templateUrl: 'modules/ontology-editor/directives/propertyTree/propertyTree.html',
                link: function($scope, $element, $attrs) {
                    $scope.propertyType = $attrs.propertyType;
                }
            }
        }
})();
