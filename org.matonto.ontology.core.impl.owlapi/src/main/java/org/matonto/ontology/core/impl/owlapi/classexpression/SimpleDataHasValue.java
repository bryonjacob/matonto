package org.matonto.ontology.core.impl.owlapi.classexpression;

import java.util.HashSet;
import java.util.Set;
import javax.annotation.Nonnull;
import org.matonto.ontology.core.api.classexpression.ClassExpression;
import org.matonto.ontology.core.api.classexpression.DataHasValue;
import org.matonto.ontology.core.api.propertyexpression.DataPropertyExpression;
import org.matonto.ontology.core.api.types.ClassExpressionType;
import org.matonto.rdf.api.Literal;


public class SimpleDataHasValue implements DataHasValue {

	private DataPropertyExpression property;
	private Literal value;
	
	
	public SimpleDataHasValue(@Nonnull DataPropertyExpression property, @Nonnull Literal value)
	{
		this.property = property;
		this.value = value;
	}
	
	@Override
	public ClassExpressionType getClassExpressionType()
	{
		return ClassExpressionType.DATA_HAS_VALUE;
	}

	@Override
	public Set<ClassExpression> asConjunctSet() 
	{
		Set<ClassExpression> result = new HashSet<ClassExpression>();
		result.add(this);
		return result;
	}	
	
	
	@Override
	public boolean containsConjunct(@Nonnull ClassExpression ce)
	{
		return ce.equals(this);
	}
	
	
	@Override
	public Set<ClassExpression> asDisjunctSet()
	{
		Set<ClassExpression> result = new HashSet<ClassExpression>();
		result.add(this);
		return result;
	}

	@Override
	public DataPropertyExpression getProperty() 
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
		if (this == obj) {
			return true;
		}
		
		if(obj instanceof DataHasValue){
			DataHasValue other = (DataHasValue) obj;
			return ((other.getValue().equals(getValue())) && (other.getProperty().equals(getProperty())));
		}
		
		return false;
	}
}
