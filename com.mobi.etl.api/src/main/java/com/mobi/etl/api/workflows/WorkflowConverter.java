package com.mobi.etl.api.workflows;

/*-
 * #%L
 * com.mobi.etl.api
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

import com.mobi.etl.api.ontologies.etl.Workflow;
import org.apache.camel.CamelContext;
import org.apache.camel.builder.RouteBuilder;

public interface WorkflowConverter {

    /**
     * Converts the Workflow RDF configuration into Routes within a RouteBuilder for the purpose of adding them to the
     * provided CamelContext. Should include all referenced DataSources, Processors, and Destinations along with
     * rdf:Lists describing the Routes to be created.
     *
     * @param workflow a Workflow containing route definitions of DataSources, Processors, and Destinations
     * @param context a CamelContext to deploy the Workflow to
     * @return A RouteBuilder containing Routes configured by the Workflow RDF
     */
    RouteBuilder convert(Workflow workflow, CamelContext context);
}
