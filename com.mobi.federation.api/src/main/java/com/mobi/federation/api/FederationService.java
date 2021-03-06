package com.mobi.federation.api;

/*-
 * #%L
 * federation.api
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

import com.mobi.federation.api.ontologies.federation.Federation;
import com.mobi.federation.api.ontologies.federation.FederationNode;
import com.mobi.federation.api.ontologies.federation.Node;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import org.jasypt.encryption.pbe.StandardPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.EnvironmentStringPBEConfig;

import java.io.IOException;
import java.text.ParseException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import javax.servlet.http.HttpServletResponse;

/**
 * This service represents a way to navigate the local topology of nodes on the local network.
 */
public interface FederationService {
    String NODE_REST_ENDPOINT = "%s://%s:%s%s";
    String FEDERATION_SCOPE = "self federation";

    /**
     * Retrieves the configuration associated with this federation.
     *
     * @return The {@link FederationServiceConfig} associated with this federation.
     */
    FederationServiceConfig getFederationServiceConfig();

    /**
     * Start the federation mechanisms of the service.
     */
    void start();

    /**
     * Stop the federation mechanisms service.
     */
    void stop();

    /**
     * Restart the federation mechanisms of the service.
     */
    void restart();

    /**
     * Retrieves the unique id of this federation as defined in the federation configuration.
     */
    String getFederationId();

    /**
     * Retrieves the unique id of this node in the federation.
     */
    UUID getNodeId();

    /**
     * Returns the REST services endpoint for the specified node.
     *
     * @param nodeId The unique node ID within the federation.
     * @return A {@link String} that can be converted directly to an URL.
     */
    String getNodeRESTEndpoint(UUID nodeId);

    /**
     * Retrieves the Set of UUIDs of nodes within this federation.
     *
     * @return The set of UUIDs representing servers that are part of this federation.
     */
    Set<UUID> getFederationNodeIds();

    /**
     * Retrieves the {@link FederationNode} representing a specific {@link Node} in the {@link Federation}.
     *
     * @param nodeId The ID of the node in the federation.
     * @return {@link FederationNode} if found.
     */
    Optional<FederationNode> getMetadataForNode(String nodeId);

    /**
     * Retrieves the number of members in this federation.
     *
     * @return The number of discovered local nodes in this federation.
     */
    int getMemberCount();

    /**
     * Returns the replicated map with the specified name
     *
     * @param <K>   The {@link Class} of the map key.
     * @param <V>   The {@link Class} of the map values.
     * @param mapId The id of the replicated map to return.
     * @return A {@link Map} that will be distributed and accessible to the other nodes in the federation.
     */
    <K, V> Map<K, V> getDistributedMap(String mapId);

    /**
     * Generates a federation token to be used in node communications.
     *
     * @param res      The response to send error messages to.
     * @param username The username to set as the subject of the token.
     * @return A {@link SignedJWT} token string.
     * @exception IOException Thrown if an input or output exception occurs.
     */
    SignedJWT generateToken(HttpServletResponse res, String username) throws IOException;

    /**
     * Verifies that the provided federation token string.
     *
     * @param tokenString The federation token string.
     * @return An optional containing the {@link SignedJWT} if the token was successfully parsed and verified.
     * @throws ParseException If parsing of the serialised parts failed.
     * @throws JOSEException If the JWS object couldn't be verified.
     */
    Optional<SignedJWT> verifyToken(String tokenString) throws ParseException, JOSEException;

    /**
     * Verifies that the provided federation token string and sends any errors to the {@link HttpServletResponse}.
     *
     * @param tokenString The federation token string.
     * @param res         The response to send error messages to.
     * @return An optional containing the {@link SignedJWT} if the token was successfully parsed and verified.
     * @throws IOException Thrown if an input or output exception occurs.
     */
    Optional<SignedJWT> verifyToken(String tokenString, HttpServletResponse res) throws IOException;
}
