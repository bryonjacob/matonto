package org.matonto.etl.cli;

/*-
 * #%L
 * org.matonto.etl.cli
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

import org.apache.commons.lang3.StringUtils;
import org.apache.karaf.shell.api.action.Action;
import org.apache.karaf.shell.api.action.Argument;
import org.apache.karaf.shell.api.action.Command;
import org.apache.karaf.shell.api.action.Option;
import org.apache.karaf.shell.api.action.lifecycle.Reference;
import org.apache.karaf.shell.api.action.lifecycle.Service;
import org.matonto.etl.api.config.ImportServiceConfig;
import org.matonto.etl.api.rdf.RDFImportService;
import org.matonto.rdf.api.ValueFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;

@Command(scope = "mobi", name = "import", description = "Imports objects to a repository or dataset")
@Service
public class CLIImporter implements Action {

    private static final Logger LOGGER = LoggerFactory.getLogger(CLIImporter.class);

    @Reference
    private RDFImportService importService;

    @Reference
    private ValueFactory vf;

    //Command Line Arguments and Options
    @Argument(index = 0, name = "ImportFile", description = "The file to be imported into the repository",
            required = true)
    String file = null;

    @Option(name = "-r", aliases = "--repository", description = "The id of the repository the file will be"
            + " imported to")
    String repositoryId = null;

    @Option( name = "-d", aliases = "--dataset", description = "The id of the DatasetRecord the file will be "
            + "imported to")
    String datasetRecordId = null;

    @Option( name = "-c", aliases = "--continueOnError", description = "If true, continue parsing even if there is an "
            + "error on a line.")
    boolean continueOnError = false;

    public void setImportService(RDFImportService importService) {
        this.importService = importService;
    }

    public void setVf(ValueFactory vf) {
        this.vf = vf;
    }

    @Override
    public Object execute() throws Exception {
        if ((StringUtils.isEmpty(repositoryId) && StringUtils.isEmpty(datasetRecordId))
                || (!StringUtils.isEmpty(repositoryId) && !StringUtils.isEmpty(datasetRecordId))) {
            String msg = "Repository ID or DatasetRecord ID is required";
            LOGGER.error(msg);
            System.out.println(msg);
            return null;
        }

        try {
            File newFile = new File(file);
            ImportServiceConfig.Builder builder = new ImportServiceConfig.Builder()
                    .continueOnError(continueOnError)
                    .logOutput(true)
                    .printOutput(true);
            if (repositoryId != null) {
                LOGGER.info("Importing RDF into repository " + repositoryId);
                builder.repository(repositoryId);
            } else {
                LOGGER.info("Importing RDF into dataset " + datasetRecordId);
                builder.dataset(vf.createIRI(datasetRecordId));
            }
            importService.importFile(builder.build(), newFile);
            System.out.println("Data successfully loaded");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            LOGGER.error(e.toString());
        }

        return null;
    }

}
