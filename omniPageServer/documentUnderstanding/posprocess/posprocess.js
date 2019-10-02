module.exports = {
    createListeners: createListeners
}

const bus = require('../../eventBus');
const keyValPair = require('./keyValuePair');

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

    //algorithm: given a label, first search for values in the same textZone/cellZone/tableZone. If no value is found, search in the nearby zones on the right and on the bottom
    keyValPair.findKeyValuePairs(parameters);
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