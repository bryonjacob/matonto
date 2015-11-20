package org.matonto.ontology.core.impl.owlapi;

import java.util.HashSet;
import java.util.Set;

import org.matonto.ontology.core.api.ClassExpression;
import org.matonto.ontology.core.api.ObjectPropertyExpression;
import org.matonto.ontology.core.api.ObjectSomeValuesFrom;

import com.google.common.base.Preconditions;

public class SimpleObjectSomeValuesFrom 	
	implements ObjectSomeValuesFrom {

	private ObjectPropertyExpression property;
	private ClassExpression classExpression;
	
	public SimpleObjectSomeValuesFrom(ObjectPropertyExpression property, ClassExpression classExpression)
	{
		this.property = Preconditions.checkNotNull(property, "property cannot be null");
		this.classExpression = Preconditions.checkNotNull(classExpression, "classExpression cannot be null");
	}
	
	
	@Override
	public SimpleClassExpressionType getClassExpressionType() 
	{
		return SimpleClassExpressionType.OBJECT_SOME_VALUES_FROM;
	}

	
	@Override
	public ObjectPropertyExpression getProperty()
	{
		return property;
	}
	
	
	@Override
	public ClassExpression getClassExpression()
	{
		return classExpression;
	}
	
	
	@Override
	public Set<ClassExpression> asConjunctSet() 
	{
		Set<ClassExpression> conjuncts = new HashSet<ClassExpression>();
		conjuncts.add(this);	
		return conjuncts;
	}

	@Override
	public boolean containsConjunct(ClassExpression ce) 
	{
		return (this.equals(ce) || classExpression.equals(ce));
	}

	@Override
	public Set<ClassExpression> asDisjunctSet() 
	{
		Set<ClassExpression> disjuncts = new HashSet<ClassExpression>();
		disjuncts.add(this);
		disjuncts.add(this.getClassExpression());
		return disjuncts;
	}
	
	
	@Override
	public boolean equals(Object obj)
	{
		if (this == obj) 
		    return true;
		
		if (obj instanceof ObjectSomeValuesFrom) {
			ObjectSomeValuesFrom other = (ObjectSomeValuesFrom) obj;
			if(other.getClassExpression().equals(getClassExpression()))
				return other.getProperty().equals(getProperty());
		}
		return false;
	}

}
