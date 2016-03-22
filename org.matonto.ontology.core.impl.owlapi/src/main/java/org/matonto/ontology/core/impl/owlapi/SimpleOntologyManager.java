package org.matonto.ontology.core.impl.owlapi;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import javax.annotation.Nonnull;

import org.matonto.ontology.core.api.Ontology;
import org.matonto.ontology.core.api.OntologyId;
import org.matonto.ontology.core.api.OntologyManager;
import org.matonto.ontology.core.utils.MatontoOntologyException;
import org.matonto.ontology.utils.api.SesameTransformer;
import org.matonto.rdf.api.*;
import org.matonto.rdf.api.IRI;
import org.matonto.repository.api.Repository;
import org.matonto.repository.api.RepositoryConnection;
import org.matonto.repository.api.RepositoryManager;
import org.matonto.repository.base.RepositoryResult;
import org.matonto.repository.exception.RepositoryException;
import org.openrdf.rio.RDFFormat;
import org.openrdf.rio.Rio;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.formats.RioRDFXMLDocumentFormatFactory;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.rio.RioMemoryTripleSource;
import org.semanticweb.owlapi.rio.RioParserImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import aQute.bnd.annotation.component.*;


@Component (immediate=true, 
            provide = OntologyManager.class,
            name = SimpleOntologyManager.COMPONENT_NAME,
            configurationPolicy = ConfigurationPolicy.require)
public class SimpleOntologyManager implements OntologyManager {
	
    protected static final String COMPONENT_NAME = "org.matonto.ontology.core.OntologyManager";
    private RepositoryManager repositoryManager;
	private static Repository repository;
    private static ValueFactory factory;
	private static Map<Resource, String> ontologyRegistry = new HashMap<>();
	private static final Logger LOG = LoggerFactory.getLogger(SimpleOntologyManager.class);
    private SesameTransformer transformer;
    private ModelFactory modelFactory;
	
	public SimpleOntologyManager() {}
	
    @Activate
    public void activate(final Map<String, Object> properties) {
        LOG.info("Activating " + COMPONENT_NAME);
        setPropertyValues(properties);
    }
 
    @Deactivate
    public void deactivate() {
        LOG.info("Deactivating " + COMPONENT_NAME);
    }
    
    @Modified
    public void modified(final Map<String, Object> properties) {
        LOG.info("Modifying the " + COMPONENT_NAME);
        setPropertyValues(properties);
    }
    
    private void setPropertyValues(Map<String, Object> properties) {
        if (properties.containsKey("repositoryId") && !properties.get("repositoryId").equals("")) {
            getRepository((String)properties.get("repositoryId"));
            LOG.info("repositoryId - " + properties.get("repositoryId"));
            initOntologyRegistry();
        } else {
            LOG.error("Unable to activate Ontology Manager: Unable to set repositoryId");
            throw new IllegalStateException("Unable to set repositoryId");
        }
    }

    @Reference
    public void setRepositoryManager(RepositoryManager repositoryManager) {
        this.repositoryManager = repositoryManager;
    }

    protected void getRepository(String repositoryId) {
        if(repositoryManager == null)
            throw new IllegalStateException("Repository Manager is null");
        
        Optional<Repository> optRepo = repositoryManager.getRepository(repositoryId);
        if(optRepo.isPresent())
            setRepo(optRepo.get());
        else
            throw new IllegalStateException("Repository does not exist");
    }
    
    protected void setRepo(Repository repo) {
        repository = repo;
    }

    @Reference
    protected void setValueFactory(final ValueFactory vf) {
        factory = vf;
    }

    @Reference
    protected void setTransformer(final SesameTransformer transformer) {
        this.transformer = transformer;
    }

    @Reference
    protected void setModelFactory(final ModelFactory modelFactory) {
        this.modelFactory = modelFactory;
    }
	
	@Override
	public Map<Resource, String> getOntologyRegistry() {
		return ontologyRegistry;
	}

	@Override
	public Ontology createOntology(OntologyId ontologyId) throws MatontoOntologyException {
		return new SimpleOntology(ontologyId, this);
	}

