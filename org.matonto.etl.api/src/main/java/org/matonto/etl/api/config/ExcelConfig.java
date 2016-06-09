package org.matonto.etl.api.config;

import org.matonto.rdf.api.Model;

import java.io.InputStream;
import java.util.Optional;

public class ExcelConfig {
    private InputStream data;
    private Model mapping;
    private boolean containsHeaders = true;
    private Optional<Long> limit;
    private long offset = 0;

    private ExcelConfig(Builder builder) {
        data = builder.data;
        mapping = builder.mapping;
        containsHeaders = builder.containsHeaders;
        limit = builder.limit;
        offset = builder.offset;
    }

    public InputStream getData() {
        return data;
    }

    public Model getMapping() {
        return mapping;
    }

    public boolean getContainsHeaders() {
        return containsHeaders;
    }

    public Optional<Long> getLimit() {
        return limit;
    }

    public long getOffset() {
        return offset;
    }

    public static class Builder {
        private InputStream data;
        private Model mapping;
        private boolean containsHeaders = true;
        private Optional<Long> limit = Optional.empty();
        private long offset = 0;

        public Builder(InputStream data, Model mapping) {
            this.data = data;
            this.mapping = mapping;
        }

        public Builder containsHeaders(boolean containsHeaders) {
            this.containsHeaders = containsHeaders;
            return this;
        }

        public Builder limit(long limit) {
            this.limit = Optional.of(limit);
            return this;
        }

        public Builder offset(long offset) {
            this.offset = offset;
            return this;
        }

        public ExcelConfig build() {
            return new ExcelConfig(this);
        }
    }
}
