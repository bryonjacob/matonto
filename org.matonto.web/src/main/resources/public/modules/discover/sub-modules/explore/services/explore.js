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
(function() {
    'use strict';

    angular
        .module('explore', [])
        .service('exploreService', exploreService);
    
    exploreService.$inject = ['$q'];
    
    function exploreService($q) {
        var self = this;
        var prefix = 'exploration-datasets/';
        
        self.getClassDetails = function(recordId) {
            // return $http.get(prefix + encodeURIComponent(id))
            //     .then(response => $q.when(response.data), response => $q.reject(response.data));
            return $q.when([{
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Material',
                count: 13,
                examples: ['Stuff', 'Other Stuff'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Crystal Structure',
                count: 4,
                examples: ['FCC', 'Hexagonal'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }, {
                label: 'Element',
                count: 22,
                examples: ['Carbon', 'Silicon', 'Titanium'],
                overview: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mollis purus quis dui varius, sed malesuada est auctor. Vestibulum vitae maximus metus. Curabitur magna nibh, fermentum vitae tincidunt in, luctus ut augue.',
                ontologyId: 'https://matonto.org/uhtc'
            }]);
        }
    }
})();