
const filePath = process.argv[2]; //first argument of the command line
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
 PARSE HTML LIB
*********************************/

function javascriptClientSelection() {

    /*************
    * Functions for the sectionWithBiggerTdHeight logic
    **************/

    // TODO - Need to generalize this bigSectionOffset because it only works with there is only one big section impacting the initialX of the next rows
    // need to make an array of big sections...
    let sectionWithBiggerTdHeight = {
        'initialX': -1, 'initialY': -1, 'width': -1, 'height': -1, 'trIdx': -1
    };
    let isFirstTdAfterBigSection = true;
    function setSectionWithBiggerTdHeight(initialX, initialY, width, height, trIdx) {
        sectionWithBiggerTdHeight.initialX = initialX;
        sectionWithBiggerTdHeight.initialY = initialY;
        sectionWithBiggerTdHeight.width = width;
        sectionWithBiggerTdHeight.height = height;
        sectionWithBiggerTdHeight.trIdx = trIdx;
    }
    function updateSectionWithBiggerTdHeight(lastYInitialCoordinate) {
        //just reset the section if it has some value and if the actual TR is after the big section
        if (sectionWithBiggerTdHeight.height != -1 && Math.round(lastYInitialCoordinate) >= Math.round(sectionWithBiggerTdHeight.initialY + sectionWithBiggerTdHeight.height))
            setSectionWithBiggerTdHeight(-1, -1, -1, -1, -1);
    }
    function getBiggerSectionOffset(lastXInitialCoordinate, trIdx) {
        if (sectionWithBiggerTdHeight.trIdx != -1 && trIdx > sectionWithBiggerTdHeight.trIdx) { //just check this condition if there is some big section
            //check if lastXInitialCoordinate is equal or bigger sectionWithBiggerTdHeight.initialX (to avoid precision error, give a range to be equal)
            if (isFirstTdAfterBigSection && Math.round(lastXInitialCoordinate) >= Math.round(sectionWithBiggerTdHeight.initialX)) {
                isFirstTdAfterBigSection = false; //the offset for the big section is used, now wait until next row
                return sectionWithBiggerTdHeight.width; //only get the offset once per TR because the variable lastXInitialCoordinate will be updated for the next TDs in this row
            }
            else
                return 0;
        }
        else //if it is in the same row which the big section was defined, dont set offset because lastXInitialCoordinate will give the right offset 
            return 0;
    }

    /*************
     * Begin of the javascript client code
     **************/

    let tableWidth = 0;
    let tableHeight = 0;
    let biggestDivBox;
    let sectionsCoordinates = []; //contain initial coordinates of the sections and its size
    let sectionsWithError = []; //sections which X offset is wrong (see TODO above)

    let divBoxes = document.querySelectorAll("div.Box");
    divBoxes.forEach(divBox => {
        //for now, take the biggest div.Box from all div.Boxs
        // let width = divBox.querySelector("layer").clientWidth;
        // let height = divBox.querySelector("layer").clientHeight;
        let width = parseFloat(divBox.querySelector("layer").attributes.width.value);
        let height = parseFloat(divBox.querySelector("layer").attributes.height.value);

        if (width >= tableWidth && height >= tableHeight) {
            tableWidth = width;
            tableHeight = height;
            biggestDivBox = divBox;
        }
    });

    let lastYInitialCoordinate = 0, lastXInitialCoordinate = 0;
    setSectionWithBiggerTdHeight(-1, -1, -1, -1);

    //get the section coordinates from the biggest table
    biggestDivBox.querySelectorAll("tr").forEach((tr, trIdx) => {
        lastXInitialCoordinate = 0;

        // tr.querySelectorAll("td").forEach(td => {
        //     sectionsCoordinates.push({
        //         'initialX': lastXInitialCoordinate, 'initialY': lastYInitialCoordinate,
        //         'width': td.clientWidth, 'height': td.clientHeight < tr.clientHeight ? tr.clientHeight : td.clientHeight
        //     }); //if td.height < tr.height, take tr value            
        //     lastXInitialCoordinate += td.clientWidth;
        // });
        // lastYInitialCoordinate += tr.clientHeight;

        updateSectionWithBiggerTdHeight(lastYInitialCoordinate); //every time I process a TR, check if is necessary to reset the big section object
        isFirstTdAfterBigSection = true; //always set this variable true before processing the TDs. This logic is necessary because I need to add the big section offset only once per TR
        let trHeight = parseFloat(tr.style.height);
        tr.querySelectorAll("td").forEach(td => {
            let tdHeight = parseFloat(td.style.height) / 0.75; //convert from pt to px
            let tdWidth = tableWidth * (parseFloat(td.width) / 100); //percentage value
            let sectionHeight = tdHeight;
            let sectionInitialX = lastXInitialCoordinate + getBiggerSectionOffset(lastXInitialCoordinate, trIdx); //gets bigger section offset if it exists

            //always round before comparing floating points
            if (Math.round(tdHeight) <= Math.round(trHeight)) //in this case, the TD is aligned with the TR (there is only a small difference in the height)
                sectionHeight = trHeight; //if td.height <= tr.height, take tr value     
            else { //in this case, a TR contains a TD that has a bigger height, so it is necessary to save the height to manage the initialX for the next TDs
                if (sectionWithBiggerTdHeight.height != -1) {
                    console.log("Already exists bigger section! Error here"); //ERROR HERE!!!!!!!!
                    sectionsWithError.push({
                        'initialX': sectionInitialX, 'initialY': lastYInitialCoordinate,
                        'width': tdWidth, 'height': sectionHeight
                    });
                }
                else
                    setSectionWithBiggerTdHeight(sectionInitialX, lastYInitialCoordinate, tdWidth, sectionHeight, trIdx);
            }

            sectionsCoordinates.push({
                'initialX': sectionInitialX, 'initialY': lastYInitialCoordinate,
                'width': tdWidth, 'height': sectionHeight
            });

            lastXInitialCoordinate = sectionInitialX + tdWidth;
        });
        lastYInitialCoordinate += trHeight;
    });
    return { tableWidth, tableHeight, sectionsCoordinates, sectionsWithError };

}

