module.exports = {
    init: init
}
const bus = require('./eventBus');
const sysHandler = require('./fileSystemHandler/fileSystemHandler');

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
    // var utf8 = require('utf8');
    // console.log(utf8.decode(xmlContent));
    // console.log(xmlContent);

    var parseXmlString = require('xml2js').parseString;
    parseXmlString(xmlContent, function (err, result) {
        if (err) { return console.log(err); }
        console.log(result.document.page[0].zones[0].textZone); //array of textZones
        console.log(result.document.page[0].zones[0].tableZone); //array of tableZones
    });
}

