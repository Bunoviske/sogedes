module.exports = {
    init: init
}
const bus = require('./eventBus');
const sysHandler = require('./fileSystemHandler/fileSystemHandler');
const documentUnderstanding = require('./documentUnderstanding/docUnderstanding');

function init() {
    bus.addEventListener("parseXml", xmlParser);
}

function xmlParser(parameters) {
    console.log("Parsing " + parameters.xmlFile);

    let content = readFile(parameters.xmlFile); //read its content
    parseFile(content); //parse and extract information from the document
}

function readFile(xmlFile) {
    return sysHandler.getFileSystemHandler("xmlHandler").readXmlFile(xmlFile);
}

function parseFile(xmlContent) {

    // console.log(xmlContent);
    let parseXmlString = require('xml2js').parseString;
    parseXmlString(xmlContent, function (err, result) {
        if (err) { return console.log(err); }
        documentUnderstanding.run(result);
    });
}

