
const filePath = process.argv[2]; //first argument of the command line is the pdf file
if (typeof filePath == "undefined") {
    console.log("Insert scanned pdf file path in the command line");
    return;
}

const OPS = require("./omniServer");
const xmlParse = require("./fileSystemHandler/xmlFileParser");

console.log("Fetching " + filePath);
xmlParse.init();


let DEBUG_CONVERTED_XML_DOCUMENT = true;

if (DEBUG_CONVERTED_XML_DOCUMENT) {
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan1\\745aa6f7-1cb4-4484-b408-4fbb15400000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan3\\14698c97-dcb8-487a-9cc7-94e156f00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan5\\5a366d6b-1699-44da-948c-063bdba00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan6\\f2da3541-aa31-4357-a052-2e6b72e00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan7\\9107fc21-a7e9-4f72-8346-a9e25d200000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scan8\\a3ea9193-f7d1-46d6-be48-82c14b300000.xml";  
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\scanSap\\44481cad-0455-4886-ac15-ba3610600000.xml"; 

    /*SHOWCASE DOCUMENTS*/
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned1\\5150209d-8bc3-40c3-8690-12fa0ba00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned2\\58945c20-68b7-40fc-b3b8-bb147aa00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned3\\838f35c2-e2bf-42ef-8ebe-af2bb2000000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\excelScanned\\242cd270-c220-4b05-b97b-b6a09ad00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned1\\e0df5c24-27bc-4300-855d-8eaeb9700000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned2\\684af9e4-eed5-4b5f-a73a-3dfdc2300000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned3\\37b9f960-21ad-4663-930e-da3fbe800000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned4\\f4a427a9-d487-4f48-9032-592282400000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lohnexperteScanned\\ef607e94-4b26-4f0b-bda0-dd7828a00000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sageScanned\\702af788-1d25-4f6c-8334-683649100000.xml";
    // let debugFile = "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sapGehalta\\44481cad-0455-4886-ac15-ba3610600000.xml";




    /*Invoices*/
    // let debugFile = "C:/Users/Carvalko/Documents/sogedes projects/pdfAnalysis/pdfToText/invoiceTest/2964cb2f-f807-4908-b5c1-fcc0e0c00000.xml"; 
    // let debugFile = "C:/Users/Carvalko/Documents/sogedes projects/pdfAnalysis/pdfToText/invoice/055e7df7-c5f0-46e2-b302-4eaf51f00000.xml"; 

    /*Bruno pc path*/
    // let debugFile = "/home/bruno/Documentos/sogedes/sogedes/omniPageServer/OPS/scan1/745aa6f7-1cb4-4484-b408-4fbb15400000.xml";

    // OPS.debugXmlFile(debugFile, filePath);
    debugShowCase(filePath);


}
else
    OPS.convertDocument(filePath);

return;

function debugShowCase(filePath) {
    debugFile = {
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned1.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned1\\5150209d-8bc3-40c3-8690-12fa0ba00000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned2.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned2\\58945c20-68b7-40fc-b3b8-bb147aa00000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned3.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\datevScanned3\\838f35c2-e2bf-42ef-8ebe-af2bb2000000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\excelScanned.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\excelScanned\\242cd270-c220-4b05-b97b-b6a09ad00000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned1.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned1\\e0df5c24-27bc-4300-855d-8eaeb9700000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned2.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned2\\684af9e4-eed5-4b5f-a73a-3dfdc2300000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned3.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned3\\37b9f960-21ad-4663-930e-da3fbe800000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned4.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lexwareScanned4\\f4a427a9-d487-4f48-9032-592282400000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lohnexperteScanned.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\lohnexperteScanned\\ef607e94-4b26-4f0b-bda0-dd7828a00000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sageScanned.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sageScanned\\702af788-1d25-4f6c-8334-683649100000.xml",
        "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sapGehalta.pdf": "C:\\Users\\Carvalko\\Documents\\sogedes projects\\pdfAnalysis\\sogedes\\omniPageServer\\OPS\\documentsForTheRobot\\sapGehalta\\44481cad-0455-4886-ac15-ba3610600000.xml"
    }
    OPS.debugXmlFile(debugFile[filePath], filePath);
}