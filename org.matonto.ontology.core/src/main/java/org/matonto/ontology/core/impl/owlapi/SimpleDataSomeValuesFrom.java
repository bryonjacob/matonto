package org.matonto.ontology.core.impl.owlapi;

import java.util.HashSet;
import java.util.Set;

import org.matonto.ontology.core.api.ClassExpression;
import org.matonto.ontology.core.api.DataPropertyExpression;
import org.matonto.ontology.core.api.DataRange;
import org.matonto.ontology.core.api.DataSomeValuesFrom;
import org.semanticweb.owlapi.model.OWLDataPropertyExpression;

import com.google.common.base.Preconditions;

public class SimpleDataSomeValuesFrom implements DataSomeValuesFrom {

	private DataPropertyExpression property;
	private DataRange dataRange;
	
	
	public SimpleDataSomeValuesFrom(DataPropertyExpression property, DataRange dataRange)
	{
		this.property = Preconditions.checkNotNull(property, "property cannot be null");
		this.dataRange = Preconditions.checkNotNull(dataRange, "dataRange cannot be null");
	}
	
	@Override
	public SimpleClassExpressionType getClassExpressionType() 
	{
		return SimpleClassExpressionType.DATA_SOME_VALUES_FROM;
	}

	@Override
	public Set<ClassExpression> asConjunctSet() 
	{
		Set<ClassExpression> result = new HashSet<ClassExpression>();
		result.add(this);
		return result;
	}	
	
	
	@Override
	public boolean containsConjunct(ClassExpression ce)
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
	public DataRange getDataRange() 
	{
		return dataRange;
	}
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) {
			return true;
		}
		
		if(obj instanceof DataSomeValuesFrom){
			DataSomeValuesFrom other = (DataSomeValuesFrom) obj;
			return ((other.getDataRange().equals(getDataRange())) && (other.getProperty().equals(getProperty())));
		}
		
		return false;
	}

}
