module.exports = {
    findKeyValuePairs: findKeyValuePairs
}

const txtHandler = require('../preprocess/textZoneHandler');
const coordHandler = require('../coordinatesHandler');
const utils = require('../commonUtils');

/********
@parameters = {
    bestResults: [{
        label: entity,
        score: score,
        type: type,
        //startIndex: startIndex,
        //endIndex: endIndex,
        mapObjects: luisSentenceMapObject
    }]
}
mapObjects = [{ //maps a word with the documentData structure. An entity detected may contain more than one word, so mapObjects is an array
    zoneIdx: zoneIdx,
    lineIdx: lineIdx,
    wordIdx: wordIdx,
    text: text            
}]
********/

function findKeyValuePairs(parameters) { //for now, the results are coming from textZones

    let jsonResult = [];

    parameters.bestResults.forEach(result => {
        let label = result.type;

        //for key value pair extraction, it is important to know the zone that the words are into. So I can take just the first word map from the array
        let mapObject = result.mapObjects[0]; 

        let value = searchValueInSameTextZone(label, mapObject);
        if (value == null) //if no value is found in the same zone, search nearby
            value = searchValueInNearbyTextZones(label, mapObject);
        if (value != null){
            console.log("Label: " + label + "      Value: " + value.text);
            jsonResult.push({
               [label]: value.text
            });
        }
    });

    return jsonResult;
}


function searchValueInSameTextZone(label, mapObject) {

    // console.log("Searching in the same zone...");

    //for now, all labels have numbers as values
    let valueCandidates = searchForNumberValues(mapObject.zoneIdx);

    //take the values and filter the ones on the right and below
    let rightCandidates = getSameLineRightCandidates(valueCandidates, mapObject.lineIdx, mapObject.wordIdx);
    let belowCandidates = getCandidatesBelow(valueCandidates, mapObject.zoneIdx, mapObject.lineIdx, mapObject.wordIdx);

    // console.log(valueCandidates);
    // console.log(rightCandidates);
    // console.log(belowCandidates);

    //return the closest candidate from both arrays
    return getClosestCandidate(rightCandidates.concat(belowCandidates), mapObject.zoneIdx, mapObject.lineIdx, mapObject.wordIdx);
}

function searchValueInNearbyTextZones(label, mapObject) {

    // console.log("Searching in the nearby zones...");

    //extract nearby zones
    let rightZoneIdx = findRightZone(mapObject.zoneIdx); //return -1 if there isnt a valid zone
    let belowZoneIdx = findZoneBelow(mapObject.zoneIdx); //return -1 if there isnt a valid zone

    //for now, all labels have numbers as values
    let rightZoneValues = rightZoneIdx != -1 ? searchForNumberValues(rightZoneIdx) : []; //only search for values if there is a zone
    let belowZoneValues = belowZoneIdx != -1 ? searchForNumberValues(belowZoneIdx) : []; //only search for values if there is a zone
    let valueCandidates = rightZoneValues.concat(belowZoneValues); //all candidates in the same array

    //take the values and filter the ones on the right and below
    let rightCandidates = getRightCandidates(valueCandidates, mapObject.zoneIdx, mapObject.lineIdx, mapObject.wordIdx);
    let belowCandidates = getCandidatesBelow(valueCandidates, mapObject.zoneIdx, mapObject.lineIdx, mapObject.wordIdx);

    // console.log(valueCandidates);
    // console.log(rightCandidates);
    // console.log(belowCandidates);

    //return the closest candidate from both arrays
    return getClosestCandidate(rightCandidates.concat(belowCandidates), mapObject.zoneIdx, mapObject.lineIdx, mapObject.wordIdx);
}

