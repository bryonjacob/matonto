package org.matonto.catalog.rest.impl;

/*-
 * #%L
 * org.matonto.catalog.rest
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

import static org.matonto.rest.util.RestUtils.getActiveUser;
import static org.matonto.rest.util.RestUtils.getRDFFormatFileExtension;
import static org.matonto.rest.util.RestUtils.getRDFFormatMimeType;
import static org.matonto.rest.util.RestUtils.getTypedObjectFromJsonld;
import static org.matonto.rest.util.RestUtils.jsonldToModel;
import static org.matonto.rest.util.RestUtils.modelToString;

import aQute.bnd.annotation.component.Component;
import aQute.bnd.annotation.component.Reference;
import net.sf.json.JSONArray;
import net.sf.json.JSONObject;
import org.apache.commons.lang3.StringUtils;
import org.matonto.catalog.api.CatalogManager;
import org.matonto.catalog.api.PaginatedSearchParams;
import org.matonto.catalog.api.PaginatedSearchResults;
import org.matonto.catalog.api.builder.Conflict;
import org.matonto.catalog.api.builder.Difference;
import org.matonto.catalog.api.builder.DistributionConfig;
import org.matonto.catalog.api.builder.RecordConfig;
import org.matonto.catalog.api.ontologies.mcat.Branch;
import org.matonto.catalog.api.ontologies.mcat.Catalog;
import org.matonto.catalog.api.ontologies.mcat.Commit;
import org.matonto.catalog.api.ontologies.mcat.CommitFactory;
import org.matonto.catalog.api.ontologies.mcat.Distribution;
import org.matonto.catalog.api.ontologies.mcat.DistributionFactory;
import org.matonto.catalog.api.ontologies.mcat.InProgressCommit;
import org.matonto.catalog.api.ontologies.mcat.InProgressCommitFactory;
import org.matonto.catalog.api.ontologies.mcat.Record;
import org.matonto.catalog.api.ontologies.mcat.UserBranch;
import org.matonto.catalog.api.ontologies.mcat.Version;
import org.matonto.catalog.api.versioning.VersioningManager;
import org.matonto.catalog.rest.CatalogRest;
import org.matonto.exception.MatOntoException;
import org.matonto.jaas.api.engines.EngineManager;
import org.matonto.jaas.api.ontologies.usermanagement.User;
import org.matonto.ontologies.provo.Activity;
import org.matonto.ontologies.provo.InstantaneousEvent;
import org.matonto.persistence.utils.api.BNodeService;
import org.matonto.persistence.utils.api.SesameTransformer;
import org.matonto.rdf.api.IRI;
import org.matonto.rdf.api.Literal;
import org.matonto.rdf.api.Model;
import org.matonto.rdf.api.Resource;
import org.matonto.rdf.api.Value;
import org.matonto.rdf.api.ValueFactory;
import org.matonto.rdf.orm.OrmFactory;
import org.matonto.rdf.orm.OrmFactoryRegistry;
import org.matonto.rdf.orm.Thing;
import org.matonto.rest.util.ErrorUtils;
import org.matonto.rest.util.LinksUtils;
import org.matonto.rest.util.jaxb.Links;
import org.openrdf.model.vocabulary.DCTERMS;
import org.openrdf.model.vocabulary.RDF;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedWriter;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.StreamingOutput;
import javax.ws.rs.core.UriInfo;

@Component(immediate = true)
public class CatalogRestImpl implements CatalogRest {
    private static final Logger LOG = LoggerFactory.getLogger(CatalogRestImpl.class);
    private static final Set<String> SORT_RESOURCES;

    private OrmFactoryRegistry factoryRegistry;
    private SesameTransformer transformer;
    private CatalogManager catalogManager;
    private ValueFactory vf;
    private VersioningManager versioningManager;
    private BNodeService bNodeService;

    protected EngineManager engineManager;
    protected DistributionFactory distributionFactory;
    protected CommitFactory commitFactory;
    protected InProgressCommitFactory inProgressCommitFactory;

    static {
        Set<String> sortResources = new HashSet<>();
        sortResources.add(DCTERMS.MODIFIED.stringValue());
        sortResources.add(DCTERMS.ISSUED.stringValue());
        sortResources.add(DCTERMS.TITLE.stringValue());
        SORT_RESOURCES = Collections.unmodifiableSet(sortResources);
    }

    @Reference
    protected void setEngineManager(EngineManager engineManager) {
        this.engineManager = engineManager;
    }

    @Reference
    protected void setTransformer(SesameTransformer transformer) {
        this.transformer = transformer;
    }

    @Reference
    protected void setCatalogManager(CatalogManager catalogManager) {
        this.catalogManager = catalogManager;
    }

    @Reference
    protected void setVf(ValueFactory vf) {
        this.vf = vf;
    }

    @Reference
    protected void setFactoryRegistry(OrmFactoryRegistry factoryRegistry) {
        this.factoryRegistry = factoryRegistry;
    }

    @Reference
    protected void setDistributionFactory(DistributionFactory distributionFactory) {
        this.distributionFactory = distributionFactory;
    }

    @Reference
    protected void setCommitFactory(CommitFactory commitFactory) {
        this.commitFactory = commitFactory;
    }

    @Reference
    protected void setInProgressCommitFactory(InProgressCommitFactory inProgressCommitFactory) {
        this.inProgressCommitFactory = inProgressCommitFactory;
    }

    @Reference
    protected void setVersioningManager(VersioningManager versioningManager) {
        this.versioningManager = versioningManager;
    }

    @Reference
    protected void setbNodeService(BNodeService bNodeService) {
        this.bNodeService = bNodeService;
    }

    @Override
    public Response getCatalogs(String catalogType) {
        try {
            Set<Catalog> catalogs = new HashSet<>();
            Catalog localCatalog = catalogManager.getLocalCatalog();
            Catalog distributedCatalog = catalogManager.getDistributedCatalog();
            if (catalogType == null) {
                catalogs.add(localCatalog);
                catalogs.add(distributedCatalog);
            } else if (catalogType.equals("local")) {
                catalogs.add(localCatalog);
            } else if (catalogType.equals("distributed")) {
                catalogs.add(distributedCatalog);
            }

            JSONArray array = JSONArray.fromObject(catalogs.stream()
                    .map(catalog -> thingToJsonObject(catalog, Catalog.TYPE))
                    .collect(Collectors.toList()));
            return Response.ok(array).build();
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getCatalog(String catalogId) {
        try {
            Resource catalogIri = vf.createIRI(catalogId);
            if (catalogIri.equals(catalogManager.getLocalCatalogIRI())) {
                return Response.ok(thingToJsonObject(catalogManager.getLocalCatalog(), Catalog.TYPE)).build();
            } else if (catalogIri.equals(catalogManager.getDistributedCatalogIRI())) {
                return Response.ok(thingToJsonObject(catalogManager.getDistributedCatalog(), Catalog.TYPE)).build();
            } else {
                throw ErrorUtils.sendError("Catalog " + catalogId + " does not exist", Response.Status.NOT_FOUND);
            }
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getRecords(UriInfo uriInfo, String catalogId, String sort, String recordType, int offset, int limit,
                               boolean asc, String searchText) {
        try {
            LinksUtils.validateParams(limit, offset);
            PaginatedSearchParams.Builder builder = new PaginatedSearchParams.Builder().offset(offset).ascending(asc);
            if (limit > 0) {
                builder.limit(limit);
            }
            if (sort != null) {
                builder.sortBy(vf.createIRI(sort));
            }
            if (recordType != null) {
                builder.typeFilter(vf.createIRI(recordType));
            }
            if (searchText != null) {
                builder.searchText(searchText);
            }
            PaginatedSearchResults<Record> records = catalogManager.findRecord(vf.createIRI(catalogId),
                    builder.build());
            return createPaginatedResponse(uriInfo, records.getPage(), records.getTotalSize(), limit, offset,
                    Record.TYPE);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createRecord(ContainerRequestContext context, String catalogId, String typeIRI, String title,
                                 String identifierIRI, String description, String keywords) {
        try {
            Map<String, OrmFactory<? extends Record>> recordFactories = getRecordFactories();
            if (typeIRI == null || !recordFactories.keySet().contains(typeIRI)) {
                throw ErrorUtils.sendError("Invalid Record type", Response.Status.BAD_REQUEST);
            }
            if (title == null) {
                throw ErrorUtils.sendError("Record title is required", Response.Status.BAD_REQUEST);
            }

            User activeUser = getActiveUser(context, engineManager);
            RecordConfig.Builder builder = new RecordConfig.Builder(title, Collections.singleton(activeUser));
            if (identifierIRI != null) {
                builder.identifier(identifierIRI);
            }
            if (description != null) {
                builder.description(description);
            }
            if (keywords != null && !keywords.isEmpty()) {
                builder.keywords(Arrays.stream(StringUtils.split(keywords, ",")).collect(Collectors.toSet()));
            }

            Record newRecord = catalogManager.createRecord(builder.build(), recordFactories.get(typeIRI));
            catalogManager.addRecord(vf.createIRI(catalogId), newRecord);
            return Response.status(201).entity(newRecord.getResource().stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getRecord(String catalogId, String recordId) {
        try {
            Record record = catalogManager.getRecord(vf.createIRI(catalogId), vf.createIRI(recordId),
                    factoryRegistry.getFactoryOfType(Record.class).get()).orElseThrow(() ->
                    ErrorUtils.sendError("Record " + recordId + " could not be found", Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(record, Record.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteRecord(String catalogId, String recordId) {
        try {
            catalogManager.removeRecord(vf.createIRI(catalogId), vf.createIRI(recordId));
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateRecord(String catalogId, String recordId, String newRecordJson) {
        try {
            Record newRecord = getNewThing(newRecordJson, vf.createIRI(recordId),
                    factoryRegistry.getFactoryOfType(Record.class).get());
            catalogManager.updateRecord(vf.createIRI(catalogId), newRecord);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getUnversionedDistributions(UriInfo uriInfo, String catalogId, String recordId, String sort,
                                                int offset, int limit, boolean asc) {
        try {
            validatePaginationParams(sort, offset, limit);
            Set<Distribution> distributions = catalogManager.getUnversionedDistributions(vf.createIRI(catalogId),
                    vf.createIRI(recordId));
            return createPaginatedThingResponse(uriInfo, distributions, sort, offset, limit, asc, null,
                    Distribution.TYPE);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createUnversionedDistribution(ContainerRequestContext context, String catalogId, String recordId,
                                                  String title, String description, String format, String accessURL,
                                                  String downloadURL) {
        try {
            Distribution newDistribution = createDistribution(title, description, format, accessURL, downloadURL,
                    context);
            catalogManager.addUnversionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId), newDistribution);
            return Response.status(201).entity(newDistribution.getResource().stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getUnversionedDistribution(String catalogId, String recordId, String distributionId) {
        try {
            Distribution distribution = catalogManager.getUnversionedDistribution(vf.createIRI(catalogId),
                    vf.createIRI(recordId), vf.createIRI(distributionId)).orElseThrow(() ->
                    ErrorUtils.sendError("Distribution " + distributionId + " could not be found",
                            Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(distribution, Distribution.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteUnversionedDistribution(String catalogId, String recordId, String distributionId) {
        try {
            catalogManager.removeUnversionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(distributionId));
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateUnversionedDistribution(String catalogId, String recordId, String distributionId,
                                                  String newDistributionJson) {
        try {
            Distribution newDistribution = getNewThing(newDistributionJson, vf.createIRI(distributionId),
                    distributionFactory);
            catalogManager.updateUnversionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId),
                    newDistribution);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getVersions(UriInfo uriInfo, String catalogId, String recordId, String sort, int offset,
                                int limit, boolean asc) {
        try {
            validatePaginationParams(sort, offset, limit);
            Set<Version> versions = catalogManager.getVersions(vf.createIRI(catalogId), vf.createIRI(recordId));
            return createPaginatedThingResponse(uriInfo, versions, sort, offset, limit, asc, null, Version.TYPE);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createVersion(ContainerRequestContext context, String catalogId, String recordId, String typeIRI,
                                  String title, String description) {
        try {
            Map<String, OrmFactory<? extends Version>> versionFactories = getVersionFactories();
            if (typeIRI == null || !versionFactories.keySet().contains(typeIRI)) {
                throw ErrorUtils.sendError("Invalid Version type", Response.Status.BAD_REQUEST);
            }
            if (title == null) {
                throw ErrorUtils.sendError("Version title is required", Response.Status.BAD_REQUEST);
            }

            Version newVersion = catalogManager.createVersion(title, description, versionFactories.get(typeIRI));
            newVersion.setProperty(getActiveUser(context, engineManager).getResource(),
                    vf.createIRI(DCTERMS.PUBLISHER.stringValue()));
            catalogManager.addVersion(vf.createIRI(catalogId), vf.createIRI(recordId), newVersion);
            return Response.status(201).entity(newVersion.getResource().stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getLatestVersion(String catalogId, String recordId) {
        try {
            Version version = catalogManager.getLatestVersion(vf.createIRI(catalogId), vf.createIRI(recordId),
                    factoryRegistry.getFactoryOfType(Version.class).get()).orElseThrow(() ->
                    ErrorUtils.sendError("Latest Version could not be found", Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(version, Version.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getVersion(String catalogId, String recordId, String versionId) {
        try {
            Version version = catalogManager.getVersion(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(versionId), factoryRegistry.getFactoryOfType(Version.class).get()).orElseThrow(() ->
                    ErrorUtils.sendError("Version " + versionId + " could not be found", Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(version, Version.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteVersion(String catalogId, String recordId, String versionId) {
        try {
            catalogManager.removeVersion(vf.createIRI(catalogId), vf.createIRI(recordId), vf.createIRI(versionId));
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateVersion(String catalogId, String recordId, String versionId, String newVersionJson) {
        try {
            Version newVersion = getNewThing(newVersionJson, vf.createIRI(versionId),
                    factoryRegistry.getFactoryOfType(Version.class).get());
            catalogManager.updateVersion(vf.createIRI(catalogId), vf.createIRI(recordId), newVersion);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getVersionedDistributions(UriInfo uriInfo, String catalogId, String recordId, String versionId,
                                              String sort, int offset, int limit, boolean asc) {
        try {
            validatePaginationParams(sort, offset, limit);
            Set<Distribution> distributions = catalogManager.getVersionedDistributions(vf.createIRI(catalogId),
                    vf.createIRI(recordId), vf.createIRI(versionId));
            return createPaginatedThingResponse(uriInfo, distributions, sort, offset, limit, asc, null,
                    Distribution.TYPE);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createVersionedDistribution(ContainerRequestContext context, String catalogId, String recordId,
                                                String versionId, String title, String description, String format,
                                                String accessURL, String downloadURL) {
        try {
            Distribution newDistribution = createDistribution(title, description, format, accessURL, downloadURL,
                    context);
            catalogManager.addVersionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(versionId), newDistribution);
            return Response.status(201).entity(newDistribution.getResource().stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getVersionedDistribution(String catalogId, String recordId, String versionId,
                                             String distributionId) {
        try {
            Distribution distribution = catalogManager.getVersionedDistribution(vf.createIRI(catalogId),
                    vf.createIRI(recordId), vf.createIRI(versionId), vf.createIRI(distributionId)).orElseThrow(() ->
                    ErrorUtils.sendError("Distribution " + distributionId + " could not be found",
                            Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(distribution, Distribution.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteVersionedDistribution(String catalogId, String recordId, String versionId,
                                                String distributionId) {
        try {
            catalogManager.removeVersionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(versionId), vf.createIRI(distributionId));
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateVersionedDistribution(String catalogId, String recordId, String versionId,
                                                String distributionId, String newDistributionJson) {
        try {
            Distribution newDistribution = getNewThing(newDistributionJson, vf.createIRI(distributionId),
                    distributionFactory);
            catalogManager.updateVersionedDistribution(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(versionId), newDistribution);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getVersionCommit(String catalogId, String recordId, String versionId, String format) {
        long start = System.currentTimeMillis();
        try {
            Commit commit = catalogManager.getTaggedCommit(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(versionId));
            return createCommitResponse(commit, format);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        } finally {
            LOG.trace("getVersionCommit took {}ms", System.currentTimeMillis() - start);
        }
    }

    @Override
    public Response getBranches(ContainerRequestContext context, UriInfo uriInfo, String catalogId, String
            recordId,
                                String sort, int offset, int limit, boolean asc, boolean applyUserFilter) {
        try {
            Set<Branch> branches = catalogManager.getBranches(vf.createIRI(catalogId), vf.createIRI(recordId));
            Function<Branch, Boolean> filterFunction = null;
            if (applyUserFilter) {
                User activeUser = getActiveUser(context, engineManager);
                filterFunction = branch -> {
                    Set<String> types = branch.getProperties(vf.createIRI(RDF.TYPE.stringValue())).stream()
                            .map(Value::stringValue)
                            .collect(Collectors.toSet());
                    return !types.contains(UserBranch.TYPE)
                            || branch.getProperty(vf.createIRI(DCTERMS.PUBLISHER.stringValue())).get()
                            .stringValue().equals(activeUser.getResource().stringValue());
                };
            }
            return createPaginatedThingResponse(uriInfo, branches, sort, offset, limit, asc, filterFunction,
                    Branch.TYPE);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createBranch(ContainerRequestContext context, String catalogId, String recordId,
                                 String typeIRI, String title, String description) {
        try {
            Map<String, OrmFactory<? extends Branch>> branchFactories = getBranchFactories();
            if (typeIRI == null || !branchFactories.keySet().contains(typeIRI)) {
                throw ErrorUtils.sendError("Invalid Branch type", Response.Status.BAD_REQUEST);
            }
            if (title == null) {
                throw ErrorUtils.sendError("Branch title is required", Response.Status.BAD_REQUEST);
            }

            Branch newBranch = catalogManager.createBranch(title, description, branchFactories.get(typeIRI));
            newBranch.setProperty(getActiveUser(context, engineManager).getResource(),
                    vf.createIRI(DCTERMS.PUBLISHER.stringValue()));
            catalogManager.addBranch(vf.createIRI(catalogId), vf.createIRI(recordId), newBranch);
            return Response.status(201).entity(newBranch.getResource().stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getMasterBranch(String catalogId, String recordId) {
        try {
            Branch masterBranch = catalogManager.getMasterBranch(vf.createIRI(catalogId), vf.createIRI(recordId));
            return Response.ok(thingToJsonObject(masterBranch, Branch.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getBranch(String catalogId, String recordId, String branchId) {
        try {
            Branch branch = catalogManager.getBranch(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(branchId), factoryRegistry.getFactoryOfType(Branch.class).get()).orElseThrow(() ->
                    ErrorUtils.sendError("Branch " + branchId + " could not be found", Response.Status.NOT_FOUND));
            return Response.ok(thingToJsonObject(branch, Branch.TYPE)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteBranch(String catalogId, String recordId, String branchId) {
        try {
            catalogManager.removeBranch(vf.createIRI(catalogId), vf.createIRI(recordId), vf.createIRI(branchId));
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateBranch(String catalogId, String recordId, String branchId, String newBranchJson) {
        try {
            Branch newBranch = getNewThing(newBranchJson, vf.createIRI(branchId),
                    factoryRegistry.getFactoryOfType(Branch.class).get());
            catalogManager.updateBranch(vf.createIRI(catalogId), vf.createIRI(recordId), newBranch);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getCommitChain(UriInfo uriInfo, String catalogId, String recordId, String branchId, int offset,
                                   int limit) {
        if (offset < 0) {
            throw ErrorUtils.sendError("Offset cannot be negative.", Response.Status.BAD_REQUEST);
        }
        if (limit < 0 || (offset > 0 && limit == 0)) {
            throw ErrorUtils.sendError("Limit must be positive.", Response.Status.BAD_REQUEST);
        }
        try {
            JSONArray commitChain = new JSONArray();
            List<Commit> commits = catalogManager.getCommitChain(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(branchId));
            Stream<Commit> result = commits.stream();
            if (limit > 0) {
                result = result.skip(offset)
                        .limit(limit);
            }
            result.map(this::createCommitJson).forEach(commitChain::add);
            return createPaginatedResponseWithJson(uriInfo, commitChain, commits.size(), limit, offset);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createBranchCommit(ContainerRequestContext context, String catalogId, String recordId,
                                       String branchId, String message) {
        try {
            if (message == null) {
                throw ErrorUtils.sendError("Commit message is required", Response.Status.BAD_REQUEST);
            }
            User activeUser = getActiveUser(context, engineManager);
            Resource newCommitId = versioningManager.commit(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(branchId), activeUser, message);
            return Response.status(201).entity(newCommitId.stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getHead(String catalogId, String recordId, String branchId, String format) {
        long start = System.currentTimeMillis();
        try {
            Commit headCommit = catalogManager.getHeadCommit(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(branchId));
            return createCommitResponse(headCommit, format);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        } finally {
            LOG.trace("getHead took {}ms", System.currentTimeMillis() - start);
        }
    }

    @Override
    public Response getBranchCommit(String catalogId, String recordId, String branchId, String commitId,
                                    String format) {
        long start = System.currentTimeMillis();
        try {
            Commit commit = catalogManager.getCommit(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(branchId), vf.createIRI(commitId)).orElseThrow(() ->
                    ErrorUtils.sendError("Commit " + commitId + " could not be found", Response.Status.NOT_FOUND));
            return createCommitResponse(commit, format);
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        } finally {
            LOG.trace("getBranchCommit took {}ms", System.currentTimeMillis() - start);
        }
    }

    @Override
    public Response getConflicts(String catalogId, String recordId, String branchId, String targetBranchId,
                                 String rdfFormat) {
        try {
            Resource catalogIRI = vf.createIRI(catalogId);
            Resource recordIRI = vf.createIRI(recordId);
            Commit sourceHead = catalogManager.getHeadCommit(catalogIRI, recordIRI, vf.createIRI(branchId));
            Commit targetHead = catalogManager.getHeadCommit(catalogIRI, recordIRI, vf.createIRI(targetBranchId));
            Set<Conflict> conflicts = catalogManager.getConflicts(sourceHead.getResource(), targetHead.getResource());
            JSONArray array = new JSONArray();
            conflicts.stream()
                    .map(conflict -> conflictToJson(conflict, rdfFormat))
                    .forEach(array::add);
            return Response.ok(array).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response merge(ContainerRequestContext context, String catalogId, String recordId, String sourceBranchId,
                          String targetBranchId, String additionsJson, String deletionsJson) {
        try {
            User activeUser = getActiveUser(context, engineManager);
            Model additions = StringUtils.isEmpty(additionsJson) ? null : convertJsonld(additionsJson);
            Model deletions = StringUtils.isEmpty(deletionsJson) ? null : convertJsonld(deletionsJson);
            Resource newCommitId = versioningManager.merge(vf.createIRI(catalogId), vf.createIRI(recordId),
                    vf.createIRI(sourceBranchId), vf.createIRI(targetBranchId), activeUser, additions, deletions);
            return Response.ok(newCommitId.stringValue()).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getCompiledResource(ContainerRequestContext context, String catalogId, String recordId,
                                        String branchId, String commitId, String rdfFormat, boolean apply) {
        try {
            Resource catalogIRI = vf.createIRI(catalogId);
            Resource recordIRI = vf.createIRI(recordId);
            Resource commitIRI = vf.createIRI(commitId);
            catalogManager.getCommit(catalogIRI, recordIRI, vf.createIRI(branchId), commitIRI);
            Model resource = catalogManager.getCompiledResource(commitIRI);
            if (apply) {
                User activeUser = getActiveUser(context, engineManager);
                Optional<InProgressCommit> inProgressCommit = catalogManager.getInProgressCommit(catalogIRI, recordIRI,
                        activeUser);
                if (inProgressCommit.isPresent()) {
                    resource = catalogManager.applyInProgressCommit(inProgressCommit.get().getResource(), resource);
                }
            }
            return Response.ok(getModelInFormat(resource, rdfFormat)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response downloadCompiledResource(ContainerRequestContext context, String catalogId, String recordId,
                                             String branchId, String commitId, String rdfFormat, boolean apply,
                                             String fileName) {
        try {
            Resource catalogIRI = vf.createIRI(catalogId);
            Resource recordIRI = vf.createIRI(recordId);
            Resource commitIRI = vf.createIRI(commitId);
            catalogManager.getCommit(catalogIRI, recordIRI, vf.createIRI(branchId), commitIRI);
            Model resource;
            Model temp = catalogManager.getCompiledResource(vf.createIRI(commitId));
            if (apply) {
                User activeUser = getActiveUser(context, engineManager);
                Optional<InProgressCommit> inProgressCommit = catalogManager.getInProgressCommit(catalogIRI, recordIRI,
                        activeUser);
                resource = inProgressCommit.map(inProgressCommit1 ->
                        catalogManager.applyInProgressCommit(inProgressCommit1.getResource(), temp)).orElse(temp);
            } else {
                resource = temp;
            }
            StreamingOutput stream = os -> {
                Writer writer = new BufferedWriter(new OutputStreamWriter(os));
                writer.write(getModelInFormat(resource, rdfFormat));
                writer.flush();
                writer.close();
            };

            return Response.ok(stream).header("Content-Disposition", "attachment;filename=" + fileName
                    + "." + getRDFFormatFileExtension(rdfFormat))
                    .header("Content-Type", getRDFFormatMimeType(rdfFormat)).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response createInProgressCommit(ContainerRequestContext context, String catalogId, String recordId) {
        try {
            User activeUser = getActiveUser(context, engineManager);
            InProgressCommit inProgressCommit = catalogManager.createInProgressCommit(activeUser);
            catalogManager.addInProgressCommit(vf.createIRI(catalogId), vf.createIRI(recordId), inProgressCommit);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getInProgressCommit(ContainerRequestContext context, String catalogId, String recordId,
                                        String format) {
        try {
            User activeUser = getActiveUser(context, engineManager);
            InProgressCommit inProgressCommit = catalogManager.getInProgressCommit(vf.createIRI(catalogId),
                    vf.createIRI(recordId), activeUser).orElseThrow(() ->
                    ErrorUtils.sendError("InProgressCommit could not be found", Response.Status.NOT_FOUND));
            return Response.ok(getCommitDifferenceObject(inProgressCommit.getResource(), format),
                    MediaType.APPLICATION_JSON).build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response deleteInProgressCommit(ContainerRequestContext context, String catalogId, String recordId) {
        try {
            User activeUser = getActiveUser(context, engineManager);
            catalogManager.removeInProgressCommit(vf.createIRI(catalogId), vf.createIRI(recordId), activeUser);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response updateInProgressCommit(ContainerRequestContext context, String catalogId, String recordId,
                                           String additionsJson, String deletionsJson) {
        try {
            User activeUser = getActiveUser(context, engineManager);
            Model additions = StringUtils.isEmpty(additionsJson) ? null : convertJsonld(additionsJson);
            Model deletions = StringUtils.isEmpty(deletionsJson) ? null : convertJsonld(deletionsJson);
            catalogManager.updateInProgressCommit(vf.createIRI(catalogId), vf.createIRI(recordId), activeUser,
                    additions, deletions);
            return Response.ok().build();
        } catch (IllegalArgumentException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        } catch (IllegalStateException | MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Response getRecordTypes() {
        try {
            return Response.ok(JSONArray.fromObject(getRecordFactories().keySet())).build();
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        }
    }

    @Override
    public Response getSortOptions() {
        try {
            return Response.ok(JSONArray.fromObject(SORT_RESOURCES)).build();
        } catch (MatOntoException ex) {
            throw ErrorUtils.sendError(ex, ex.getMessage(), Response.Status.BAD_REQUEST);
        }
    }

    /**
     * Creates the JSONObject to be returned in the commit chain to more easily work with the data associated with the
     * Commit.
     *
     * @param commit The Commit object to parse data from.
     * @return JSONObject with the necessary information set.
     */
    private JSONObject createCommitJson(Commit commit) {
        Literal emptyLiteral = vf.createLiteral("");
        Value creatorIRI = commit.getProperty(vf.createIRI(Activity.wasAssociatedWith_IRI))
                .orElse(null);
        Value date = commit.getProperty(vf.createIRI(InstantaneousEvent.atTime_IRI))
                .orElse(emptyLiteral);
        String message = commit.getProperty(vf.createIRI(DCTERMS.TITLE.stringValue()))
                .orElse(emptyLiteral).stringValue();
        String baseCommit = commit.getProperty(vf.createIRI(Commit.baseCommit_IRI))
                .orElse(emptyLiteral).stringValue();
        String auxCommit = commit.getProperty(vf.createIRI(Commit.auxiliaryCommit_IRI))
                .orElse(emptyLiteral).stringValue();
        User creator = engineManager.retrieveUser(engineManager.getUsername((Resource) creatorIRI)
                .orElse("")).orElse(null);
        JSONObject creatorObject = new JSONObject();
        if (creator != null) {
            creatorObject.element("firstName", creator.getFirstName().stream().findFirst()
                    .orElse(emptyLiteral).stringValue())
                    .element("lastName", creator.getLastName().stream().findFirst().orElse(emptyLiteral)
                            .stringValue())
                    .element("username", creator.getUsername().orElse(emptyLiteral).stringValue());
        }

        return new JSONObject()
                .element("id", commit.getResource().stringValue())
                .element("creator", creatorObject)
                .element("date", date.stringValue())
                .element("message", message)
                .element("base", baseCommit)
                .element("auxiliary", auxCommit);
    }

    /**
     * Creates a Response for a list of paginated Things based on the passed URI information, page of items, the total
     * number of Things, the limit for each page, and the offset for the current page. Sets the "X-Total-Count" header
     * to the total size and the "Links" header to the next and prev URLs if present.
     *
     * @param uriInfo   The URI information of the request.
     * @param items     The limited and sorted Collection of items for the current page
     * @param totalSize The total number of items.
     * @param limit     The limit for each page.
     * @param offset    The offset for the current page.
     * @param <T>       A class that extends Thing
     * @return A Response with the current page of Things and headers for the total size and links to the next and prev
     *      pages if present.
     */
    private <T extends Thing> Response createPaginatedResponse(UriInfo uriInfo, Collection<T> items, int totalSize,
                                                               int limit, int offset, String type) {
        JSONArray results = JSONArray.fromObject(items.stream()
                .map(thing -> thingToJsonObject(thing, type))
                .collect(Collectors.toList()));
        return createPaginatedResponseWithJson(uriInfo, results, totalSize, limit, offset);
    }

    private Response createPaginatedResponseWithJson(UriInfo uriInfo, JSONArray items, int totalSize, int limit, int offset) {
        Links links = LinksUtils.buildLinks(uriInfo, items.size(), totalSize, limit, offset);
        Response.ResponseBuilder response = Response.ok(items).header("X-Total-Count", totalSize);
        if (links.getNext() != null) {
            response = response.link(links.getBase() + links.getNext(), "next");
        }
        if (links.getPrev() != null) {
            response = response.link(links.getBase() + links.getPrev(), "prev");
        }
        return response.build();
    }

    /**
     * Creates a Response for a page of a sorted limited offset Set of Things based on the return type of the passed
     * function using the passed full Set of Resources.
     *
     * @param uriInfo        The URI information of the request.
     * @param things         The Set of Things.
     * @param sortBy         The property IRI string to sort the Set of Things by.
     * @param offset         The number of Things to skip.
     * @param limit          The size of the page of Things to the return.
     * @param asc            Whether the sorting should be ascending or descending.
     * @param filterFunction A Function to filter the set of Things.
     * @param <T>            A class that extends Thing.
     * @return A Response with a page of Things that has been filtered, sorted, and limited and headers for the total
     *      size and links to the next and prev pages if present.
     */
    private <T extends Thing> Response createPaginatedThingResponse(UriInfo uriInfo, Set<T> things, String sortBy,
                                                                    int offset, int limit, boolean asc,
                                                                    Function<T, Boolean> filterFunction, String type) {
        if (offset > things.size()) {
            throw ErrorUtils.sendError("Offset exceeds total size", Response.Status.BAD_REQUEST);
        }
        IRI sortIRI = vf.createIRI(sortBy);
        Comparator<T> comparator = Comparator.comparing(dist -> dist.getProperty(sortIRI).get().stringValue());
        Stream<T> stream = things.stream();
        if (!asc) {
            comparator = comparator.reversed();
        }
        if (filterFunction != null) {
            stream = stream.filter(filterFunction::apply);
        }
        List<T> filteredThings = stream.collect(Collectors.toList());
        List<T> result = filteredThings.stream()
                .sorted(comparator)
                .skip(offset)
                .limit(limit)
                .collect(Collectors.toList());
        return createPaginatedResponse(uriInfo, result, filteredThings.size(), limit, offset, type);
    }

    /**
     * Creates a Response for a Commit and its addition and deletion statements in the specified format. The JSONObject
     * in the Response has key "commit" with value of the Commit's JSON-LD and the keys and values of the result of
     * getCommitDifferenceObject.
     *
     * @param commit The Commit to create a response for
     * @param format The RDF format to return the addition and deletion statements in.
     * @return A Response containing a JSONObject with the Commit JSON-LD and its addition and deletion statements
     */
    private Response createCommitResponse(Commit commit, String format) {
        long start = System.currentTimeMillis();
        try {
            String differences = getCommitDifferenceJsonString(commit.getResource(), format);
            String response = differences.subSequence(0, differences.length() - 1) + ", \"commit\": "
                    + thingToJsonObject(commit, Commit.TYPE).toString() + "}";
            return Response.ok(response, MediaType.APPLICATION_JSON).build();
        } finally {
            LOG.trace("createCommitResponse took {}ms", System.currentTimeMillis() - start);
        }
    }

    /**
     * Creates a JSONObject for the Difference statements in the specified RDF format of the Commit with the specified
     * id. Key "additions" has value of the Commit's addition statements and key "deletions" has value of the Commit's
     * deletion statements.
     *
     * @param commitId The id of the Commit to retrieve the Difference of.
     * @param format   A string representing the RDF format to return the statements in.
     * @return A JSONObject with a key for the Commit's addition statements and a key for the Commit's deletion
     *      statements.
     */
    private JSONObject getCommitDifferenceObject(Resource commitId, String format) {
        long start = System.currentTimeMillis();
        try {
            return getDifferenceJson(catalogManager.getCommitDifference(commitId), format);
        } finally {
            LOG.trace("getCommitDifferenceObject took {}ms", System.currentTimeMillis() - start);
        }
    }

    private String getCommitDifferenceJsonString(Resource commitId, String format) {
        long start = System.currentTimeMillis();
        try {
            return getDifferenceJsonString(catalogManager.getCommitDifference(commitId), format);
        } finally {
            LOG.trace("getCommitDifferenceJsonString took {}ms", System.currentTimeMillis() - start);
        }
    }

    /**
     * Creates a JSONObject for the Difference statements in the specified RDF format. Key "additions" has value of the
     * Difference's addition statements and key "deletions" has value of the Difference's deletion statements.
     *
     * @param difference The Difference to convert into a JSONObject.
     * @param format     A String representing the RDF format to return the statements in.
     * @return A JSONObject with a key for the Difference's addition statements and a key for the Difference's deletion
     *      statements.
     */
    private JSONObject getDifferenceJson(Difference difference, String format) {
        long start = System.currentTimeMillis();
        try {
            return new JSONObject().element("additions", getModelInFormat(difference.getAdditions(), format))
                    .element("deletions", getModelInFormat(difference.getDeletions(), format));
        } finally {
            LOG.trace("getDifferenceJson took {}ms", System.currentTimeMillis() - start);
        }
    }

    private String getDifferenceJsonString(Difference difference, String format) {
        long start = System.currentTimeMillis();
        try {
            return "{ \"additions\": " + getModelInFormat(difference.getAdditions(), format) + ", \"deletions\": "
                    + getModelInFormat(difference.getDeletions(), format) + "}";
        } finally {
            LOG.trace("getDifferenceJsonString took {}ms", System.currentTimeMillis() - start);
        }
    }

    /**
     * Validates the sort property IRI, offset, and limit parameters for pagination. The sort IRI string must be a valid
     * sort property. The offset must be greater than or equal to 0. The limit must be postitive. If any parameters are
     * invalid, throws a 400 Response.
     *
     * @param sortIRI The sort property string to test.
     * @param offset  The offset for the paginated response.
     * @param limit   The limit of the paginated response.
     */
    private void validatePaginationParams(String sortIRI, int offset, int limit) {
        if (!SORT_RESOURCES.contains(sortIRI)) {
            throw ErrorUtils.sendError("Invalid sort property IRI", Response.Status.BAD_REQUEST);
        }
        LinksUtils.validateParams(limit, offset);
    }

    /**
     * Creates a Distribution object using the provided metadata strings. If the title is null, throws a 400 Response.
     *
     * @param title       The required title for the new Distribution.
     * @param description The optional description for the new Distribution.
     * @param format      The optional format string for the new Distribution.
     * @param accessURL   The optional access URL for the new Distribution.
     * @param downloadURL The optional download URL for the Distribution.
     * @return The new Distribution if passed a title.
     */
    private Distribution createDistribution(String title, String description, String format, String accessURL,
                                            String downloadURL, ContainerRequestContext context) {
        if (title == null) {
            throw ErrorUtils.sendError("Distribution title is required", Response.Status.BAD_REQUEST);
        }
        DistributionConfig.Builder builder = new DistributionConfig.Builder(title);
        if (description != null) {
            builder.description(description);
        }
        if (format != null) {
            builder.format(format);
        }
        if (accessURL != null) {
            builder.accessURL(vf.createIRI(accessURL));
        }
        if (downloadURL != null) {
            builder.downloadURL(vf.createIRI(downloadURL));
        }
        Distribution distribution = catalogManager.createDistribution(builder.build());
        distribution.setProperty(getActiveUser(context, engineManager).getResource(),
                vf.createIRI(DCTERMS.PUBLISHER.stringValue()));
        return distribution;
    }

    /**
     * Attempts to retrieve a new Thing from the passed JSON-LD string based on the type of the passed OrmFactory. If
     * the passed JSON-LD does not contain the passed ID Resource defined as the correct type, throws a 400 Response.
     *
     * @param newThingJson The JSON-LD of the new Thing.
     * @param thingId      The ID Resource to confirm.
     * @param factory      The OrmFactory to use when creating the new Thing.
     * @param <T>          A class that extends Thing.
     * @return The new Thing if the JSON-LD contains the correct ID Resource; throws a 400 otherwise.
     */
    private <T extends Thing> T getNewThing(String newThingJson, Resource thingId, OrmFactory<T> factory) {
        Model newThingModel = convertJsonld(newThingJson);
        return factory.getExisting(thingId, newThingModel).orElseThrow(() ->
                ErrorUtils.sendError(factory.getTypeIRI().getLocalName() + " IDs must match",
                        Response.Status.BAD_REQUEST));
    }

    /**
     * Creates a JSONObject representing the provided Conflict in the provided RDF format. Key "original" has value of
     * the serialized original Model of a conflict, key "left" has a value of an object with the additions and
     *
     * @param conflict  The Conflict to turn into a JSONObject
     * @param rdfFormat A string representing the RDF format to return the statements in.
     * @return A JSONObject with a key for the Conflict's original Model, a key for the Conflict's left Difference,
     *      and a key for the Conflict's right Difference.
     */
    private JSONObject conflictToJson(Conflict conflict, String rdfFormat) {
        JSONObject object = new JSONObject();
        object.put("iri", conflict.getIRI().stringValue());
        object.put("original", getModelInFormat(conflict.getOriginal(), rdfFormat));
        object.put("left", getDifferenceJson(conflict.getLeftDifference(), rdfFormat));
        object.put("right", getDifferenceJson(conflict.getRightDifference(), rdfFormat));
        return object;
    }

    /**
     * Converts a Thing into a JSON-LD string.
     *
     * @param thing The Thing whose Model will be converted.
     * @return A JSON-LD string for the Thing's Model.
     */
    private String thingToJsonld(Thing thing) {
        return modelToJsonld(thing.getModel());
    }

    /**
     * Coverts a Model into a JSON-LD string.
     *
     * @param model The Model to convert.
     * @return A JSON-LD string for the Model.
     */
    private String modelToJsonld(Model model) {
        return getModelInFormat(model, "jsonld");
    }

    /**
     * Converts a Model into a string of the provided RDF format, grouping statements by subject and predicate.
     *
     * @param model  The Model to convert.
     * @param format A string representing the RDF format to return the Model in.
     * @return A String of the converted Model in the requested RDF format.
     */
    private String getModelInFormat(Model model, String format) {
        return modelToString(transformer.sesameModel(model), format);
    }

    /**
     * Converts a JSON-LD string into a Model.
     *
     * @param jsonld The string of JSON-LD to convert.
     * @return A Model containing the statements from the JSON-LD string.
     */
    private Model convertJsonld(String jsonld) {
        return bNodeService.deskolemize(transformer.matontoModel(jsonldToModel(jsonld)));
    }


    /**
     * Converts a Thing into a JSONObject by the first object of a specific type in the JSON-LD serialization of the
     * Thing's Model.
     *
     * @param thing The Thing to convert into a JSONObject.
     * @return The JSONObject with the JSON-LD of the Thing entity from its Model.
     */
    private JSONObject thingToJsonObject(Thing thing, String type) {
        long start = System.currentTimeMillis();
        try {
            return getTypedObjectFromJsonld(thingToJsonld(thing), type);
        } finally {
            LOG.trace("thingToJsonObject took {}ms", System.currentTimeMillis() - start);
        }
    }

    private Map<String, OrmFactory<? extends Record>> getRecordFactories() {
        return getThingFactories(Record.class);
    }

    private Map<String, OrmFactory<? extends Version>> getVersionFactories() {
        return getThingFactories(Version.class);
    }

    private Map<String, OrmFactory<? extends Branch>> getBranchFactories() {
        return getThingFactories(Branch.class);
    }

    private <T extends Thing> Map<String, OrmFactory<? extends T>> getThingFactories(Class<T> clazz) {
        Map<String, OrmFactory<? extends T>> factoryMap = new HashMap<>();
        factoryRegistry.getFactoriesOfType(clazz).forEach(factory ->
                factoryMap.put(factory.getTypeIRI().stringValue(), factory));
        return factoryMap;
    }
}
