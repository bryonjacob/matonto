package org.matonto.ontology.core.api;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Map;
import java.util.Optional;

import org.matonto.ontology.core.utils.MatontoOntologyException;


public interface OntologyManager {
	
	Ontology createOntology(OntologyId ontologyId) throws MatontoOntologyException;
	
	Ontology createOntology(File file, OntologyId ontologyId) throws MatontoOntologyException, FileNotFoundException;
	
	Ontology createOntology(OntologyIRI iri, OntologyId ontologyId) throws MatontoOntologyException;
	
	Ontology createOntology(InputStream inputStream, OntologyId ontologyId) throws MatontoOntologyException;
	
	Optional<Ontology> retrieveOntology(OntologyId ontologyId) throws MatontoOntologyException;

	/**
	 * Persists Ontology object in the repository, and returns true if successfully persisted
	 *
	 * @return True if successfully persisted
	 * @throws IllegalStateException - if the repository is null
     * @throws MatontoOntologyException - if an exception occurs while persisting
	 */
	boolean storeOntology(Ontology ontology) throws MatontoOntologyException;

    /**
     * Deletes the ontology with the given OntologyId, and returns true if successfully removed. The identifier
     * used matches the rules for OntologyId.getOntologyIdentifier():
     *
     * <ol>
     *     <li>If a Version IRI is present, the ontology identifier will match the Version IRI</li>
     *     <li>Else if an Ontology IRI is present, the ontology identifier will match the Ontology IRI</li>
     *     <li>Else if neither are present, the ontology identifier will be a system generated blank node</li>
     * </ol>
     *
     * @return True if the name graph with given context id is successfully deleted, or false if ontology Id
     * does not exist in the repository or if an owlapi exception or sesame exception is caught.
     * @throws IllegalStateException - if the repository is null
     */
	boolean deleteOntology(OntologyId ontologyId) throws MatontoOntologyException;

	Optional<Map<OntologyId, String>> getOntologyRegistry() throws MatontoOntologyException;
	
	OntologyId createOntologyId();
	
	OntologyId createOntologyId(OntologyIRI ontologyIRI);
	
	OntologyId createOntologyId(OntologyIRI ontologyIRI, OntologyIRI versionIRI);
	
	OntologyIRI createOntologyIRI(String ns, String ln);
	
	OntologyIRI createOntologyIRI(String iriString);
	
}
