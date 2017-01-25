package org.matonto.jaas.rest.impl;

/*-
 * #%L
 * org.matonto.jaas.rest
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

import static org.matonto.rest.util.RestUtils.getActiveUsername;

import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Reference;
import org.matonto.jaas.api.config.MatontoConfiguration;
import org.matonto.jaas.api.engines.EngineManager;
import org.matonto.jaas.api.engines.UserConfig;
import org.matonto.jaas.api.ontologies.usermanagement.Group;
import org.matonto.jaas.api.ontologies.usermanagement.Role;
import org.matonto.jaas.api.ontologies.usermanagement.User;
import org.matonto.jaas.engines.RdfEngine;
import org.matonto.jaas.rest.UserRest;
import org.matonto.ontologies.foaf.Agent;
import org.matonto.rdf.api.Value;
import org.matonto.rdf.api.ValueFactory;
import org.matonto.rdf.orm.Thing;
import org.matonto.rest.util.ErrorUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.GenericEntity;
import javax.ws.rs.core.Response;

@Component(immediate = true)
public class UserRestImpl implements UserRest {
    protected EngineManager engineManager;
    protected ValueFactory factory;
    protected MatontoConfiguration matontoConfiguration;
    private final Logger logger = LoggerFactory.getLogger(UserRestImpl.class);

    @Reference
    protected void setEngineManager(EngineManager engineManager) {
        this.engineManager = engineManager;
    }

    @Reference
    protected void setFactory(ValueFactory factory) {
        this.factory = factory;
    }

    @Reference
    protected void setMatontoConfiguration(MatontoConfiguration configuration) {
        this.matontoConfiguration = configuration;
    }

    @Override
    public Response listUsers() {
        Set<String> usernames = engineManager.getUsers(RdfEngine.COMPONENT_NAME).stream()
                .map(User::getUsername)
                .filter(Optional::isPresent)
                .map(username -> username.get().stringValue())
                .collect(Collectors.toSet());

        return Response.status(200).entity(usernames).build();
    }

    @Override
    public Response createUser(User user, String password) {
        if (password == null) {
            throw ErrorUtils.sendError("Password must be provided", Response.Status.BAD_REQUEST);
        }
        Value username = user.getUsername().orElseThrow(() ->
                ErrorUtils.sendError("Username must be provided", Response.Status.BAD_REQUEST));
        if (engineManager.userExists(username.stringValue())) {
            throw ErrorUtils.sendError("User already exists", Response.Status.BAD_REQUEST);
        }

        User tempUser = engineManager.createUser(RdfEngine.COMPONENT_NAME,
                new UserConfig.Builder("", password, new HashSet<>()).build());
        user.setPassword(tempUser.getPassword().get());
        engineManager.storeUser(RdfEngine.COMPONENT_NAME, user);
        logger.info("Created user " + username.stringValue());
        return Response.ok().build();
    }

    @Override
    public Response getUser(String username) {
        if (username == null) {
            throw ErrorUtils.sendError("Username must be provided", Response.Status.BAD_REQUEST);
        }
        User user = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        return Response.status(200).entity(user).build();
    }

    @Override
    public Response updateUser(ContainerRequestContext context, String username, User newUser) {
        if (username == null) {
            throw ErrorUtils.sendError("Current username must be provided",
                    Response.Status.BAD_REQUEST);
        }
        isAuthorizedUser(context, username);
        Value newUsername = newUser.getUsername().orElseThrow(() ->
                ErrorUtils.sendError("Username must be provided in new user", Response.Status.BAD_REQUEST));
        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        if (!savedUser.getUsername().get().equals(newUsername)) {
            throw ErrorUtils.sendError("Usernames must match", Response.Status.BAD_REQUEST);
        }

        if (!savedUser.getHasUserRole().isEmpty()) {
            newUser.setHasUserRole(savedUser.getHasUserRole());
        }
        newUser.setPassword(savedUser.getPassword().get());

        engineManager.updateUser(RdfEngine.COMPONENT_NAME, newUser);
        return Response.ok().build();
    }

    @Override
    public Response updatePassword(ContainerRequestContext context, String username, String currentPassword,
                                   String newPassword) {
        if (username == null || currentPassword == null) {
            throw ErrorUtils.sendError("Both current username and current password must be provided",
                    Response.Status.BAD_REQUEST);
        }
        if (newPassword == null) {
            throw ErrorUtils.sendError("New password must be provided", Response.Status.BAD_REQUEST);
        }
        isAuthorizedUser(context, username);
        if (!engineManager.checkPassword(RdfEngine.COMPONENT_NAME, username, currentPassword)) {
            throw ErrorUtils.sendError("Invalid password", Response.Status.UNAUTHORIZED);
        }
        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        User tempUser = engineManager.createUser(RdfEngine.COMPONENT_NAME,
                new UserConfig.Builder("", newPassword, new HashSet<>()).build());
        savedUser.setPassword(tempUser.getPassword().get());
        engineManager.updateUser(RdfEngine.COMPONENT_NAME, savedUser);
        return Response.ok().build();
    }

    @Override
    public Response deleteUser(ContainerRequestContext context, String username) {
        if (username == null) {
            throw ErrorUtils.sendError("Username must be provided", Response.Status.BAD_REQUEST);
        }
        isAuthorizedUser(context, username);
        if (!engineManager.userExists(username)) {
            throw ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST);
        }

        engineManager.deleteUser(RdfEngine.COMPONENT_NAME, username);
        logger.info("Deleted user " + username);
        return Response.ok().build();
    }

    @Override
    public Response getUserRoles(String username, boolean includeGroups) {
        if (username == null) {
            throw ErrorUtils.sendError("Username must be provided", Response.Status.BAD_REQUEST);
        }
        User user = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Set<Role> roles = includeGroups ? engineManager.getUserRoles(RdfEngine.COMPONENT_NAME, username)
                : user.getHasUserRole();
        return Response.ok(new GenericEntity<Set<Role>>(roles) {}).build();
    }

    @Override
    public Response addUserRole(String username, String role) {
        if (username == null || role == null) {
            throw ErrorUtils.sendError("Both username and role must be provided", Response.Status.BAD_REQUEST);
        }

        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Role roleObj = engineManager.getRole(RdfEngine.COMPONENT_NAME, role).orElseThrow(() ->
                ErrorUtils.sendError("Role " + role + " not found", Response.Status.BAD_REQUEST));
        Set<Role> allRoles = savedUser.getHasUserRole();
        allRoles.add(roleObj);
        savedUser.setHasUserRole(allRoles);
        engineManager.updateUser(RdfEngine.COMPONENT_NAME, savedUser);
        logger.info("Role " + role + " added to user " + username);
        return Response.ok().build();
    }

    @Override
    public Response removeUserRole(String username, String role) {
        if (username == null || role == null) {
            throw ErrorUtils.sendError("Both username and role must be provided", Response.Status.BAD_REQUEST);
        }
        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Role roleObj = engineManager.getRole(RdfEngine.COMPONENT_NAME, role).orElseThrow(() ->
                ErrorUtils.sendError("Role " + role + " not found", Response.Status.BAD_REQUEST));
        savedUser.removeProperty(roleObj.getResource(), factory.createIRI(User.hasUserRole_IRI));
        engineManager.updateUser(RdfEngine.COMPONENT_NAME, savedUser);
        logger.info("Role " + role + " removed from user " + username);
        return Response.ok().build();
    }

    @Override
    public Response listUserGroups(String username) {
        if (username == null) {
            throw ErrorUtils.sendError("Username must be provided", Response.Status.BAD_REQUEST);
        }

        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Set<Group> groups = engineManager.getGroups(RdfEngine.COMPONENT_NAME).stream()
                .filter(group -> {
                    Set<Agent> members = group.getMember();
                    return members.stream()
                        .map(Thing::getResource)
                        .anyMatch(resource -> resource.equals(savedUser.getResource()));
                })
                .collect(Collectors.toSet());

        return Response.status(200).entity(new GenericEntity<Set<Group>>(groups) {}).build();
    }

    @Override
    public Response addUserGroup(String username, String groupTitle) {
        if (username == null || groupTitle == null) {
            throw ErrorUtils.sendError("Both username and group name must be provided", Response.Status.BAD_REQUEST);
        }
        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Group savedGroup = engineManager.retrieveGroup(RdfEngine.COMPONENT_NAME, groupTitle).orElseThrow(() ->
                ErrorUtils.sendError("Group " + groupTitle + " not found", Response.Status.BAD_REQUEST));
        Set<Agent> newMembers = savedGroup.getMember();
        newMembers.add(savedUser);
        savedGroup.setMember(newMembers);
        engineManager.updateGroup(RdfEngine.COMPONENT_NAME, savedGroup);
        logger.info("Added user " + username + " to group " + groupTitle);
        return Response.ok().build();
    }

    @Override
    public Response removeUserGroup(String username, String groupTitle) {
        if (username == null || groupTitle == null) {
            throw ErrorUtils.sendError("Both username and group name must be provided", Response.Status.BAD_REQUEST);
        }
        User savedUser = engineManager.retrieveUser(RdfEngine.COMPONENT_NAME, username).orElseThrow(() ->
                ErrorUtils.sendError("User " + username + " not found", Response.Status.BAD_REQUEST));
        Group savedGroup = engineManager.retrieveGroup(RdfEngine.COMPONENT_NAME, groupTitle).orElseThrow(() ->
                ErrorUtils.sendError("Group " + groupTitle + " not found", Response.Status.BAD_REQUEST));
        savedGroup.removeProperty(savedUser.getResource(), factory.createIRI(Group.member_IRI));
        engineManager.updateGroup(RdfEngine.COMPONENT_NAME, savedGroup);
        logger.info("Removed user " + username + " from group " + groupTitle);
        return Response.ok().build();
    }

    @Override
    public Response getUsername(String userIri) {
        String username = engineManager.getUsername(factory.createIRI(userIri)).orElseThrow(() ->
                ErrorUtils.sendError("User not found", Response.Status.NOT_FOUND));
        return Response.ok(username).build();
    }

    /**
     * Checks if the user is authorized to make this request. The requesting user must be an admin or have a matching
     * username.
     *
     * @param context The request context
     * @param username The required username if the user is not an admin
     */
    private void isAuthorizedUser(ContainerRequestContext context, String username) {
        String activeUsername = getActiveUsername(context);
        if (!engineManager.userExists(activeUsername)) {
            throw ErrorUtils.sendError("User not found", Response.Status.FORBIDDEN);
        }
        boolean isAdmin = engineManager.getUserRoles(activeUsername).stream()
                .map(Thing::getResource)
                .anyMatch(resource -> resource.stringValue().contains("admin"));
        if (!username.equals(activeUsername) && !isAdmin) {
            throw ErrorUtils.sendError("Not authorized to make this request", Response.Status.FORBIDDEN);
        }
    }
}
