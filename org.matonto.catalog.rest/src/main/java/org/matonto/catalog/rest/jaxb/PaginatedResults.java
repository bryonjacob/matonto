package org.matonto.catalog.rest.jaxb;

import java.util.List;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class PaginatedResults<T> {

    private Links links;
    private int limit;
    private List<T> results;
    private int size;
    private int start;

    @XmlElement
    public Links getLinks() {
        return links;
    }

    public void setLinks(Links links) {
        this.links = links;
    }

    @XmlElement
    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    @XmlElement
    public List<T> getResults() {
        return results;
    }

    public void setResults(List<T> results) {
        this.results = results;
    }

    @XmlElement
    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    @XmlElement
    public int getStart() {
        return start;
    }

    public void setStart(int start) {
        this.start = start;
    }
}