//this function search for number values inside a zone
function searchForNumberValues(zoneToSearchIdx) {
    let documentData = txtHandler.getTextZones();
    let thisZone = documentData[zoneToSearchIdx];
    let candidates = [];

    thisZone.lines.forEach((line, lineIdx) => {
        line.words.forEach((word, wordIdx) => {
            // console.log(word.text);
            if (utils.hasManyNumbers(word.text)) //a candidate has the same structure as a map (mapObject)
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
function getSameLineRightCandidates(candidates, labelLineIdx, labelWordIdx) {
    let rightCandidates = [];

    candidates.forEach(candidate => {
        if (candidate.lineIdx == labelLineIdx && candidate.wordIdx > labelWordIdx) {
            rightCandidates.push(candidate);
        }
    });
    return rightCandidates;
}

//get candidates below. Also, dont take candidates that has a right coordinate smaller than the label left coordinate
function getCandidatesBelow(candidates, labelZoneIdx, labelLineIdx, labelWordIdx) {
    let belowCandidates = [];
    let documentData = txtHandler.getTextZones();
    let labelPos = documentData[labelZoneIdx].lines[labelLineIdx].words[labelWordIdx].wordPos;  //get label position

    candidates.forEach(candidate => {
        let candidatePos = documentData[candidate.zoneIdx].lines[candidate.lineIdx].words[candidate.wordIdx].wordPos;  //get candidate position 

        if (coordHandler.isValueBelow(labelPos, candidatePos)) {
            belowCandidates.push(candidate);
        }
    });
    return belowCandidates;
}

//get candidates at the right of the label. Also, take candidates that are a bit above the label (tolerance)
function getRightCandidates(candidates, labelZoneIdx, labelLineIdx, labelWordIdx) {
    let rightCandidates = [];
    let documentData = txtHandler.getTextZones();
    let labelPos = documentData[labelZoneIdx].lines[labelLineIdx].words[labelWordIdx].wordPos;  //get label position

    candidates.forEach(candidate => {
        let candidatePos = documentData[candidate.zoneIdx].lines[candidate.lineIdx].words[candidate.wordIdx].wordPos;  //get candidate position 

        if (coordHandler.isValueRight(labelPos, candidatePos)) {
            rightCandidates.push(candidate);
        }
    });
    return rightCandidates;
}

function getClosestCandidate(candidates, labelZoneIdx, labelLineIdx, labelWordIdx) {
    if (candidates.length == 0)
        return null;

    let bestCandidate, bestCandidateDistance = 2000000.0;
    let documentData = txtHandler.getTextZones();
    let labelPos = documentData[labelZoneIdx].lines[labelLineIdx].words[labelWordIdx].wordPos;  //get label position

    candidates.forEach(candidate => {
        let candidatePos = documentData[candidate.zoneIdx].lines[candidate.lineIdx].words[candidate.wordIdx].wordPos;  //get candidate position 
        let distance = coordHandler.wordDistance(labelPos, candidatePos);
        // console.log(distance);
        if (distance < bestCandidateDistance) {
            bestCandidateDistance = distance;
            bestCandidate = candidate;
        }
    });
    return bestCandidate;
}

//get the first text zone that is on the right
function findRightZone(labelZoneIdx) {
    let documentData = txtHandler.getTextZones();
    let zonePos = documentData[labelZoneIdx].zonePos;  //get label position
    let bestZoneIdx = -1, bestZoneDistance = 2000000;

    documentData.forEach((zone, zoneIdx) => {
        let candidateZonePos = zone.zonePos;
        if (coordHandler.isValidRightZone(zonePos, candidateZonePos)) { //check if this zone is at the right and if intersect in the height direction
            let distance = coordHandler.horizontalZoneDistance(zonePos, candidateZonePos); //get the zone that is closest to the label zone
            if (distance < bestZoneDistance) {
                bestZoneDistance = distance;
                bestZoneIdx = zoneIdx;
            }
        }
    });
    return bestZoneIdx; //if there isnt a best zone, return -1

}

//get the first text zone that is below
function findZoneBelow(labelZoneIdx) {
    let documentData = txtHandler.getTextZones();
    let zonePos = documentData[labelZoneIdx].zonePos;  //get label position

    let bestZoneIdx = -1, bestZoneDistance = 2000000;

    documentData.forEach((zone, zoneIdx) => {
        let candidateZonePos = zone.zonePos;
        if (coordHandler.isValidBelowZone(zonePos, candidateZonePos)) { //check if this zone is at the bottom and if intersect in the width direction
            let distance = coordHandler.verticalZoneDistance(zonePos, candidateZonePos); //get the zone that is closest to the label zone
            // console.log(zone.lines);

            if (distance < bestZoneDistance) {
                bestZoneDistance = distance;
                bestZoneIdx = zoneIdx;
            }
        }
    });
    return bestZoneIdx; //if there isnt a best zone, return -1
}