const htmlFile = "/scannedGehaltHtml_Page1.htm";
const puppeteer = require('puppeteer');
let htmlTableWidth, htmlTableHeight, htmlSections = [];
async function htmlParsing() {
    console.log("Starting html parse");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(__dirname + htmlFile);

    let result = await page.evaluate(javascriptClientSelection);
    console.log(result);
    htmlTableWidth = result.tableWidth;
    htmlTableHeight = result.tableHeight;
    htmlSections = result.sectionsCoordinates;
    browser.close(); // dont wait for the browser 
    console.log("Finished html parse");
}

// var htmlText = fs.readFileSync(htmlFile, 'utf8').toString();
// const cheerio = require('cheerio');

// const jsdom = require("jsdom");
// const { JSDOM } = jsdom;
// const document  = new JSDOM(htmlText).window.document;
// console.log(document.querySelector("div.Box").textContent);

// const $ = cheerio.load(htmlText);
// let tableWidth = 0;
// let tableHeight = 0;
// let sectionsWidthPercentage = [], sectionsHeightPercentage = [];
// let sectionsPosition = [];
// $("body").find("div.Box").each(function (index, table) {

//     //for now, take the biggest table from all div.Boxs
//     let width = parseInt($(table).find("layer").attr("width"));
//     tableWidth = width > tableWidth ? width : tableWidth;
//     let height = parseInt($(table).find("layer").attr("height"));
//     tableHeight = height > tableHeight ? height : tableHeight;

//     $(table).find("TD").each(function (idx, td) {
//         let width = parseInt($(td).css('width')) / 100;
//         let height = (parseInt($(td).css('height')) / 0.75) / tableHeight; //this height is in 'pt' and the tableHeight is in 'px'. The proportion between them is 0.75
//         sectionsWidthPercentage.push(width);
//         sectionsHeightPercentage.push(height);
//         sectionsPosition.push({ 'width': width, 'height': height });
//         // console.log(width + " " + height + " " + $(td).text());
//     });
// });
// console.log(tableWidth + " " + tableHeight);


/********************************* 
 PDFREADER LIB
*********************************/
const path = require('path');
const luis = require('./luis');
const { PerformanceObserver, performance } = require('perf_hooks');
const pdfreader = require("pdfreader");

const DEBUG = true;
const searchVariable = "";
// const searchVariable = "SV-Nr.";
// const searchVariable = "Geb.tag";

fs.writeFile(__dirname + "/luisResponse.json", "No best results!!!", (err) => {
    if (err) throw err;
});

let rows = {}; // indexed by y-position
let cols = {}; // indexed by x-position
let pdfItemsArray = []; //contain all items extracted from the pdf file
let pdfItemsArrayYFiltered = []; //contain all preprocessed items (respective to the Y filtering) extracted from the pdf file  

let pdfTxt = "";
let luisSentence = "";
let luisSentenceMap = {};
let sameLineThreshold = 0.5;

