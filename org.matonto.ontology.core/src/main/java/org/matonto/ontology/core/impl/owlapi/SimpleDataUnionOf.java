package org.matonto.ontology.core.impl.owlapi;

import java.util.HashSet;
import java.util.Set;
import java.util.TreeSet;

import org.matonto.ontology.core.api.DataRange;
import org.matonto.ontology.core.api.DataUnionOf;

import com.google.common.base.Preconditions;

public class SimpleDataUnionOf implements DataUnionOf {

	
	private Set<DataRange> operands;
	
	public SimpleDataUnionOf(Set<DataRange> operands)
	{
		this.operands = new TreeSet<DataRange>(Preconditions.checkNotNull(operands, "operands cannot be null"));
	}
	
	
	@Override
	public boolean isDatatype() 
	{
		return false;
	}

	
	@Override
	public SimpleDataRangeType getDataRangeType() 
	{
		return SimpleDataRangeType.DATA_UNION_OF;
	}

	
	@Override
	public Set<DataRange> getOperands() 
	{
		return new HashSet<DataRange>(operands);
	}
	
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) 
		    return true;
		
		if ((obj instanceof DataUnionOf)) {
			DataUnionOf other = (DataUnionOf)obj;
			return getOperands().equals(other.getOperands());
		}
		
		return false;
	}

}
