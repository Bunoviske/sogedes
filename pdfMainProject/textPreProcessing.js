
const luis = require('./luis');
const DEBUG = true;

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

    if (!DEBUG && luisSentence != "") {
        luis.callLuis(luisSentence, Object.assign({}, luisSentenceMap)); //send luisSentenceCopy
    }

    luisSentence = "";
    luisSentenceMap = {};
}

function getPdfTxt(){
    return pdfTxt;
}
function getPdfItemsArrayYFiltered(){
    return pdfItemsArrayYFiltered;
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

function addPdfItemsFilteredArray(y, item) { //pdfItemsArrayYFiltered contain the items filtered to be in the same line if they have close Y
    let yFilteredItem = item;
    yFilteredItem.y = parseFloat(y);
    // console.log(item.text + " " + yFilteredItem.y + " " + y);
    pdfItemsArrayYFiltered.push(yFilteredItem);
}

function addPdfItem(item){    
    pdfItemsArray.push(item);
    (rows[item.y] = rows[item.y] || []).push(item);
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

    rows = {}; // clear rows for next page
    callLuis(); // CALL LUIS ALSO HERE BECAUSE THE DOC OR PAGE HAS ENDED
}

module.exports = {
    printRows: printRows,
    addPdfItem: addPdfItem,
    DEBUG: DEBUG,
    getPdfTxt: getPdfTxt,
    getPdfItemsArrayYFiltered

}