module.exports = {
    addLuisSentence: addLuisSentence,
    addContinuousTextLuisSentence: addContinuousTextLuisSentence,
    getLuisSentences: getLuisSentences,
    getLuisSentencesMap: getLuisSentencesMap
}

let sentence = ""; //sentence to be sent to luis to find labels and values (this is not continuous text)
let sentenceMap = []; //maps luis sentence and the documentData structure
let luisSentences = []; //array of sentences
let luisSentencesMap = [];//array of sentences map

//array of sentences to send to luis to detect address, names etc. These are send as separated sentences because they are defined as Intents in LUIS!
let zoneTextLuisSentences = [];  

function addLuisSentence(documentData, zoneIdx, lineIdx) {
    let thisLine = documentData[zoneIdx].lines[lineIdx];
    
    thisLine.words.forEach( (word, wordIdx) => { //iterate in the line and add words to luisSentence
        if (isGoodWord(word.text, thisLine.lineFont)){ //preprocess word and check if it is a good candidate to send to luis
            sentence += word.text + getWordSpace(wordIdx);
            addSentenceMap(zoneIdx, lineIdx, wordIdx, word.text);
        }
    });

    checkMaxSentenceLength();
}

//get text zones with multiple lines and regular spacing between words -> good to retrieve blocks of text
function addContinuousTextLuisSentence(documentData, zoneIdx){ //check if the text in this zone is a continuous text
    let zone = documentData[zoneIdx]; 
    // zoneTextLuisSentences.push();   
}

function getLuisSentencesMap(){
    return luisSentencesMap;
}

function getLuisSentences(){
    return luisSentences;
}

function checkMaxSentenceLength(){
    if (sentence.length > 300){
        luisSentences.push(sentence);
        luisSentencesMap.push(sentenceMap);
        sentence = "";
        sentenceMap = [];
    }
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
    if (fontSize > fontThreshold && !hasManyNumbers(wordText) && wordText.length > 1) { //good candidates are big, not numbers (label only) and are not a singular char
        return true;
    }
    return false;
}

function hasManyNumbers(myString) {
    let digitCount = (myString.match(/\d/g) || []).length;
    let alphaNumCount = (myString.match(/\w/g) || []).length;
    //console.log(alphaNumCount + " " + myString.length + " " + myString);
    return digitCount / alphaNumCount > 0.5; //if 50% or more of the string are numbers, dont add to luis sentence
}
function hasNumber(myString) {
    return /\d/.test(myString);
}

function getWordSpace(wordIdx) { //returns a space only if width property is defined in the line for this word
    return " ";
}