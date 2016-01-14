package org.matonto.query.api;

import org.matonto.query.TupleQueryResult;
import org.matonto.repository.exception.QueryEvaluationException;

public interface TupleQuery {

    TupleQueryResult evaluate() throws QueryEvaluationException;

}
