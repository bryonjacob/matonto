package org.matonto.ontology.core.impl.owlapi.axiom;

import java.util.Set;
import javax.annotation.Nonnull;
import org.matonto.ontology.core.api.Annotation;
import org.matonto.ontology.core.api.propertyexpression.ObjectPropertyExpression;
import org.matonto.ontology.core.api.axiom.SymmetricObjectPropertyAxiom;
import org.matonto.ontology.core.api.types.AxiomType;


public class SimpleSymmetricObjectPropertyAxiom 
	extends SimpleAxiom 
	implements SymmetricObjectPropertyAxiom {
    
    
	private ObjectPropertyExpression objectProperty;
	
	
	public SimpleSymmetricObjectPropertyAxiom(@Nonnull ObjectPropertyExpression objectProperty, Set<Annotation> annotations) 
	{
		super(annotations);
		this.objectProperty = objectProperty;
	}
	

	@Override
	public SymmetricObjectPropertyAxiom getAxiomWithoutAnnotations() 
	{
		if(!isAnnotated())
			return this;
		
		return new SimpleSymmetricObjectPropertyAxiom(objectProperty, NO_ANNOTATIONS);	
	}

	
	@Override
	public SymmetricObjectPropertyAxiom getAnnotatedAxiom(@Nonnull Set<Annotation> annotations) 
	{
		return new SimpleSymmetricObjectPropertyAxiom(objectProperty, mergeAnnos(annotations));
	}


	@Override
	public AxiomType getAxiomType()
	{
		return AxiomType.SYMMETRIC_OBJECT_PROPERTY;
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
		
		if (obj instanceof SymmetricObjectPropertyAxiom) {
			SymmetricObjectPropertyAxiom other = (SymmetricObjectPropertyAxiom)obj;			 
			return objectProperty.equals(other.getObjectProperty());
		}
		
		return false;
	}
}
