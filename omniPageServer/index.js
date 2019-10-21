
const filePath = process.argv[2]; //first argument of the command line is the pdf file
if (typeof filePath == "undefined") {
    console.log("Insert scanned pdf file path in the command line");
    return;
}

const OPS = require("./omniServer");
const xmlParse = require("./xmlParser");

console.log("Fetching " + filePath);
xmlParse.init();


let DEBUG_CONVERTED_XML_DOCUMENT = true;

if (DEBUG_CONVERTED_XML_DOCUMENT) {
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan1\\745aa6f7-1cb4-4484-b408-4fbb15400000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan3\\14698c97-dcb8-487a-9cc7-94e156f00000.xml";
    let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan5\\5a366d6b-1699-44da-948c-063bdba00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan6\\f2da3541-aa31-4357-a052-2e6b72e00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan7\\9107fc21-a7e9-4f72-8346-a9e25d200000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan8\\a3ea9193-f7d1-46d6-be48-82c14b300000.xml";  
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scanSap\\44481cad-0455-4886-ac15-ba3610600000.xml"; 
    
    // let debugFile = "C:/Users/Carvalko/Documents/sogedes projects/pdfAnalysis/pdfToText/invoiceTest/2964cb2f-f807-4908-b5c1-fcc0e0c00000.xml"; 
    // let debugFile = "C:/Users/Carvalko/Documents/sogedes projects/pdfAnalysis/pdfToText/invoice/055e7df7-c5f0-46e2-b302-4eaf51f00000.xml"; 


    // let debugFile = "/home/bruno/Documentos/sogedes/sogedes/omniPageServer/OPS/scan1/745aa6f7-1cb4-4484-b408-4fbb15400000.xml";
    
    OPS.debugXmlFile(debugFile, filePath);
}
else
    OPS.convertDocument(filePath);

return;