function hasManyNumbers(myString) {
    let digitCount = (myString.match(/\d/g) || []).length;
    let alphaNumCount = (myString.match(/\w/g) || []).length;
    //console.log(alphaNumCount + " " + myString.length + " " + myString);
    return digitCount / alphaNumCount > 0.5; //if 50% or more of the string are numbers, dont add to luis sentence
}
function hasNumber(myString) {
    return /\d/.test(myString);
}

function callLuis() {
    // console.log("\n\n" + luisSentence + "\n\n");

    if (!DEBUG) {
        luis.callLuis(luisSentence, Object.assign({}, luisSentenceMap)); //send luisSentenceCopy
    }

    luisSentence = "";
    luisSentenceMap = {};
}

function addLuisSentence(pdfItem) {
    let text = pdfItem.text;
    let fontSize = parseFloat(pdfItem.R[0].TS[1]);
    let substr = text.replace(/\s/g, ''); //remove spaces

    if (luisSentence.length >= 300) { //300 chars maximum
        // console.log(luisSentence.length);
        callLuis();
    }
    if (fontSize > 7.5 && !hasManyNumbers(substr) && substr.length > 1) { //good candidates are big, not numbers (label only) and are not a singular char
        // console.log(text);
        luisSentenceMap[luisSentence.length] = pdfItem;
        luisSentence += text;
    }
}

function addPdfItemsFilteredArray(y, item) {
    let yFilteredItem = item;
    yFilteredItem.y = parseFloat(y);
    // console.log(item.text + " " + yFilteredItem.y + " " + y);
    pdfItemsArrayYFiltered.push(yFilteredItem);
}

function printCols(line) { //receives a line object with all pdf items in this row

    cols = {};

    Object.values(line).forEach(values => {
        for (let index in values) {
            cols[values[index].x] = values[index]; //create cols object with original pdf items
            addPdfItemsFilteredArray(Object.keys(line)[0], values[index]); //there is only one key that represents the Y coordinate of the same line Object.keys(line)[0]
        }
    });
    let pdfLine = "";
    Object.keys(cols)
        .sort((x1, x2) => parseFloat(x1) - parseFloat(x2)) // sort float positions from left to right
        .forEach(function (x) {
            pdfLine += cols[x].text + ' ';
            addLuisSentence(cols[x]);
        });
    //luis.callLuis(pdfLine);
    pdfTxt += pdfLine;
}

function printRows() {
    let sorted = Object.keys(rows) // => array of y-positions (type: float)
        .sort((y1, y2) => parseFloat(y1) - parseFloat(y2));

    for (let i = 0; i < sorted.length; i++) { //rows[sorted[i]] is an array!!!
        //console.log(rows[sorted[i]]);
        let firstIndex = i;
        let isYfiltering = true;
        let nextNearbyText = 1;
        let thisLineArray = [];

        for (let j = 0; j < rows[sorted[i]].length; j++) { //add first items of this line
            thisLineArray.push(rows[sorted[i]][j]);
        }

        while (isYfiltering) {
            //if the distance is less than 0.5, they are in the same line
            if (i + nextNearbyText == sorted.length || (parseFloat(sorted[i + nextNearbyText]) - parseFloat(sorted[i]) > sameLineThreshold)) {
                isYfiltering = false;
                i = i + nextNearbyText - 1; //change to the next line that hasnt been processed 
            }
            else {
                for (let j = 0; j < rows[sorted[i + nextNearbyText]].length; j++) { //add items of this line in the first one
                    thisLineArray.push(rows[sorted[i + nextNearbyText]][j]);
                }
                nextNearbyText++;
            }
        }
        let thisLineObject = {};
        thisLineObject[sorted[firstIndex]] = thisLineArray; //add array to object that represents the new line assembled

        printCols(thisLineObject);
        pdfTxt += '\n';
    }
    pdfTxt += '\n';
}

