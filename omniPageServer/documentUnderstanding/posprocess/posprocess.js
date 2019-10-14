module.exports = {
    createListeners: createListeners
}

const bus = require('../../eventBus');
const keyValPair = require('./keyValuePair');
const contText = require('./continuousText');
const sysHandler = require('../../fileSystemHandler/fileSystemHandler');


function createListeners() {
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

    //algorithm: given a label, first search for values in the same textZone/cellZone/tableZone. If no value is found, search in the nearby zones on the right and on the bottom
    keyValPair.findKeyValuePairs(parameters);
    // sysHandler.getFileSystemHandler("jsonHandler").writeJsonFile("data");

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
    contText.findInfoFromContinuousText(parameters);
    // sysHandler.getFileSystemHandler("jsonHandler").writeJsonFile("data");
}