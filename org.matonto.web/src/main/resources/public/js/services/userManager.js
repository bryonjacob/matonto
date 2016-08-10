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
(function() {
    'use strict';

    angular
        /**
         * @ngdoc overview
         * @name userManager
         *
         * @description
         * The `userManager` module only provides the `userManagerService` which provides 
         * utilities for adding, removing, and editing MatOnto users and groups.
         */
        .module('userManager', [])
        /**
         * @ngdoc service
         * @name userManager.service:userManagerServce
         * @requires $rootScope
         * @requires $http
         * @requires $q
         *
         * @description 
         * `userManagerService` is a service that provides access to the MatOnto users and 
         * groups REST endpoints for adding, removing, and editing MatOnto users and groups.
         */
        .service('userManagerService', userManagerService);

        userManagerService.$inject = ['$rootScope', '$http', '$q'];

        function userManagerService($rootScope, $http, $q) {
            var self = this,
                userPrefix = '/matontorest/users',
                groupPrefix = '/matontorest/groups';

            /**
             * @ngdoc property
             * @name groups
             * @propertyOf userManager.service:userManagerService
             * @type {object[]}
             *
             * @description 
             * `groups` holds a list of objects representing the groups in MatOnto. Each object
             * has a name property for the group name, a roles property for the roles associated 
             * with the group, and a members property with the names of all the users who are 
             * members of the group.
             */
            self.groups = [];
            /**
             * @ngdoc property
             * @name users
             * @propertyOf userManager.service:userManagerService
             * @type {object[]}
             *
             * @description 
             * `users` holds a list of objects representing the users in MatOnto. Each object
             * has a username property for the user's username and a roles property for the 
             * roles associated with the user.
             */
            self.users = [];

            function initialize() {
                self.setUsers().then(response => {
                    self.setGroups();                
                });
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#setUsers
             * @methodOf userManager.service:userManagerService
             * 
             * @description 
             * Sets the {@link userManager.service:userManagerService#users users} list using 
             * the result of the GET /matontorest/users endpoint and the result of the 
             * GET /matontorest/users/roles endpoint for each user.
             * 
             * @return {Promise} A Promise indicating the success or failure of the process
             * of setting the {@link userManager.service:userManagerService#users users} list
             */
            self.setUsers = function() {
                return getUsers().then(users => {
                    self.users = users;
                    return $q.all(_.map(self.users, user => listUserRoles(user.username)));
                }).then(responses => {
                    _.forEach(responses, (response, idx) => {
                        self.users[idx].roles = response;
                    });
                });
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#setGroups
             * @methodOf userManager.service:userManagerService
             * 
             * @description 
             * Sets the {@link userManager.service:userManagerService#groups groups} list using 
             * the result of the GET /matontorest/groups endpoint and the result of the 
             * GET /matontorest/users/groups endpoint for each user.
             * 
             * @return {Promise} A Promise indicating the success or failure of the process
             * of setting the {@link userManager.service:userManagerService#groups groups} list
             */
            self.setGroups = function() {
                return getGroups().then(groups => {
                    self.groups = groups;
                    return $q.all(_.map(self.groups, group => listGroupMembers(group.name)));
                }).then(responses => {
                    _.forEach(responses, (response, idx) => {
                        self.groups[idx].members = _.map(response, 'username');
                    });
                });
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#addUser
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the POST /matontorest/users endpoint to add a user to MatOnto with the
             * passed username and password. Returns a Promise that resolves if the addition 
             * was successful and rejects with an error message if it was not. Updates the 
             * {@link userManager.service:userManagerService#users users} list appropriately.
             * 
             * @param {string} username the username for the new user
             * @param {string} password the password for the new user
             * @return {Promise} A Promise that resolves if the request was successful; rejects
             * with an error message otherwise
             */
            self.addUser = function(username, password) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            username: username,
                            password: password
                        }
                    };

                $rootScope.showSpinner = true;
                $http.post(userPrefix, null, config)
                    .then(response => {
                        deferred.resolve();
                        self.users.push({username: username, roles: []});
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#getUser
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the GET /matontorest/users/{userId} endpoint to retrieve a MatOnto user
             * with passed username. Returns a Promise that resolves with the result of the call 
             * if it was successful and rejects with an error message if it was not.
             * 
             * @param {string} username the username of the user to retrieve
             * @return {Promise} A Promise that resolves with the user if the request was successful; 
             * rejects with an error message otherwise
             */
            self.getUser = function(username) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.get(userPrefix + '/' + username)
                    .then(response => {
                        deferred.resolve(response.data);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#updateUser
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the PUT /matontorest/users/{userId} endpoint to update a MatOnto user
             * specified by the passed username with an optional new username or password. 
             * Returns a Promise that resolves if it was successful and rejects with an 
             * error message if it was not. Updates the 
             * {@link userManager.service:userManagerService#users users} list appropriately.
             * 
             * @param {string} username the username of the user to retrieve
             * @param {string} newUsername the new username to give the user
             * @param {string} password the new password to give the user
             * @return {Promise} A Promise that resolves if the request was successful; rejects 
             * with an error message otherwise
             */
            self.updateUser = function(username, newUsername, password) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            username: newUsername,
                            password: password
                        }
                    };

                $rootScope.showSpinner = true;
                $http.put(userPrefix + '/' + username, null, config)
                    .then(response => {
                        deferred.resolve();
                        var original = _.find(self.users, {username: username});
                        if (newUsername) {
                            _.set(original, 'username', newUsername);
                        }
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#checkPassword
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the POST /matontorest/users/{userId}/password endpoint to test a passed
             * password against the saved password of a MatOnto user specified by the passed 
             * username. Returns a Promise that resolves if the two passwords match and rejects 
             * with an error message if they do not match or something went wrong.
             * 
             * @param {string} username the username of the user to check the password of
             * @param {string} password the password to test aginst the saved password of the user
             * @return {Promise} A Promise that resolves if the passwords match; rejects 
             * with an error message otherwise
             */
            self.checkPassword = function(username, password) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            password: password
                        }
                    };

                $rootScope.showSpinner = true;
                $http.post(userPrefix + '/' + username + '/password', null, config)
                    .then(response => {
                        if (response.data) {
                            deferred.resolve();                        
                        } else {
                            deferred.reject('Password does not match saved password. Please try again.');
                        }
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#deleteUser
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the DELETE /matontorest/users/{userId} endpoint to remove the MatOnto user
             * with passed username. Returns a Promise that resolves if the deletion was successful 
             * and rejects with an error message if it was not. Updates the 
             * {@link userManager.service:userManagerService#groups groups} list appropriately.
             * 
             * @param {string} username the username of the user to remove
             * @return {Promise} A Promise that resolves if the request was successful; rejects with 
             * an error message otherwise
             */
            self.deleteUser = function(username) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.delete(userPrefix + '/' + username)
                    .then(response => {
                        deferred.resolve();
                        _.remove(self.users, {username: username});
                        _.forEach(self.groups, group => _.pull(group.members, username));
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#addUserRole
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the PUT /matontorest/users/{userId}/roles endpoint to add the passed
             * role to the MatOnto user specified by the passed username. Returns a Promise 
             * that resolves if the addition was successful and rejects with an error message 
             * if not. Updates the {@link userManager.service:userManagerService#users users} 
             * list appropriately.
             * 
             * @param {string} username the username of the user to add a role to
             * @param {string} role the role to add to the user
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.addUserRole = function(username, role) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            role: role
                        }
                    };

                $rootScope.showSpinner = true;
                $http.put(userPrefix + '/' + username + '/roles', null, config)
                    .then(response => {
                        deferred.resolve();
                        _.get(_.find(self.users, {username: username}), 'roles').push(role);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#deleteUserRole
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the DELETE /matontorest/users/{userId}/roles endpoint to remove the passed
             * role from the MatOnto user specified by the passed username. Returns a Promise 
             * that resolves if the deletion was successful and rejects with an error message 
             * if not. Updates the {@link userManager.service:userManagerService#users users} 
             * list appropriately.
             * 
             * @param {string} username the username of the user to remove a role from
             * @param {string} role the role to remove from the user
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.deleteUserRole = function(username, role) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            role: role
                        }
                    };

                $rootScope.showSpinner = true;
                $http.delete(userPrefix + '/' + username + '/roles', config)
                    .then(response => {
                        deferred.resolve();
                        _.pull(_.get(_.find(self.users, {username: username}), 'roles'), role);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#addUserGroup
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the PUT /matontorest/users/{userId}/groups endpoint to add the MatOnto user specified 
             * by the passed username to the group specified by the passed group name. Returns a Promise 
             * that resolves if the addition was successful and rejects with an error message if not.
             * Updates the {@link userManager.service:userManagerService#groups groups} list appropriately.
             * 
             * @param {string} username the username of the user to add to the group
             * @param {string} groupName the name of the group to add the user to
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.addUserGroup = function(username, groupName) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            group: groupName
                        }
                    };

                $rootScope.showSpinner = true;
                $http.put(userPrefix + '/' + username + '/groups', null, config)
                    .then(response => {
                        deferred.resolve();
                        _.get(_.find(self.groups, {name: groupName}), 'members').push(username);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#deleteUserGroup
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the DELETE /matontorest/users/{userId}/groups endpoint to remove the MatOnto 
             * user specified by the passed username from the group specified by the passed group
             * name. Returns a Promise that resolves if the deletion was successful and rejects 
             * with an error message if not. Updates the 
             * {@link userManager.service:userManagerService#groups groups} list appropriately.
             * 
             * @param {string} username the username of the user to remove from the group
             * @param {string} role the name of the group to remove the user from
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.deleteUserGroup = function(username, groupName) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            group: groupName
                        }
                    };

                $rootScope.showSpinner = true;
                $http.delete(userPrefix + '/' + username + '/groups', config)
                    .then(response => {
                        deferred.resolve();
                        _.pull(_.get(_.find(self.groups, {name: groupName}), 'members'), username);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#addGroup
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the POST /matontorest/groups endpoint to add a groups to MatOnto with the
             * passed group name. Returns a Promise that resolves if the addition 
             * was successful and rejects with an error message if it was not. Updates the 
             * {@link userManager.service:userManagerService#groups groups} list appropriately.
             * 
             * @param {string} groupName the name for the new group
             * @return {Promise} A Promise that resolves if the request was successful; rejects
             * with an error message otherwise
             */
            self.addGroup = function(groupName) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            name: groupName
                        }
                    };

                $rootScope.showSpinner = true;
                $http.post(groupPrefix, null, config)
                    .then(response => {
                        deferred.resolve();
                        self.groups.push({name: groupName, roles: ['group'], members: []});
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#getGroup
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the GET /matontorest/groups/{groupId} endpoint to retrieve a MatOnto group
             * with passed name. Returns a Promise that resolves with the result of the call 
             * if it was successful and rejects with an error message if it was not.
             * 
             * @param {string} name the name of the group to retrieve
             * @return {Promise} A Promise that resolves with the group if the request was successful; 
             * rejects with an error message otherwise
             */
            self.getGroup = function(groupName) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.get(groupPrefix + '/' + groupName)
                    .then(response => {
                        deferred.resolve(response.data);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#deleteGroup
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the DELETE /matontorest/groups/{groupId} endpoint to remove the MatOnto group
             * with passed name. Returns a Promise that resolves if the deletion was successful 
             * and rejects with an error message if it was not. Updates the 
             * {@link userManager.service:userManagerService#groups groups} list appropriately.
             * 
             * @param {string} name the name of the group to remove
             * @return {Promise} A Promise that resolves if the request was successful; rejects with 
             * an error message otherwise
             */
            self.deleteGroup = function(groupName) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.delete(groupPrefix + '/' + groupName)
                    .then(response => {
                        deferred.resolve();
                        _.remove(self.groups, {name: groupName});
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#addGroupRole
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the PUT /matontorest/groups/{groupId}/roles endpoint to add the passed
             * role to the MatOnto group specified by the passed name. Returns a Promise 
             * that resolves if the addition was successful and rejects with an error message 
             * if not. Updates the {@link userManager.service:userManagerService#groups groups} 
             * list appropriately.
             * 
             * @param {string} name the name of the group to add a role to
             * @param {string} role the role to add to the group
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.addGroupRole = function(groupName, role) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            role: role
                        }
                    };

                $rootScope.showSpinner = true;
                $http.put(groupPrefix + '/' + groupName + '/roles', null, config)
                    .then(response => {
                        deferred.resolve();
                        _.get(_.find(self.groups, {name: groupName}), 'roles').push(role);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method
             * @name userManager.service:userManagerService#deleteGroupRole
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Calls the DELETE /matontorest/groups/{groupId}/roles endpoint to remove the passed
             * role from the MatOnto group specified by the passed name. Returns a Promise 
             * that resolves if the deletion was successful and rejects with an error message 
             * if not. Updates the {@link userManager.service:userManagerService#groups groups} 
             * list appropriately.
             * 
             * @param {string} name the name of the group to remove a role from
             * @param {string} role the role to remove from the group
             * @return {Promise} A Promise that resolves if the request is successful; rejects 
             * with an error message otherwise
             */
            self.deleteGroupRole = function(groupName, role) {
                var deferred = $q.defer(),
                    config = {
                        params: {
                            role: role
                        }
                    };

                $rootScope.showSpinner = true;
                $http.delete(groupPrefix + '/' + groupName + '/roles', config)
                    .then(response => {
                        deferred.resolve();
                        _.pull(_.get(_.find(self.groups, {name: groupName}), 'roles'), role);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            /**
             * @ngdoc method 
             * @name userManager.service:userManagerService#isAdmin
             * @methodOf userManager.service:userManagerService
             *
             * @description 
             * Tests whether the user with the passed name is an admin or not by checking the 
             * roles assigned to the user itself and the roles assigned to any groups the user
             * is a part of.
             * 
             * @param {string} username the username of the user to test whether they are an admin
             * @return {boolean} true if the user is an admin; false otherwise
             */
            self.isAdmin = function(username) {
                if (_.includes(_.get(_.find(self.users, {username: username}), 'roles', []), 'admin')) {
                    return true;
                } else {
                    var userGroups = _.filter(self.groups, group => {
                        return _.includes(group.members, username);
                    });
                    return _.includes(_.flatten(_.map(userGroups, 'roles')), 'admin');
                }
            }

            function getUsers() {
                return $http.get(userPrefix)
                    .then(response => {
                        var users = _.map(response.data, user => {return {username: user}});
                        return $q.when(users);
                    });
            }

            function getGroups() {
                return $http.get(groupPrefix)
                    .then(response => {
                        var groupNames = _.keys(response.data);
                        var groups = _.map(groupNames, groupName => {
                            return {
                                name: groupName,
                                roles: response.data[groupName]
                            };
                        });
                        return $q.when(groups);
                    });
            }

            function listUserRoles(username) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.get(userPrefix + '/' + username + '/roles')
                    .then(response => {
                        deferred.resolve(response.data);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            function listUserGroups(username) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.get(userPrefix + '/' + username + '/groups')
                    .then(response => {
                        deferred.resolve(response.data);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            function listGroupRoles(groupName) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $http.get(groupPrefix + '/' + groupName + '/roles')
                    .then(response => {
                        deferred.resolve(response.data);
                    }, error => {
                        deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                    }).then(() => {
                        $rootScope.showSpinner = false;
                    });
                return deferred.promise;
            }

            function listGroupMembers(groupName) {
                var deferred = $q.defer();

                $rootScope.showSpinner = true;
                $q.all(_.map(self.users, user => listUserGroups(user.username))).then(userGroups => {
                    var members = _.filter(self.users, (user, idx) => {
                        return _.includes(userGroups[idx], groupName);
                    });
                    deferred.resolve(members);
                }, error => {
                    deferred.reject(_.get(error, 'statusText', 'Something went wrong. Please try again later.'));
                }).then(() => {
                    $rootScope.showSpinner = false;
                });

                return deferred.promise;
            }

            initialize();
        }
})();