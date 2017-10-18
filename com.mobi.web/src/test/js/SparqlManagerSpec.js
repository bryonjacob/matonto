/*-
 * #%L
 * com.mobi.web
 * $Id:$
 * $HeadURL:$
 * %%
 * Copyright (C) 2016 iNovex Information Systems, Inc.
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * #L%
 */
describe('SPARQL Manager service', function() {
    var sparqlManagerSvc, $q, scope, $httpBackend, $httpParamSerializer, windowSvc, utilSvc, params;

    beforeEach(function() {
        module('sparqlManager');
        mockUtil();
        mockHttpService();
        injectRestPathConstant();

        module(function($provide) {
            $provide.service('$window', function() {
                this.location = '';
            });
        });

        inject(function(sparqlManagerService, _$q_, _$rootScope_, _$httpBackend_, _$httpParamSerializer_, _$window_, _utilService_, _httpService_) {
            sparqlManagerSvc = sparqlManagerService;
            $q = _$q_;
            scope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $httpParamSerializer = _$httpParamSerializer_;
            windowSvc = _$window_;
            utilSvc = _utilService_;
            httpSvc = _httpService_;
        });

        params = { query: sparqlManagerSvc.queryString };
    });

    it('should reset the state variables', function() {
        sparqlManagerSvc.reset();
        expect(sparqlManagerSvc.prefixes).toEqual([]);
        expect(sparqlManagerSvc.queryString).toEqual('');
        expect(sparqlManagerSvc.datasetRecordIRI).toEqual('');
        expect(sparqlManagerSvc.data).toEqual(undefined);
        expect(sparqlManagerSvc.errorMessage).toEqual('');
        expect(sparqlManagerSvc.infoMessage).toEqual('Please submit a query to see results here.');
        expect(sparqlManagerSvc.currentPage).toEqual(0);
        expect(sparqlManagerSvc.links).toEqual({next: '', prev: ''});
        expect(sparqlManagerSvc.totalSize).toEqual(0);
        expect(sparqlManagerSvc.bindings).toEqual([]);
    });
    describe('should query the repository', function() {
        var query = 'query', url = '/mobirest/sparql', data = {head: {}}, id = 'id';
        describe('with a dataset', function() {
            var dataset = 'dataset';
            describe('when id is set', function() {
                it('unless an error occurs', function() {
                    httpSvc.get.and.returnValue($q.reject({statusText: 'Error Message'}));
                    sparqlManagerSvc.query(query, dataset, id).then(function() {
                        fail('Promise should have rejected');
                    }, function(response) {
                        expect(httpSvc.get).toHaveBeenCalledWith(url, {params: {query: query, dataset: dataset}}, id);
                        expect(utilSvc.rejectError).toHaveBeenCalledWith(jasmine.objectContaining({statusText: 'Error Message'}));
                    });
                    scope.$apply();
                });
                it('successfully', function() {
                    httpSvc.get.and.returnValue($q.when({data: data}));
                    sparqlManagerSvc.query(query, dataset, id).then(function(response) {
                        expect(response).toEqual(data);
                        expect(httpSvc.get).toHaveBeenCalledWith(url, {params: {query: query, dataset: dataset}}, id);
                    }, function() {
                        fail('Promise should have resolved');
                    });
                    scope.$apply();
                });
            });
            describe('when id is not set', function() {
                it('unless an error occurs', function() {
                    $httpBackend.expectGET(url + '?' + $httpParamSerializer({query: query})).respond(400, null, null, 'Error Message');
                    sparqlManagerSvc.query(query).then(function(response) {
                        fail('Promise should have rejected');
                    }, function(error) {
                        expect(utilSvc.rejectError).toHaveBeenCalledWith(jasmine.objectContaining({statusText: 'Error Message'}));
                    });
                    flushAndVerify($httpBackend);
                });
                it('successfully', function() {
                    $httpBackend.expectGET(url + '?' + $httpParamSerializer({query: query})).respond(200, data);
                    sparqlManagerSvc.query(query).then(function(response) {
                        expect(response).toEqual(data);
                    }, function(error) {
                        fail('Promise should have resolved');
                    });
                    flushAndVerify($httpBackend);
                });
            });
        });
        describe('without a dataset', function() {
            describe('when id is set', function() {
                it('unless an error occurs', function() {
                    httpSvc.get.and.returnValue($q.reject({statusText: 'Error Message'}));
                    sparqlManagerSvc.query(query, '', 'id').then(function() {
                        fail('Promise should have rejected');
                    }, function(response) {
                        expect(httpSvc.get).toHaveBeenCalledWith(url, {params: {query: query}}, 'id');
                        expect(utilSvc.rejectError).toHaveBeenCalledWith(jasmine.objectContaining({statusText: 'Error Message'}));
                    });
                    scope.$apply();
                });
                it('successfully', function() {
                    httpSvc.get.and.returnValue($q.when({data: data}));
                    sparqlManagerSvc.query(query, '', 'id').then(function(response) {
                        expect(response).toEqual(data);
                        expect(httpSvc.get).toHaveBeenCalledWith(url, {params: {query: query}}, 'id');
                    }, function() {
                        fail('Promise should have resolved');
                    });
                    scope.$apply();
                });
            });
            describe('when id is not set', function() {
                it('unless an error occurs', function() {
                    $httpBackend.expectGET(url + '?' + $httpParamSerializer({query: query})).respond(400, null, null, 'Error Message');
                    sparqlManagerSvc.query(query).then(function(response) {
                        fail('Promise should have rejected');
                    }, function(error) {
                        expect(utilSvc.rejectError).toHaveBeenCalledWith(jasmine.objectContaining({statusText: 'Error Message'}));
                    });
                    flushAndVerify($httpBackend);
                });
                it('successfully', function() {
                    $httpBackend.expectGET(url + '?' + $httpParamSerializer({query: query})).respond(200, data);
                    sparqlManagerSvc.query(query).then(function(response) {
                        expect(response).toEqual(data);
                    }, function(error) {
                        fail('Promise should have resolved');
                    });
                    flushAndVerify($httpBackend);
                });
            });
        });
    });
    describe('pagedQuery should call the correct method', function() {
        var url, paramsObj, config;
        beforeEach(function() {
            paramsObj = {
                limit: 10,
                page: 1
            };
            config = {
                query: 'query',
                limit: 10,
                offset: 10
            };
            url = '/mobirest/sparql/page?';
        });
        it('with a dataset', function() {
            paramsObj.datasetRecordIRI = 'record-id';
            config.dataset = 'record-id';
            url += $httpParamSerializer(config);
            $httpBackend.expectGET(url).respond(200);
            sparqlManagerSvc.pagedQuery('query', paramsObj)
                .then(function(response) {
                    expect(response).toEqual(jasmine.objectContaining({status: 200}));
                }, function() {
                    fail('Promise should have resolved');
                });
            flushAndVerify($httpBackend);
        });
        describe('when $http.get', function() {
            beforeEach(function() {
                url += $httpParamSerializer(config);
            });
            it('resolves', function() {
                $httpBackend.expectGET(url).respond(200);
                sparqlManagerSvc.pagedQuery('query', paramsObj)
                    .then(function(response) {
                        expect(response).toEqual(jasmine.objectContaining({status: 200}));
                    }, function() {
                        fail('Promise should have resolved');
                    });
                flushAndVerify($httpBackend);
            });
            it('rejects', function() {
                $httpBackend.expectGET(url).respond(400);
                sparqlManagerSvc.pagedQuery('query', paramsObj)
                    .then(function() {
                        fail('Promise should have rejected');
                    }, function() {
                        expect(utilSvc.rejectError).toHaveBeenCalledWith(jasmine.objectContaining({status: 400}));
                    });
                flushAndVerify($httpBackend);
            });
        });
        describe('with an id and httpService.get', function() {
            beforeEach(function() {
                paramsObj.id = 'id';
            });
            it('resolves', function() {
                httpSvc.get.and.returnValue($q.when({status: 200}));
                sparqlManagerSvc.pagedQuery('query', paramsObj)
                    .then(function(response) {
                        expect(response).toEqual({status: 200});
                        expect(httpSvc.get).toHaveBeenCalledWith(url.slice(0, -1), {params: config}, 'id');
                    }, function() {
                        fail('Promise should have resolved');
                    });
                scope.$apply();
            });
            it('rejects', function() {
                httpSvc.get.and.returnValue($q.reject({status: 400}));
                sparqlManagerSvc.pagedQuery('query', paramsObj)
                    .then(function() {
                        fail('Promise should have rejected');
                    }, function() {
                        expect(httpSvc.get).toHaveBeenCalledWith(url.slice(0, -1), {params: config}, 'id');
                        expect(utilSvc.rejectError).toHaveBeenCalledWith({status: 400});
                    });
                scope.$apply();
            });
        });
    });
    describe('should retrieve a page of a query against the repository', function() {
        var url;
        beforeEach(function() {
            params.limit = sparqlManagerSvc.limit;
            params.offset = sparqlManagerSvc.currentPage * sparqlManagerSvc.limit;
            url = '/mobirest/sparql/page?';
        });
        it('with a dataset', function(done) {
            sparqlManagerSvc.datasetRecordIRI = 'dataset';
            params.dataset = sparqlManagerSvc.datasetRecordIRI;
            url += $httpParamSerializer(params);
            $httpBackend.expectGET(url).respond(200);
            sparqlManagerSvc.queryRdf();
            flushAndVerify($httpBackend);
            expect(true).toBe(true);
            done();
        });
        it('unless an error occurs', function(done) {
            url += $httpParamSerializer(params);
            var statusMessage = 'Error message';
            var details = 'Details';
            utilSvc.getErrorMessage.and.returnValue(statusMessage);
            $httpBackend.expectGET(url).respond(400, {details: details}, undefined, statusMessage);
            sparqlManagerSvc.queryRdf();
            flushAndVerify($httpBackend);

            expect(sparqlManagerSvc.errorMessage).toEqual(statusMessage);
            expect(sparqlManagerSvc.errorDetails).toEqual(details);
            expect(sparqlManagerSvc.currentPage).toBe(0);
            expect(sparqlManagerSvc.data).toBeUndefined();
            done();
        });
        it('when returning no bindings', function(done) {
            url += $httpParamSerializer(params);
            $httpBackend.expectGET(url).respond(200, {bindings: [], data: []});
            sparqlManagerSvc.queryRdf();
            flushAndVerify($httpBackend);

            expect(sparqlManagerSvc.infoMessage).toEqual('There were no results for the submitted query.');
            expect(sparqlManagerSvc.currentPage).toBe(0);
            expect(sparqlManagerSvc.data).toBeUndefined();
            done();
        });
        it('when returning bindings', function(done) {
            url += $httpParamSerializer(params);
            var nextLink = 'http://example.com/next';
            var prevLink = 'http://example.com/prev';
            var headers = {
                'X-Total-Count': '10'
            };
            utilSvc.parseLinks.and.returnValue({next: nextLink, prev: prevLink});
            $httpBackend.expectGET(url).respond(200, {bindings: [''], data: []}, headers);
            sparqlManagerSvc.queryRdf();
            flushAndVerify($httpBackend);

            expect(sparqlManagerSvc.data).toEqual([]);
            expect(sparqlManagerSvc.bindings).toEqual(['']);
            expect(sparqlManagerSvc.totalSize).toEqual(headers['X-Total-Count']);
            expect(sparqlManagerSvc.links.next).toEqual(nextLink);
            expect(sparqlManagerSvc.links.prev).toEqual(prevLink);
            done();
        });
    });
    describe('should download query results', function() {
        beforeEach(function() {
            params.fileType = 'csv';
        });
        it('with a dataset', function() {
            sparqlManagerSvc.datasetRecordIRI = 'dataset';
            params.dataset = sparqlManagerSvc.datasetRecordIRI;
            sparqlManagerSvc.downloadResults(params.fileType);
            expect(windowSvc.location).toBe('/mobirest/sparql?' + $httpParamSerializer(params));
        });
        it('with a file name', function() {
            params.fileName = 'test';
            sparqlManagerSvc.downloadResults(params.fileType, params.fileName);
            expect(windowSvc.location).toBe('/mobirest/sparql?' + $httpParamSerializer(params));
        });
        it('without a file name', function() {
            sparqlManagerSvc.downloadResults(params.fileType);
            expect(windowSvc.location).toBe('/mobirest/sparql?' + $httpParamSerializer(params));

            windowSvc.location = '';
            sparqlManagerSvc.downloadResults(params.fileType, '');
            expect(windowSvc.location).toBe('/mobirest/sparql?' + $httpParamSerializer(params));
        });
    });
});