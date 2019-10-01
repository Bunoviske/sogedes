module.exports = {
    addLuisSentence: addLuisSentence,
    sinalizeEndOfDocument: sinalizeEndOfDocument,
    addContinuousTextLuisSentence: addContinuousTextLuisSentence,
    getLuisSentences: getLuisSentences,
    getLuisSentencesMap: getLuisSentencesMap,
    getContinuousTextLuisSentences: getContinuousTextLuisSentences,
    getContinuousTextMap: getContinuousTextMap
}

const mathjs = require('mathjs');
const utils = require('./commonUtils');

let sentence = ""; //sentence to be sent to luis to find labels and values (this is not continuous text)
let sentenceMap = []; //maps luis sentence and the documentData structure
let luisSentences = []; //array of sentences
let luisSentencesMap = [];//array of sentences map
/********
sentenceMap = {
    zoneIdx: zoneIdx,
    lineIdx: lineIdx,
    wordIdx: wordIdx,
    text: text            
}
********/

//array of sentences to send to luis to detect address, names etc. These are send as separated sentences because they are defined as Intents in LUIS!
let continuousTextLuisSentences = [];
let continuousTextMap = [];

function addLuisSentence(documentData, zoneIdx, lineIdx) {
    let thisLine = documentData[zoneIdx].lines[lineIdx];

    thisLine.words.forEach((word, wordIdx) => { //iterate in the line and add words to luisSentence
        if (isGoodWord(word.text, thisLine.lineFont)) { //preprocess word and check if it is a good candidate to send to luis
            sentence += word.text + getWordSpace(wordIdx);
            addSentenceMap(zoneIdx, lineIdx, wordIdx, word.text);
        }
    });
    checkMaxSentenceLength();
}

function sinalizeEndOfDocument() { //this function should add the last sentence to the array of sentences
    if (sentence != "")
        pushSentence();
}

//get text zones with multiple lines and regular spacing between words -> good to retrieve blocks of text
function addContinuousTextLuisSentence(documentData, zoneIdx) { //check if the text in this zone is a continuous text
    let zone = documentData[zoneIdx];
    //at least two lines and regular space between words
    let zoneText = getZoneText(zone);
    if (getLinesCount(zone) >= 2 && isContinuousText(zone) /*&& !utils.hasManyNumbers(zoneText)*/) {
        continuousTextLuisSentences.push(zoneText);
        continuousTextMap.push(zoneIdx);
        // console.log(zoneText);
    }
}

function getLuisSentencesMap() {
    return luisSentencesMap;
}

function getLuisSentences() {
    return luisSentences;
}

function getContinuousTextLuisSentences() {
    return continuousTextLuisSentences;
}

function getContinuousTextMap() {
    return continuousTextMap;
}

function checkMaxSentenceLength() {
    if (sentence.length > 300) {
        pushSentence();
    }
}

function pushSentence() {
    luisSentences.push(sentence);
    luisSentencesMap.push(sentenceMap);
    sentence = "";
    sentenceMap = [];
}

function addSentenceMap(zoneIdx, lineIdx, wordIdx, text) {
    sentenceMap.push({
        zoneIdx: zoneIdx,
        lineIdx: lineIdx,
        wordIdx: wordIdx,
        text: text
    });
}

function isGoodWord(wordText, fontSize) {
    return true; //for now, return true because the AI may recognize values as well, like '13.05.61' as geb.datum

    //old method
    let fontThreshold = 300;
    if (fontSize > fontThreshold && !utils.hasManyNumbers(wordText) && wordText.length > 1) { //good candidates are big, not numbers (label only) and are not a singular char
        return true;
    }
    return false;
}

function getWordSpace(wordIdx) { //returns a space only if width property is defined in the line for this word
    //TODO - implement this function because not all words are separated by space
    return " ";
}

function getLinesCount(zone) {
    return zone.lines.length;
}
function isContinuousText(zone) { //check if the space between the words in the section follow a pattern
    let spacesWidth = [];
    let linesWithPattern = 0, numOfSpaces = 0;

    zone.lines.forEach(line => {
        spacesWidth = []; //each line has its own pattern. may be different font sizes
        line.spaces.forEach(space => {
            spacesWidth.push(space.width);
        });
        numOfSpaces += spacesWidth.length; //get the total number of spaces in that line
        linesWithPattern += checkSpacePattern(spacesWidth);
    });

    //all lines must have the pattern and at least one space in the text zone (if there isnt one single space, probably is not a continuous text)
    if (linesWithPattern == zone.lines.length && numOfSpaces > 0)
        return true;

    return false;

}

//returns 1 with there is a pattern and 0 with there isnt
function checkSpacePattern(spacesWidth) {
    if (spacesWidth.length <= 1) { //only one space or no space (no pattern to look out)
        return 1;
    }
    let std = mathjs.std(spacesWidth);
    let mean = mathjs.mean(spacesWidth);
    // console.log(spacesWidth);
    // console.log("Standard deviation:                " + std);
    // console.log("Mean:                " + mean);
    // console.log("Thresold:                " + (mean*0.25));    
    let threshold = mean * 0.25; //take 25% of the mean
    if (std < threshold)
        return 1;
    return 0;
}

function getZoneText(zone) {
    let sentence = "";
    zone.lines.forEach(line => {
        line.words.forEach((word, idx) => {
            sentence += word.text + getWordSpace(idx);
        });
    });
    return sentence;
}