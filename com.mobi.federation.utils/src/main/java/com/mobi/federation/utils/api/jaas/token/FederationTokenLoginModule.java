package com.mobi.federation.utils.api.jaas.token;

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

import com.mobi.federation.api.FederationService;
import com.mobi.federation.utils.api.UserUtils;
import com.mobi.federation.utils.api.jaas.token.config.FederationConfiguration;
import com.mobi.jaas.api.modules.token.TokenLoginModule;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.ParseException;
import java.util.Map;
import java.util.Optional;
import javax.security.auth.Subject;
import javax.security.auth.callback.CallbackHandler;
import javax.security.auth.login.FailedLoginException;
import javax.security.auth.login.LoginException;

public class FederationTokenLoginModule extends TokenLoginModule<FederationTokenCallback> {

    private static final Logger LOG = LoggerFactory.getLogger(FederationTokenLoginModule.class);
    private UserUtils userUtils;

    @Override
    protected FederationTokenCallback[] getCallbacks() {
        return new FederationTokenCallback[] {
                new FederationTokenCallback()
        };
    }

    @Override
    protected Optional<SignedJWT> verifyToken(FederationTokenCallback callback) throws ParseException, JOSEException {
        return callback.getService().verifyToken(callback.getTokenString());
    }

    @Override
    protected void verifyUser(String user, FederationTokenCallback callback) throws LoginException {
        FederationService service = callback.getService();
        try {
            if (!userUtils.userExists(service, user, callback.getNodeId())) {
                throw new FailedLoginException("User " + user + " not found in federation "
                        + service.getFederationId());
            }
        } catch (IllegalStateException ex) {
            throw new LoginException(ex.getMessage());
        }
    }

    @Override
    public void initialize(Subject subject, CallbackHandler handler, Map<String, ?> state, Map<String, ?> options) {
        super.initialize(subject, handler, state, options);
        userUtils = (UserUtils) options.get(FederationConfiguration.USER_UTILS);
        LOG.debug("Initialized SimpleTokenLoginModule");
    }
}