let cont = 0;
main(); //start the code here
async function main() {
    await htmlParsing(); //first thing is waiting to parse the html file. then begin the pdf parsing
    new pdfreader.PdfReader().parseFileItems(filePath, function (err, item) {

        if (err) {
            console.log("Error: " + err);
            return;
        }
        else if (!item) {
            printRows();

            /*******CALL LUIS ALSO HERE BECAUSE THE DOC HAS ENDED */
            if (luisSentence != "") {
                callLuis();
            }

            fs.writeFile(__dirname + "/pdf.txt", pdfTxt, (err) => {
                if (err) throw err;
            });
            console.log("End of pdf parse");

            getTextByHtmlSections();

            if (DEBUG) {
                // var foundElem = pdfItemsArrayYFiltered.find(function (element) {
                //     return element.text.search(searchVariable) == -1 ? false : true;
                // });
                // console.log(foundElem);
                // findKeyValuePair(foundElem);
            }

            // bestResults.forEach(element => {
            //     console.log(element);
            // });
            // var t1 = performance.now();
            // console.log("Finished all code in " + (t1 - t0) + " milliseconds.");

            return;
        }
        else if (item.file) {
            console.log(item.file.path);
        }
        else if (item.page) {
            printRows(); //print rows of previous page
            console.log("Parsing page: ", item.page);
            rows = {}; // clear rows for next page
        }
        else if (item.text) {
            // accumulate text items into rows object, per line
            pdfItemsArray.push(item);
            getPdfReferenceCoordinates(item);
            (rows[item.y] = rows[item.y] || []).push(item);
        }
    });
}

/********* HTML SECTIONS POS PROCESSING **********/

function getTextByHtmlSections() {
    let pdfWidth = lastXCoordinate - firstXCoordinate;
    let pdfHeight = lastYCoordinate - firstYCoordinate;
    // console.log(firstYCoordinate + " " + lastYCoordinate + " " + pdfWidth +  " " + pdfHeight);
    let widthRelation = pdfWidth / htmlTableWidth;
    let heightRelation = pdfHeight / htmlTableHeight;

    // console.log(firstYCoordinate + " " + lastYCoordinate);

    htmlSections.forEach((section, idx) => {
        if (idx <= 15) {
            let minX = firstXCoordinate, maxX = firstXCoordinate, minY = firstYCoordinate, maxY = firstYCoordinate; //offset for the pdf table
            minX += section.initialX * widthRelation;
            maxX += (section.initialX + section.width) * widthRelation;
            minY += section.initialY * heightRelation;
            maxY += (section.initialY + section.height) * heightRelation;
            // console.log(heightRelation + " " + section.initialY + " " + section.height);
            console.log(minX + " " + maxX + " " + minY + " " + maxY + " ");
            let foundElems = pdfItemsArrayYFiltered.filter(function (element) {
                return element.y < maxY & element.y >= minY & element.x < maxX & element.x >= minX;
            });
            // .sort((elem1, elem2) => parseFloat(elem1.y) - parseFloat(elem2.y))
            // .forEach(elem => {
            //     (sortedYelems[elem.y] = sortedYelems[elem.y] || []).push(elem);
            // });


            console.log("Section number " + idx);
            foundElems.forEach(elem => {
                // if (elem.text == "Lohnart " || elem.text.search("Brutto") != -1
                // || elem.text == "Lohnsteuer " || elem.text == "00001 24,06,61 ")
                //     console.log(elem.text + " " + elem.y /*+ " " + elem.x*/);
                console.log(elem.text);
            });
            console.log("");
        }
    });
}


let firstXCoordinate = 800000, firstYCoordinate = 800000;
let lastXCoordinate = 0, lastYCoordinate = 0;
function getPdfReferenceCoordinates(item) {

    firstXCoordinate = item.x < firstXCoordinate ? item.x : firstXCoordinate;
    lastXCoordinate = getXLastCoordinate(item) > lastXCoordinate ? getXLastCoordinate(item) : lastXCoordinate;

    firstYCoordinate = item.y < firstYCoordinate ? item.y : firstYCoordinate;
    lastYCoordinate = item.y > lastYCoordinate ? item.y : lastYCoordinate;
}

/********* CREATE EVENT RECEIVER TO ANALYSE LUIS RESPONSE ----- POS PROCESSING STEP **********/

/***** to search after the LUIS Response ******/
// var foundElem = pdfItemsArray.find(function(element) {
//     return element.text.search("Scanned by CamScanner") == -1 ? false : true;
// });         

luis.eventBus.on('receivedLuisResponse', (pdfItems) => { //receive pdf items that luis identified as good labels

    pdfItems.forEach(function (item) {
        findKeyValuePair(item);
    });
});

