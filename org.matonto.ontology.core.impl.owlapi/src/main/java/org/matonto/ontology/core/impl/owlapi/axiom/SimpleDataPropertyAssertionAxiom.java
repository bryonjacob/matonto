package org.matonto.ontology.core.impl.owlapi.axiom;

import java.util.Set;
import javax.annotation.Nonnull;
import org.matonto.ontology.core.api.Annotation;
import org.matonto.ontology.core.api.axiom.DataPropertyAssertionAxiom;
import org.matonto.ontology.core.api.propertyexpression.DataPropertyExpression;
import org.matonto.ontology.core.api.Individual;
import org.matonto.ontology.core.api.types.AxiomType;
import org.matonto.rdf.api.Literal;


public class SimpleDataPropertyAssertionAxiom 
	extends SimpleAxiom 
	implements DataPropertyAssertionAxiom {

	
	private Individual subject;
	private DataPropertyExpression property;
	private Literal value;
	
	
	public SimpleDataPropertyAssertionAxiom(@Nonnull Individual subject, @Nonnull DataPropertyExpression property, @Nonnull Literal value, Set<Annotation> annotations) 
	{
		super(annotations);
		this.subject = subject;
		this.property = property;
		this.value = value;
	}

	
	@Override
	public DataPropertyAssertionAxiom getAxiomWithoutAnnotations() 
	{
		if(!isAnnotated())
			return this;
		
		return new SimpleDataPropertyAssertionAxiom(subject, property, value, NO_ANNOTATIONS);	
	}

	
	@Override
	public DataPropertyAssertionAxiom getAnnotatedAxiom(@Nonnull Set<Annotation> annotations) 
	{
		return new SimpleDataPropertyAssertionAxiom(subject, property, value, mergeAnnos(annotations));
	}

	
	@Override
	public AxiomType getAxiomType()
	{
		return AxiomType.DATA_PROPERTY_ASSERTION;
	}
	

	@Override
	public Individual getSubject() 
	{
		return subject;
	}

	
	@Override
	public DataPropertyExpression getDataProperty() 
	{
		return property;
	}

	
	@Override
	public Literal getValue() 
	{
		return value;
	}
	
	
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) 
		    return true;
		
		if (!super.equals(obj)) 
			return false;
		
		if (obj instanceof DataPropertyAssertionAxiom) {
			DataPropertyAssertionAxiom other = (DataPropertyAssertionAxiom)obj;			 
			return ((subject.equals(other.getSubject())) && (property.equals(other.getDataProperty())) && (value.equals(other.getValue())));
		}
		
		return false;
	}
}