	@Override
	public Ontology createOntology(File file) throws MatontoOntologyException, FileNotFoundException {
		return new SimpleOntology(file, this);
	}

	@Override
	public Ontology createOntology(IRI iri) throws MatontoOntologyException {
		return new SimpleOntology(iri, this);
	}

	@Override
	public Ontology createOntology(InputStream inputStream) throws MatontoOntologyException {
		return new SimpleOntology(inputStream, this);
	}

    @Override
    public Ontology createOntology(String json) throws MatontoOntologyException {
        return new SimpleOntology(json, this);
    }
	
	/**
	 * Checks if given context id exists in the repository, and returns true if it does.
	 * 
	 * @return True if given context id exists in the repository, or else false.
	 * @throws IllegalStateException - if the repository is null
	 */
	public boolean ontologyExists(@Nonnull Resource resource) {
        return ontologyRegistry.containsKey(resource);
	}
	
	/**
	 * Retrieves Ontology object by ontology id from the repository, and returns an Optional with Ontology 
	 * object or an empty Optional instance if the ontology id is not found or any owlapi exception or sesame 
	 * exception is caught.   
	 * 
	 * @return an Optional with Ontology if ontology id is found, or an empty Optional instance if not found.
	 * @throws IllegalStateException - if the repository is null
	 */
	@Override
	public Optional<Ontology> retrieveOntology(@Nonnull Resource resource) throws MatontoOntologyException {
		if(repository == null)
			throw new IllegalStateException("Repository is null");
   	 
		if(!ontologyExists(resource))
			return Optional.empty();

		OWLOntologyManager mgr = OWLManager.createOWLOntologyManager();
		OWLOntology onto = null;
		RepositoryConnection conn = null;
		
		try {
			conn = repository.getConnection();
            RepositoryResult<Statement> stmts = conn.getStatements(null, null, null, resource);
            org.openrdf.model.Model sesameModel = new org.openrdf.model.impl.LinkedHashModel();
            stmts.forEach(stmt -> sesameModel.add(transformer.sesameStatement(stmt)));
	    	RioParserImpl parser = new RioParserImpl(new RioRDFXMLDocumentFormatFactory());
	    	onto = mgr.createOntology();
	    	OWLOntologyLoaderConfiguration config = new OWLOntologyLoaderConfiguration().setMissingImportHandlingStrategy(MissingImportHandlingStrategy.SILENT);
	    	parser.parse(new RioMemoryTripleSource(sesameModel), onto, config);
	    	
		} catch (OWLOntologyCreationException | IOException e) {
			throw new MatontoOntologyException("Unable to create an ontology object", e);
		} catch (RepositoryException e) {
			throw new MatontoOntologyException("Error in repository connection", e);
        } finally {
			closeConnection(conn);
		}

		Ontology matontoOntology = SimpleOntologyValues.matontoOntology(onto, resource);
		
		return Optional.of(matontoOntology);
	}
	
	@Override
	public boolean storeOntology(@Nonnull Ontology ontology) throws MatontoOntologyException {
        if(repository == null)
            throw new IllegalStateException("Repository is null");

        Resource resource = ontology.getOntologyId().getOntologyIdentifier();
        if(ontologyExists(resource))
            throw new MatontoOntologyException("Ontology with the ontology ID already exists.");

        RepositoryConnection conn = null;

        try {
            Model model = ontology.asModel(modelFactory);
            conn = repository.getConnection();
            conn.add(model, resource);
            ontologyRegistry.put(resource, repository.getConfig().id());
        } catch (RepositoryException e) {
            throw new MatontoOntologyException("Error in repository connection", e);
        } finally {
            closeConnection(conn);
        }

        return true;
	}

