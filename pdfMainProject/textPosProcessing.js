/********* CREATE EVENT RECEIVER TO ANALYSE LUIS RESPONSE ----- POS PROCESSING STEP **********/

/***** to search after the LUIS Response ******/
// var foundElem = pdfItemsArray.find(function(element) {
//     return element.text.search("Scanned by CamScanner") == -1 ? false : true;
// });

const luis = require('./luis');
const fs = require('fs');
var rimraf = require("rimraf");
const utils = require('./utils');

let outputFile;
let pdfItemsArrayYFiltered;
let posProcessingResult = {};

function initializePosProcessing(filePath, externPdfItemsArrayYFiltered) {

    pdfItemsArrayYFiltered = externPdfItemsArrayYFiltered;

    createEmptyResultFiles(filePath);

    luis.eventBus.on('receivedLuisResponse', (pdfItems) => { //receive pdf items that luis identified as good labels
        pdfItems.forEach(function (item) {
            findKeyValuePair(item);
        });
    });
}

function createEmptyResultFiles(filePath) {
    let resultDirPath = utils.getResultDirPath(filePath);
    let filename = utils.getFileName(filePath);

    if (fs.existsSync(resultDirPath)) { //delete if exists
        rimraf.sync(resultDirPath);
    }
    fs.mkdirSync(resultDirPath); //create subfolder /results 
    createPosProcessingOutputFile(resultDirPath, filename);
    luis.createOutputJsonFile(resultDirPath, filename);
}

function createPosProcessingOutputFile(resultDirPath, filename) {
    outputFile = resultDirPath + '/' + filename + "-posprocessingResult.json";
    fs.writeFile(outputFile, "{\"Result\": \"Nothing\"}", (err) => { //create a result json file for this pdf document
        if (err) throw err;
    });
}

function saveResultInJsonFile(label, value){
    posProcessingResult[label] = value; 
    // TODO - for now, I dont process the probability of luisResponse, so if there is two or more equal labels, the last value will take place in the javascript object

    console.log(posProcessingResult);
    fs.writeFile(outputFile, JSON.stringify(posProcessingResult), (err) => {
        if (err) throw err;
    });
}

function findKeyValuePair(label) {

    //TODO - Search inside a cell for key value. Some templates do this and the key value pairs arent aligned

    let bestValueCandidateRight = searchValueRight(label);
    let bestValueCandidateBelow = searchValueBelow(label);

    if (bestValueCandidateBelow == false && bestValueCandidateRight == false)
        console.log("No value for " + label.text);
    else if (bestValueCandidateRight == false){
        console.log(bestValueCandidateBelow.text + " value for " + label.text);
        saveResultInJsonFile(label.text,bestValueCandidateBelow.text);
    }
    else if (bestValueCandidateBelow == false){
        console.log(bestValueCandidateRight.text + " value for " + label.text);
        saveResultInJsonFile(label.text,bestValueCandidateRight.text);
    }
    else {
        //take the one that is closest.
        //TODO - Is this the best decision? Or the value that is on the right has preference? 
        //Maybe there is a value below that is near the label compared to the value on the right

        if (cartesianDistance(getXCenterCoordinate(bestValueCandidateRight), getXCenterCoordinate(label), bestValueCandidateRight.y, label.y) <=
            cartesianDistance(getXCenterCoordinate(bestValueCandidateBelow), getXCenterCoordinate(label), bestValueCandidateBelow.y, label.y)) {
            console.log(bestValueCandidateRight.text + " value for " + label.text);
            saveResultInJsonFile(label.text,bestValueCandidateRight.text);
        }
        else {
            console.log(bestValueCandidateBelow.text + " value for " + label.text);
            saveResultInJsonFile(label.text,bestValueCandidateBelow.text);
        }
    }
}

function getXCenterCoordinate(item) { //get the X that represents the middle of a text string
    return (item.x + (item.x + (0.06 * item.w))) / 2;
}

function cartesianDistance(x1, x2, y1, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt((a * a) + (b * b));
}

function searchValueRight(label) {
    let foundElems = pdfItemsArrayYFiltered.filter(function (element) {
        // let distanceThreshold = 0.5; //same value as SameLineThreshold variable
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
        if (elem.x < bestCandidate.x && utils.hasManyNumbers(elem.text)) { //get the element that the closest x. for now, only search for texts that have many numbers  
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
            && utils.hasManyNumbers(elem.text)) {// for now, only search for texts that have many numbers  
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

module.exports = {
    initializePosProcessing: initializePosProcessing
}
