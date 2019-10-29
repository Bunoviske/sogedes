module.exports = {
    findKeyValuePairs: findKeyValuePairs
}

const txtHandler = require('../preprocess/textZoneHandler');
const coordHandler = require('../coordinatesHandler');
const utils = require('../commonUtils');
const resultsParser = require('./keyValResultsParser');

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

    //if more than one entity is defined as the same type, sort them in descending order based on the score
    let sortedResults = resultsParser.sortResultsByScore(parameters.bestResults);

    Object.keys(sortedResults).forEach(labelType => {

        for (let i = 0; i < sortedResults[labelType].length; i++) { //iterate through each label.type
            let result = sortedResults[labelType][i];
            let label = result.type;

            //for key value pair extraction, it is important to know the zone that the words are into. So I can take just the first word map from the array
            let labelMapObject = result.mapObjects[0];

            let sameZoneValue = searchValueInSameTextZone(label, labelMapObject);
            let nearbyZoneValue = searchValueInNearbyTextZones(label, labelMapObject);
            let value = chooseBestValue(labelMapObject, sameZoneValue, nearbyZoneValue);

            if (value != null) {
                console.log("Label: " + label + "      Value: " + value.text);
                jsonResult.push({
                    [label]: value.text
                });
                break; //just iterate through the next result with this type with higher score has not any value detected
            }
        }
    });
    return jsonResult;
}

function chooseBestValue(labelMapObject, sameZoneValue, nearbyZoneValue){
    //no value was found
    if (sameZoneValue == null && nearbyZoneValue == null) return null;
    
    //when just one value is found, return it immediately
    if (sameZoneValue != null && nearbyZoneValue == null) return sameZoneValue;
    if (sameZoneValue == null && nearbyZoneValue != null) return nearbyZoneValue;

    // console.log(sameZoneValue.text);
    // console.log(nearbyZoneValue.text);

    //return the value that is closest to the label
    let candidates = [sameZoneValue, nearbyZoneValue];
    //TODO - get the closest only if the sameZoneValue is too far compared to the nearbyValue
    return getClosestCandidate(candidates, labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);
}

function searchValueInSameTextZone(label, labelMapObject) {

    // console.log("Searching in the same zone...");

    //for now, all labels have numbers as values
    let valueCandidates = searchForNumberValues(labelMapObject.zoneIdx);

    //take the values and filter the ones on the right and below
    let rightCandidates = getSameLineRightCandidates(valueCandidates, labelMapObject.lineIdx, labelMapObject.wordIdx);
    let belowCandidates = getCandidatesBelow(valueCandidates, labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);

    // console.log(valueCandidates);
    // console.log(rightCandidates);
    // console.log(belowCandidates);

    //return the closest candidate from both arrays
    return getClosestCandidate(rightCandidates.concat(belowCandidates), labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);
}

function searchValueInNearbyTextZones(label, labelMapObject) {

    // console.log("Searching in the nearby zones...");

    //extract nearby zones
    let rightZoneIdx = findRightZone(labelMapObject.zoneIdx); //return -1 if there isnt a valid zone
    let belowZoneIdx = findZoneBelow(labelMapObject.zoneIdx); //return -1 if there isnt a valid zone
    let insideZonesIdx = findAllZonesInside(labelMapObject.zoneIdx); //return [] if there arent zones inside. this function returns an array

    let candidates = getCandidatesFromZones(rightZoneIdx, belowZoneIdx, insideZonesIdx);

    //take the values and filter the ones on the right and below
    let rightCandidates = getRightCandidates(candidates, labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);
    let belowCandidates = getCandidatesBelow(candidates, labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);

    // console.log(candidates);
    // console.log(rightCandidates);
    // console.log(belowCandidates);

    //return the closest candidate from both arrays
    return getClosestCandidate(rightCandidates.concat(belowCandidates), labelMapObject.zoneIdx, labelMapObject.lineIdx, labelMapObject.wordIdx);
}

function getCandidatesFromZones(rightZoneIdx, belowZoneIdx, insideZonesIdx){
    //for now, all labels have numbers as values
    let rightZoneValues = rightZoneIdx != -1 ? searchForNumberValues(rightZoneIdx) : []; //only search for values if there is a zone
    let belowZoneValues = belowZoneIdx != -1 ? searchForNumberValues(belowZoneIdx) : []; //only search for values if there is a zone
    let insideZoneValues = getInsideZoneValues(insideZonesIdx);

    return rightZoneValues.concat(belowZoneValues).concat(insideZoneValues); //all candidates in the same array
}

function getInsideZoneValues(insideZonesIdx){
    let insideZoneValues = [];
    insideZonesIdx.forEach( zoneIdx => {
        insideZoneValues.push(searchForNumberValues(zoneIdx));
    });
    return insideZoneValues;
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

function findAllZonesInside(labelZoneIdx){
    let insideZones = [];
    return insideZones; 
}

//get the first text zone that is not empty and that is on the right
function findRightZone(labelZoneIdx) {
    let documentData = txtHandler.getTextZones();
    let zonePos = documentData[labelZoneIdx].zonePos;  //get label position
    let bestZoneIdx = -1, bestZoneDistance = 2000000;

    documentData.forEach((zone, zoneIdx) => {
        if (zone.lines.length == 0)
            return; //skip zones that are empty. (only possible in cell zones that were converted to txt zones)


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

//get the first text zone that is not empty and that is below
function findZoneBelow(labelZoneIdx) {
    let documentData = txtHandler.getTextZones();
    let zonePos = documentData[labelZoneIdx].zonePos;  //get label position

    let bestZoneIdx = -1, bestZoneDistance = 2000000;

    documentData.forEach((zone, zoneIdx) => {

        if (zone.lines.length == 0)
            return; //skip zones that are empty. (only possible in cell zones that were converted to txt zones)

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