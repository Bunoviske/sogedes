module.exports = {
    addLuisSentence: addLuisSentence,
    addContinuousTextLuisSentence: addContinuousTextLuisSentence,
    getLuisSentence: getLuisSentence,
    getLuisSentenceMap: getLuisSentenceMap
}

let luisSentence = ""; //sentence to be sent to luis to find labels and values (this is not continuous text)
let luisSentenceMap = []; //maps luis sentence and the documentData structure

//array of sentences to send to luis to detect address, names etc. These are send as separated sentences because they are defined as Intents in LUIS!
let zoneTextLuisSentences = [];  

function addLuisSentence(documentData, zoneIdx, lineIdx) {
    let thisLine = documentData[zoneIdx].lines[lineIdx];
    
    thisLine.words.forEach( (word, wordIdx) => { //iterate in the line and add words to luisSentence
        if (isGoodWord(word.text)){ //preprocess word and check if it is a good candidate to send to luis
            luisSentence += word.text + getWordSpace(wordIdx);
            addLuisSentenceMap(zoneIdx, lineIdx, wordIdx, word.text);
        }
    });
}

function addContinuousTextLuisSentence(){ //check if the text in this zone is a continuous text
    
}

function addLuisSentenceMap(zoneIdx, lineIdx, wordIdx, text) {
    luisSentenceMap.push({
        zoneIdx: zoneIdx,
        lineIdx: lineIdx,
        wordIdx: wordIdx,
        text: text
    });
}

function getLuisSentenceMap(){
    return luisSentenceMap;
}

function getLuisSentence(){
    return luisSentence;
}

function isGoodWord(wordText) {
    return true;
}

function getWordSpace(wordIdx) {
    return " ";
}