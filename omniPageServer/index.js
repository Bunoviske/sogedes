
const filePath = process.argv[2]; //first argument of the command line is the pdf file
if (typeof filePath == "undefined") {
    console.log("Insert scanned pdf file path in the command line");
    return;
}

const OPS = require("./omniServer");
const xmlParse = require("./xmlParser");

console.log("Fetching " + filePath);
xmlParse.init();


let DEBUG = true;
if (DEBUG) {
    let debugFile = "C:\\Users\\Carvalko\\Documents\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan1\\745aa6f7-1cb4-4484-b408-4fbb15400000.xml"
    OPS.debugXmlFile(debugFile);
}
else
    OPS.convertDocument(filePath);

return;