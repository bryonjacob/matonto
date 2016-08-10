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
         * @name userManagementSideBar
         *
         * @description 
         * The `userManagementSideBar` module only provides the `userManagementSideBar` directive 
         * which creates a left navigation of action buttons for the user management page.
         */
        .module('userManagementSideBar', [])
        /**
         * @ngdoc directive
         * @name userManagementSideBar.directive:userManagementSideBar
         * @scope
         * @restrict E
         * @requires  userManager.service:userManagerService
         * @requires  userState.service:userStateService
         * @requires loginManager.service:loginManagerService
         *
         * @description 
         * `userManagementSideBar` is a directive that creates a "left-nav" div with buttons for user
         * management actions. These actions are navigating to the 
         * {@link groupsList.directive:groupsList groups list}, navigating to the 
         * {@link usersList.directive:usersList users list}, creating a new group or user, and deleting 
         * either a group or a user.
         */
        .directive('userManagementSideBar', userManagementSideBar);

        userManagementSideBar.$inject = ['userStateService', 'userManagerService', 'loginManagerService']

        function userManagementSideBar(userStateService, userManagerService, loginManagerService) {
            return {
                restrict: 'E',
                controllerAs: 'dvm',
                scope: {},
                controller: function() {
                    var dvm = this;
                    dvm.state = userStateService;
                    dvm.um = userManagerService;
                    dvm.lm = loginManagerService;

                    dvm.getButtonTitle = function(actionPrefix) {
                        if (dvm.state.showUsersList || dvm.state.editUser) {
                            return actionPrefix + ' User';
                        } else if (dvm.state.showGroupsList || dvm.state.editGroup) {
                            return actionPrefix + ' Group';
                        } else {
                            return actionPrefix;
                        }
                    }
                    dvm.openGroups = function() {
                        dvm.state.reset();
                        dvm.state.showGroupsList = true;
                    }
                    dvm.openUsers = function() {
                        dvm.state.reset();
                        dvm.state.showUsersList = true;
                    }
                    dvm.addUser = function() {
                        dvm.state.showAddUser = true;
                    }
                    dvm.addGroup  = function() {
                        dvm.state.showAddGroup = true;
                    }
                    dvm.delete = function() {
                        dvm.state.showDeleteConfirm = true;
                    }
                },
                templateUrl: 'modules/user-management/directives/userManagementSideBar/userManagementSideBar.html'
            }
        }
})();