	@Override
    public boolean updateOntology(Resource ontologyResource, Resource originalChangedResource, String resourceJson) throws MatontoOntologyException {
        if (repository == null)
            throw new IllegalStateException("Repository is null");

        if(!ontologyExists(ontologyResource))
            throw new MatontoOntologyException("Ontology ID does not exist.");

        RepositoryConnection conn = null;

        try {
            InputStream in = new ByteArrayInputStream(resourceJson.getBytes(StandardCharsets.UTF_8));
            Model changedModel = transformer.matontoModel(Rio.parse(in, "", RDFFormat.JSONLD));

            conn = repository.getConnection();
            RepositoryResult<Statement> changedStatements = conn.getStatements(originalChangedResource, null, null, ontologyResource);

			conn.remove(changedStatements, ontologyResource);
			conn.add(changedModel, ontologyResource);

            // TODO: handle ontology iri changes
            /*if(!changedModel.contains(originalChangedResource, null, null, ontologyResource)) {
            	RepositoryResult<Statement> dependentStatements = conn.getStatements(null, null, originalChangedResource, ontologyResource);
                conn.remove(dependentStatements, ontologyResource);

                Set<Statement> changedDependentStatements = new HashSet<>();
                Value newObject = changedModel.objects().iterator().next();

                while(dependentStatements.hasNext()) {
                    Statement statement = dependentStatements.next();
                    changedDependentStatements.add(factory.createStatement(statement.getSubject(), statement.getPredicate(), newObject, ontologyResource));
                }

                conn.add(changedDependentStatements, ontologyResource);
			}*/
        } catch (RepositoryException e) {
            throw new MatontoOntologyException("Error in repository connection", e);
        } catch (IOException|org.openrdf.rio.RDFParseException e) {
            throw new MatontoOntologyException("Error in parsing resourceJson", e);
        } finally {
            closeConnection(conn);
        }

        return true;
    }
	
	@Override
	public boolean deleteOntology(@Nonnull Resource resource) throws MatontoOntologyException {
		if(repository == null)
			throw new IllegalStateException("Repository is null");
		
		if(!ontologyExists(resource))
			throw new MatontoOntologyException("Ontology ID does not exist.");
		
		RepositoryConnection conn = null;
		
		try {
			conn = repository.getConnection();
            conn.clear(resource);
			ontologyRegistry.remove(resource, repository.getConfig().id());
		} catch (RepositoryException e) {
			throw new MatontoOntologyException("Error in repository connection", e);
		} finally {
            closeConnection(conn);
		}
		
		return true;
	}

	/**
	 * The ontology registry facilitates the list of the association of ontologies 
	 * stored in different repositories. When the registry is initialized (loaded) when
	 * an instance of SimpleOntologyManager is created.  
	 * 
	 * @throws IllegalStateException - if the repository is null
	 */
	private void initOntologyRegistry() throws MatontoOntologyException {
		LOG.info("Initiating the ontology registry");
		
		if(repository == null)
			throw new IllegalStateException("Repository is null");
		
		RepositoryConnection conn = null;
		RepositoryResult<Resource> contextIds = null;
		
		try {
			conn = repository.getConnection();
			contextIds = conn.getContextIDs();
			
			while (contextIds.hasNext()) {
				Resource contextId = contextIds.next();
				ontologyRegistry.put(contextId, repository.getConfig().id());
			}

		} catch (RepositoryException e) {
			throw new MatontoOntologyException("Error in repository connection", e);
		} finally {
			try {
				if(contextIds != null) 
	            	contextIds.close();
			} catch (RepositoryException e) {
                LOG.warn("Could not close ResultSet." + e.toString());
			}
            closeConnection(conn);
		}
		
	}

	@Override
    public OntologyId createOntologyId() {
        return new SimpleOntologyId.Builder(factory).build();
    }
	
	@Override
	public OntologyId createOntologyId(Resource resource) {
	    return new SimpleOntologyId.Builder(factory).id(resource).build();
	}

	@Override
    public OntologyId createOntologyId(IRI ontologyIRI) {
        return new SimpleOntologyId.Builder(factory).ontologyIRI(ontologyIRI).build();
    }

	@Override
    public OntologyId createOntologyId(IRI ontologyIRI, IRI versionIRI) {
        return new SimpleOntologyId.Builder(factory).ontologyIRI(ontologyIRI).versionIRI(versionIRI).build();
    }

    private void closeConnection(RepositoryConnection conn) {
        try {
            if(conn != null)
                conn.close();
        } catch (RepositoryException e) {
            LOG.warn("Could not close Repository." + e.toString());
        }
    }

    @Override
	public SesameTransformer getTransformer() {
        return transformer;
    }
}
