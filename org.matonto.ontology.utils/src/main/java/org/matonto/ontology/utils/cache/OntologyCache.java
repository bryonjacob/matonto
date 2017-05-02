package org.matonto.ontology.utils.cache;

/*-
 * #%L
 * org.matonto.ontology.utils
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

/**
 * Created by seansmitz on 5/2/17.
 */
public class OntologyCache {
    public static final String CACHE_NAME = "ontologyCache";

    public static String generateKey(String recordIri, String branchIri, String commitIri) {
        return String.format("%s&%s&%s", recordIri, branchIri, commitIri);
    }
}
