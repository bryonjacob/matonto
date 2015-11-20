package org.matonto.ontology.core.impl.owlapi;


import java.util.HashSet;
import java.util.Set;

import org.matonto.ontology.core.api.OntologyIRI;
import org.semanticweb.owlapi.vocab.Namespaces;

import com.google.common.base.Preconditions;


public enum SimpleFacet {

	LENGTH(Namespaces.XSD, "length", "length"), 
	MIN_LENGTH(Namespaces.XSD, "minLength", "minLength"), 
	MAX_LENGTH(Namespaces.XSD, "maxLength", "maxLength"), 
	PATTERN(Namespaces.XSD, "pattern", "pattern"), 
	MIN_INCLUSIVE(Namespaces.XSD, "minInclusive", ">="), 
	MIN_EXCLUSIVE(Namespaces.XSD, "minExclusive", ">"), 
	MAX_INCLUSIVE(Namespaces.XSD, "maxInclusive", "<="), 
	MAX_EXCLUSIVE(Namespaces.XSD, "maxExclusive", "<"), 
	TOTAL_DIGITS(Namespaces.XSD, "totalDigits", "totalDigits"), 
	FRACTION_DIGITS(Namespaces.XSD, "fractionDigits", "fractionDigits"), 
	LANG_RANGE(Namespaces.RDF, "langRange", "langRange");
	
	private final OntologyIRI iri;	
	private final String shortForm;	
	private final String symbolicForm;	
	private final String prefixedName;
	
	private SimpleFacet( Namespaces ns,  String shortForm,  String symbolicForm)
	{
		iri = SimpleIRI.create(ns.toString(), shortForm);
		this.shortForm = shortForm;
		this.symbolicForm = symbolicForm;
		prefixedName = (ns.getPrefixName() + ':' + shortForm);
	}
	   
	
	public String getShortForm()
	{
		return shortForm;
	}
	
	
	public OntologyIRI getOntologyIRI()
	{
		return iri;
	}
	
	
	public String getSymbolicForm()
	{
		return symbolicForm;
	}
	
	
	public String getPrefixedName()
	{
		return prefixedName;
	}
	
	
	@Override
	public String toString()
	{
		return getShortForm();
	}
	
	
	public static Set<OntologyIRI> getFacetIRIs()
	{
		Set<OntologyIRI> iris = new HashSet<OntologyIRI>();
		for (SimpleFacet v : values()) {
			iris.add(v.getOntologyIRI());
		}
		return iris;
	}
	
	
	public static Set<String> getFacets()
	{
		Set<String> result = new HashSet<String>();
		for (SimpleFacet v : values()) {
			result.add(v.getSymbolicForm());
		}
		return result;
	}
	
	
	public static SimpleFacet getFacet(OntologyIRI iri)
	{
		Preconditions.checkNotNull(iri, "iri cannot be null");
		for (SimpleFacet vocabulary : values()) {
			if (vocabulary.getOntologyIRI().equals(iri)) {
				return vocabulary;
			}
		}
		throw new IllegalArgumentException("Unknown facet: " + iri);
	}
	
	 
	public static SimpleFacet getFacetByShortName(String shortName)
	{
		Preconditions.checkNotNull(shortName);
		for (SimpleFacet vocabulary : values()) {
			if (vocabulary.getShortForm().equals(shortName)) {
				return vocabulary;
			}
		}
		return null;
	}
	 
	
	public static SimpleFacet getFacetBySymbolicName(String symbolicName)
	{
		for (SimpleFacet vocabulary : values()) {
			if (vocabulary.getSymbolicForm().equals(symbolicName)) {
				return vocabulary;
			}
		}
		return null;
	}
	 
	
}
