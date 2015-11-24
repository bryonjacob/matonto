package org.matonto.ontology.core.impl.owlapi;

import java.util.Set;

import org.matonto.ontology.core.api.Annotation;
import org.matonto.ontology.core.api.Axiom;
import org.matonto.ontology.core.api.ObjectPropertyExpression;
import org.matonto.ontology.core.api.ReflexiveObjectPropertyAxiom;
import org.matonto.ontology.core.api.TransitiveObjectPropertyAxiom;

import com.google.common.base.Preconditions;

public class SimpleTransitiveObjectPropertyAxiom 
	extends SimpleAxiom 
	implements TransitiveObjectPropertyAxiom {


	
	private ObjectPropertyExpression objectProperty;
	
	
	public SimpleTransitiveObjectPropertyAxiom(ObjectPropertyExpression objectProperty, Set<Annotation> annotations) 
	{
		super(annotations);
		this.objectProperty = Preconditions.checkNotNull(objectProperty, "objectProperty cannot be null");
	}
	

	@Override
	public TransitiveObjectPropertyAxiom getAxiomWithoutAnnotations() 
	{
		if(!isAnnotated())
			return this;
		
		return new SimpleTransitiveObjectPropertyAxiom(objectProperty, NO_ANNOTATIONS);	
	}

	
	@Override
	public TransitiveObjectPropertyAxiom getAnnotatedAxiom(Set<Annotation> annotations) 
	{
		return new SimpleTransitiveObjectPropertyAxiom(objectProperty, mergeAnnos(annotations));
	}


	@Override
	public SimpleAxiomType getAxiomType() 
	{
		return SimpleAxiomType.TRANSITIVE_OBJECT_PROPERTY;
	}

	
	@Override
	public ObjectPropertyExpression getObjectProperty() 
	{
		return objectProperty;
	}

	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) 
		    return true;
		
		if (!super.equals(obj)) 
			return false;
		
		if (obj instanceof TransitiveObjectPropertyAxiom) {
			TransitiveObjectPropertyAxiom other = (TransitiveObjectPropertyAxiom)obj;			 
			return objectProperty.equals(other.getObjectProperty());
		}
		
		return false;
	}
}
