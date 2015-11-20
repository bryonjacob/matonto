package org.matonto.ontology.core.impl.owlapi;

import java.util.HashSet;
import java.util.Set;

import org.matonto.ontology.core.api.ClassExpression;
import org.matonto.ontology.core.api.ObjectComplementOf;

import com.google.common.base.Preconditions;

public class SimpleObjectComplementOf 
	implements ObjectComplementOf {

	
	private ClassExpression operand;
	
	public SimpleObjectComplementOf(ClassExpression operand) 
	{
		this.operand = Preconditions.checkNotNull(operand, "operand cannot be null");
	}

	
	public ClassExpression getOperand()
	{
		return operand;
	}	
	
	
	@Override
	public SimpleClassExpressionType getClassExpressionType() 
	{
		return SimpleClassExpressionType.OBJECT_COMPLEMENT_OF;
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
		Set<ClassExpression> disjuncts = new HashSet<ClassExpression>();
		disjuncts.add(this);
		return disjuncts;
	}
	
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) {
			return true;
		}
		
		if(obj instanceof SimpleObjectComplementOf){
			SimpleObjectComplementOf other = (SimpleObjectComplementOf) obj;
			return other.getOperand().equals(operand);
		}
		
		return false;
	}

}
