module.exports = {
    createListeners: createListeners,
    getPosProcessingResult: getPosProcessingResult
}

const bus = require('../../eventBus');
const keyValPair = require('./keyValuePairExtraction');
const contText = require('./continuousTextExtraction');
const tables = require('./tableExtraction/tableExtraction');

let posProcessingJsonResult = {
    keyValPairs: [],
    continuousTextInfo: [],
    tablesDescription: []
}

function getPosProcessingResult(){
    return posProcessingJsonResult;
}

function createListeners() {
    bus.addEventListener("ParsedKeyValuePairs", findKeyValuePairs);
    bus.addEventListener("ParsedContinuousText", getInfoFromContinuousText);
    bus.addEventListener("ParsedTableHeaders", findTables);
}

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

    console.log("Finding key value pairs...");

    //algorithm: given a label, first search for values in the same textZone/cellZone/tableZone. If no value is found, search in the nearby zones on the right and on the bottom
    let keyValuePairs = keyValPair.findKeyValuePairs(parameters);
    posProcessingJsonResult.keyValPairs = keyValuePairs;
    bus.notifyEvent("finishedPosProcessingStep", {step: "keyValuePairs"});
}

//same parameters as the function findKeyValuePairs
function findTables(parameters){
    console.log("Finding tables...");

    //algorithm: given the headers, search for the items that follow some criteria (zone alignment, words alignment... )
    let tablesDescription = tables.findTables(parameters);
    posProcessingJsonResult.tablesDescription = tablesDescription;
    bus.notifyEvent("finishedPosProcessingStep", {step: "tables"});

}

/********
@parameters = {
    result =
        {
            intent:
            score:
            entities: 
            compositeEntities:
        }
}
********/
function getInfoFromContinuousText(parameters) {
    let continuousTextInfo = contText.findInfoFromContinuousText(parameters);
    if (continuousTextInfo != null)
        posProcessingJsonResult.continuousTextInfo.push(continuousTextInfo);
    bus.notifyEvent("finishedPosProcessingStep", {step: "continuousText"});
}