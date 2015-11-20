package org.matonto.ontology.core.impl.owlapi;

import org.matonto.ontology.core.api.ObjectInverseOf;
import org.matonto.ontology.core.api.ObjectProperty;
import org.matonto.ontology.core.api.ObjectPropertyExpression;

import com.google.common.base.Preconditions;

public class SimpleObjectInverseOf 
	extends SimpleObjectPropertyExpression
	implements ObjectInverseOf {

	
	private ObjectPropertyExpression inverseProperty;
	
	public SimpleObjectInverseOf(ObjectPropertyExpression inverseProperty)
	{
		this.inverseProperty = Preconditions.checkNotNull(inverseProperty, "InverseProperty cannot be null");
	}
	

	@Override
	public ObjectPropertyExpression getInverse() 
	{
		return inverseProperty;
	}
	
	
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) 
			return true;
		
		if (obj instanceof ObjectInverseOf) {
			ObjectInverseOf other = (ObjectInverseOf) obj;
			return other.getInverse().equals(inverseProperty);
		}
		
		return false;
	}

}
