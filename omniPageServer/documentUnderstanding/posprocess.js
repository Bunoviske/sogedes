module.exports = {
    createListeners: createListeners
}

const bus = require('../eventBus');
const txtHandler = require('./textZoneHandler');
const coordHandler = require('./coordinatesHandler');
const utils = require('./commonUtils');

function createListeners() {
    //TODO - Save posprocessing results in json file for communication with contextor. Take a look at TextPosProcessing.js in the pdf2txt project
    bus.addEventListener("posprocessLuisResponse", findKeyValuePairs);
    bus.addEventListener("posprocessContinuousTextLuisResponse", getInfoFromContinuousText);
}

/********
@parameters = {
    bestResults: [{
        label: entity,
        score: score,
        type: type,
        //startIndex: startIndex,
        //endIndex: endIndex,
        mapObject: luisSentenceMapObject
    }]
}
mapObject = { //maps a word with the documentData structure
    zoneIdx: zoneIdx,
    lineIdx: lineIdx,
    wordIdx: wordIdx,
    text: text            
}
********/

function findKeyValuePairs(parameters) { //for now, the results are coming from textZones

    console.log("Finding key value pairs...");
    console.log(parameters.bestResults);
    return;

    //algorithm: given a label, first search for values in the same textZone/cellZone/tableZone. If no value is found, search in the nearby zones on the right and on the bottom

    parameters.bestResults.forEach( result => {
        let label = result.entity;
        let wordMap = result.mapObject;

        let value = searchValueInSameTextZone(label, wordMap);
        if (value == null) //if no value is found in the same zone, search nearby
            value = searchValueInNearbyTextZones(label, wordMap);

        console.log("Label: " + result.mapObject.text + "      Value: " + value);
    });    
}

function searchValueInSameTextZone(label, wordMap){

    console.log("Searching in the same zone...");
    
    //for now, all labels have numbers as values
    let valueCandidates = searchForNumberValues(wordMap.zoneIdx);

    //take the values and filter the ones on the right and below
    let rightCandidates = getSameLineRightCandidates(valueCandidates, wordMap.lineIdx, wordMap.wordIdx);
    let belowCandidates = getCandidatesBelow(valueCandidates, wordMap.zoneIdx, wordMap.lineIdx, wordMap.wordIdx);
    
    //return the closest candidate from both arrays
    return getClosestCandidate(rightCandidates.concat(belowCandidates), wordMap.zoneIdx, wordMap.lineIdx, wordMap.wordIdx);
}

//this function search for number values inside a zone
function searchForNumberValues(zoneToSearchIdx){
    let documentData = txtHandler.getTextZones();
    let thisZone = documentData[zoneToSearchIdx];
    let candidates = [];
    
    thisZone.lines.forEach( line, lineIdx => {
        line.words.forEach( word, wordIdx => {
            if (utils.hasManyNumbers(word.text)) //a candidate has the same structure as a sentence map (luisSentenceMapObject)
                candidates.push({
                    zoneIdx: zoneToSearchIdx,
                    lineIdx: lineIdx,
                    wordIdx: wordIdx,
                    text: word.text
                });
        })
    });
    return candidates;
}

//this function is only valid for values in the same text zone of the label. just compare indexes
function getSameLineRightCandidates(candidates, labelLineIdx, labelWordIdx){
    let rightCandidates = [];

    candidates.forEach(candidate => {
        if (candidate.lineIdx == labelLineIdx && candidate.wordIdx > labelWordIdx){
            rightCandidates.push(candidate);
        }
    });
    return rightCandidates;
}

//get candidates below. Also, dont take candidates that has a right coordinate smaller than the label left coordinate
function getCandidatesBelow(candidates, labelZoneIdx, labelLineIdx,labelWordIdx){
    let belowCandidates = [];
    let documentData = txtHandler.getTextZones();  
    let labelPos = documentData[labelZoneIdx].lines[labelLineIdx].words[labelWordIdx].wordPos;  //get label position

    candidates.forEach(candidate => {
        let candidatePos = documentData[candidate.zoneIdx].lines[candidate.lineIdx].words[candidate.wordIdx].wordPos;  //get candidate position 

        if (coordHandler.isBelow(labelPos, candidatePos)){
            belowCandidates.push(candidate);
        }
    });
    return belowCandidates;
}

function getClosestCandidate(candidates, labelZoneIdx, labelLineIdx,labelWordIdx){
    if (candidates.length == 0)
        return null;

    let bestCandidate, bestCandidateDistance = 2000000.0;
    let documentData = txtHandler.getTextZones();  
    let labelPos = documentData[labelZoneIdx].lines[labelLineIdx].words[labelWordIdx].wordPos;  //get label position

    candidates.forEach(candidate => {
        let candidatePos = documentData[candidate.zoneIdx].lines[candidate.lineIdx].words[candidate.wordIdx].wordPos;  //get candidate position 
        let distance = coordHandler.distance(labelPos, candidatePos);
        if (distance < bestCandidateDistance){
            bestCandidateDistance = distance;
            bestCandidate = candidate;
        }
    });
    return bestCandidate;
}

/********
@parameters = {
    result: {
    }
}
********/
function getInfoFromContinuousText(parameters) {
    // console.log(parameters.bestResults);

    //TODO - implement function
}