function findKeyValuePair(label) {

    //TODO - Search inside a cell for key value. Some templates do this and the key value pairs arent aligned

    let bestValueCandidateRight = searchValueRight(label);
    let bestValueCandidateBelow = searchValueBelow(label);

    if (bestValueCandidateBelow == false && bestValueCandidateRight == false)
        console.log("No value for " + label.text);
    else if (bestValueCandidateRight == false)
        console.log(bestValueCandidateBelow.text + " value for " + label.text);
    else if (bestValueCandidateBelow == false)
        console.log(bestValueCandidateRight.text + " value for " + label.text);
    else {
        //take the one that is closest.
        //TODO - Is this the best decision? Or the value that is on the right has preference? 
        //Maybe there is a value below that is near the label compared to the value on the right

        if (cartesianDistance(getXCenterCoordinate(bestValueCandidateRight), getXCenterCoordinate(label), bestValueCandidateRight.y, label.y) <=
            cartesianDistance(getXCenterCoordinate(bestValueCandidateBelow), getXCenterCoordinate(label), bestValueCandidateBelow.y, label.y))
            console.log(bestValueCandidateRight.text + " value for " + label.text);
        else
            console.log(bestValueCandidateBelow.text + " value for " + label.text);
    }
}

function getXCenterCoordinate(item) { //get the X that represents the middle of a text string
    return (item.x + (item.x + (0.06 * item.w))) / 2;
}

function getXLastCoordinate(item) {
    return item.x + (0.06 * item.w);
}

function cartesianDistance(x1, x2, y1, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt((a * a) + (b * b));
}

function searchValueRight(label) {
    let foundElems = pdfItemsArrayYFiltered.filter(function (element) {
        let distanceThreshold = sameLineThreshold;
        return element.y == label.y & element.x > label.x; //search only in the same line! Dont use any threshold
    });
    let bestCandidate = {
        x: 800000,
        y: 800000,
        text: "initialTextBestCandidate",
        w: -1,
        sw: -1,
        clr: -1,
        A: '-1',
        R: []
    };

    console.log("\n\nRight values");
    foundElems.forEach((elem) => {
        // console.log(elem);
        if (elem.x < bestCandidate.x && hasManyNumbers(elem.text)) { //get the element that the closest x. for now, only search for texts that have many numbers  
            bestCandidate = elem;
        }
    });
    if (bestCandidate.text != "initialTextBestCandidate") {
        console.log(bestCandidate.text);
        return bestCandidate;
    }
    return false;
}

function isValueBehindLabel(element, label) { //check if the candidate element ends before the x position of the label
    let elementEnd = element.x + (0.06 * element.w);
    // if (elementEnd - label.x < 1.0){
    //     console.log("Value behind!!!!!" + element.text);
    // }
    return elementEnd - label.x < 1.0; //returns true if the end of the value is near or behind the beginning of the label 
}

function isCandidateBelowValid(element, label, xCenterElement, xCenterLabel) {
    //check if the distance from the center is less than a threshold and only get candidates below the label
    //if the xCenterDistance is negative, check if the value is behind the label
    let distanceThreshold = 3.0;
    let xCenterDistance = xCenterElement - xCenterLabel;
    return xCenterDistance <= distanceThreshold & !isValueBehindLabel(element, label) & (element.y > label.y);
}

function searchValueBelow(label) {

    let xCenterLabel = getXCenterCoordinate(label);

    let foundElems = pdfItemsArrayYFiltered.filter(function (element) {
        let xCenterElement = getXCenterCoordinate(element);
        return isCandidateBelowValid(element, label, xCenterElement, xCenterLabel);
    });

    let bestCandidate = {
        x: 800000,
        y: 800000,
        text: "initialTextBestCandidate",
        w: -1,
        sw: -1,
        clr: -1,
        A: '-1',
        R: []
    };
    console.log("\n\nBelow values");
    foundElems.forEach((elem) => {
        // console.log(elem.text);
        let xCenterElement = getXCenterCoordinate(elem);
        let xCenterBestCandidate = getXCenterCoordinate(bestCandidate);
        // console.log(elem.text + " " + elem.x + " " + xCenterElement + " " + (elem.x + (0.06 * elem.w)));

        if (elem.y <= bestCandidate.y //get the element with many numbers that has the closest y. TODO - check if there is text string between value and label? 
            && Math.abs(xCenterElement - xCenterLabel) < Math.abs(xCenterBestCandidate - xCenterLabel) //elem.x is closer to the label.x than bestCandidate.x
            && hasManyNumbers(elem.text)) {// for now, only search for texts that have many numbers  
            bestCandidate = elem;
        }
    });
    let veryDistantThreshold = 20; //in case the best candidate is too far from the label 
    if (bestCandidate.text != "initialTextBestCandidate" &&
        cartesianDistance(getXCenterCoordinate(bestCandidate), getXCenterCoordinate(label), bestCandidate.y, label.y) < veryDistantThreshold) {
        console.log(bestCandidate.text);
        return bestCandidate;
    }
    return false;
}



