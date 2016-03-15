package org.matonto.etl.service.csv

import org.matonto.rdf.api.Model
import org.matonto.rdf.api.ModelFactory
import org.matonto.rdf.core.impl.sesame.LinkedHashModel
import org.matonto.rdf.core.impl.sesame.LinkedHashModelFactory
import org.matonto.rdf.core.impl.sesame.SimpleValueFactory
import org.matonto.rdf.api.ValueFactory
import org.openrdf.rio.RDFFormat
import org.openrdf.rio.RDFParseException
import org.openrdf.rio.Rio
import org.springframework.core.io.ClassPathResource
import spock.lang.Specification

class ConverterSpec extends Specification {

    def mf = LinkedHashModelFactory.getInstance();
    def vf = SimpleValueFactory.getInstance();

    def c = Spy(CSVConverterImpl)

    def out = new ClassPathResource("testOutput.ttl").getFile();
    def r = new FileReader(out);

    def setup() {
        c.setValueFactory(vf)
        c.setModelFactory(mf);
    }

    def "Convert File with Multiple Object per Row and Object and Data Properties"() {
        setup:
        File csv = new ClassPathResource("testFile.csv").getFile();
        File mappingFile = new ClassPathResource("newMapping.ttl").getFile();
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true);

        expect:
        m.equals(convertedModel);
    }

    def "Test non-comma separator"(){
        setup:
        File csv = new ClassPathResource("semicolonFile.csv").getFile();
        File mappingFile = new ClassPathResource("semicolonMapping.ttl").getFile();
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true)

        expect:
        m.equals(convertedModel);
    }

    def "Test default separator is comma"(){
        setup:
        File csv = new ClassPathResource("testFile.csv").getFile();
        File mappingFile = new ClassPathResource("defaultSeparatorMapping.ttl").getFile();
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true);

        expect:
        m.equals(convertedModel);
    }

    def "Tab Separated"(){
        setup:
        File csv = new ClassPathResource("tabFile.csv").getFile();
        File mappingFile = new ClassPathResource("tabMapping.ttl").getFile();
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true)

        expect:
        m.equals(convertedModel);
    }

    def "Mapping with default Local Name"(){
        setup:
        File csv = new ClassPathResource("testFile.csv").getFile();
        File mappingFile = new ClassPathResource("mappingNoLocalName.ttl").getFile();
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true)

        expect:
        m.equals(convertedModel);
    }

    def "Test Generation of Local Name"(){
        setup:
        String[] nextLine = ["abcd","efgh","ijkl","mnop","qrst"]
        c.generateUUID() >> "12345"

        expect:
        result.equals(c.generateLocalName(localName, nextLine))

        where:
        result              | localName
        "12345"             | "\${UUID}"
        "12345/abcd"        | "\${UUID}/\${1}"
        "abcd"              | "\${1}"
        "abcd/12345"        | "\${1}/\${UUID}"
        "abcd/12345/ijkl"   | "\${1}/\${UUID}/\${3}"
        "abcd/abcd"         | "\${1}/\${1}"
        "12345"             | ""
    }

    def "Invalid RDF Causes RDFParseException"(){
        setup:
        File csv = new ClassPathResource("testFile.csv").getFile();
        File mappingFile = new ClassPathResource("testInvalidMapping.ttl").getFile();

        when:
        c.convert(csv, mappingFile, true);

        then:
        thrown RDFParseException;
    }

    def "Convert File with Missing Properties Ignored"() {
        setup:
        File csv = new ClassPathResource("testPropertiesMissing.csv").getFile();
        File mappingFile = new ClassPathResource("newMapping.ttl").getFile();
        out = new ClassPathResource("testPropertiesMissingOut.ttl").getFile();
        r = new FileReader(out);
        c.generateUUID() >>> ["abc", "bcd", "cdf", "dfg", "fgh", "ghi", "hij", "ijk", "jkl", "klm", "lmn", "nop", "pqr", "rst", "tuv", "vwx", "xyz", "123", "345"]
        Model m = c.matontoModel(Rio.parse(r, "", RDFFormat.TURTLE))
        Model convertedModel = c.convert(csv, mappingFile, true);

        expect:
        m.equals(convertedModel);
    }
}