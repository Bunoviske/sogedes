
/********************************* 
 GET PDF FILE NAME
*********************************/

const filePath = process.argv[2]; //first argument of the command line is the pdf file
const fs = require('fs');

/********************************* 
 PDF2JSON LIB
*********************************/

let PDFParser = require("pdf2json");
let pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    //fs.writeFile(__dirname + "/pdf.txt", pdfParser.getRawTextContent());
    fs.writeFile(__dirname + "/pdf.json", JSON.stringify(pdfData));
});

pdfParser.loadPDF(filePath);

/********************************* 
 PDFREADER LIB
*********************************/

const htmlFile = "/documents/scannedGehaltHtml_Page1.htm";
const txtPosProc = require("./textPosProcessing");
const txtPreProc = require("./textPreProcessing");
const htmlPosProc = require("./htmlPosProcessing");
const htmlParser = require("./htmlFileParser");
const pdfreader = require("pdfreader");

main(); //start the code here
async function main() {

    let htmlObject = await htmlParser.parseFile(htmlFile); //first thing is waiting to parse the html file. then begin the pdf parsing

    txtPosProc.initializePosProcessing(); //add event bus listener to receive the response from luis

    new pdfreader.PdfReader().parseFileItems(filePath, function (err, item) { //read the pdf and preprocess the text

        if (err) {
            console.log("Error: " + err);
            return;
        }

        else if (!item) { //finished parsing every item element in the pdf document
            txtPreProc.printRows();

            fs.writeFile(__dirname + "/pdf.txt", txtPreProc.getPdfTxt(), (err) => { //write pdf txt in a file
                if (err) throw err;
            });
            console.log("End of pdf parse");

            htmlPosProc.getTextByHtmlSections(htmlObject, txtPreProc.getPdfItemsArrayYFiltered());

            if (txtPreProc.DEBUG) { //enable this mode in you want to find specific text in the pdf and then find the key value pair

                const searchVariable = "";
                // const searchVariable = "SV-Nr.";
                // const searchVariable = "Geb.tag";

                // var foundElem = pdfItemsArrayYFiltered.find(function (element) {
                //     return element.text.search(searchVariable) == -1 ? false : true;
                // });
                // console.log(foundElem);
                // findKeyValuePair(foundElem);
            }
            return;
        }
        else if (item.file) {
            console.log(item.file.path);
        }
        else if (item.page) {
            txtPreProc.printRows(); //print rows of previous page
            console.log("Parsing page: ", item.page);
        }
        else if (item.text) {
            // accumulate text items into rows object, per line
            txtPreProc.addPdfItem(item);
            htmlPosProc.getPdfReferenceCoordinates(item);
        }
    });
}


