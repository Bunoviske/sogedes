module.exports = {
    checkIfReceivedAllResponses: checkIfReceivedAllResponses,
    analyseEntitiesExtraction: analyseEntitiesExtraction,
    analyseIntentsExtraction: analyseIntentsExtraction
}

const bus = require('../../eventBus');
const tableDef = require('../luisDefinitions/tablesDefinition')
const keyValDef = require('../luisDefinitions/keyValPairsDefinition')
const contTextDef = require('../luisDefinitions/continuousTextDefinition')

let bestLabelResults = [];
let bestTableHeaderResults = [];

function checkIfReceivedAllResponses(responseCounter, numCalls) { //call posprocessing step for generic sentences when you have all the results. it is important to know all entities before posprocessing
    if (responseCounter == numCalls) {
        responseCounter = 0;
        // console.log("Calling posprocessing step for these best results: " + bestResults);
        bus.notifyEvent("ParsedKeyValuePairs", { bestResults: bestLabelResults });
        bus.notifyEvent("ParsedTableHeaders", { bestResults: bestTableHeaderResults });
    }
}

function analyseEntitiesExtraction(jsonRes, luisSentenceMap) {

    let arr = JSON.parse(jsonRes);

    if (typeof arr.entities != "undefined") {
        arr.entities.forEach(element => {
            if ( keyValDef.isDefinedEntity(element.type) ) {
                // console.log(arr);

                bestLabelResults.push(
                    {
                        label: element.entity,
                        score: element.score,
                        type: element.type,
                        // startIndex: element.startIndex,
                        // endIndex: element.endIndex,
                        mapObject: getLuisSentenceMapObject(arr.query, luisSentenceMap, element.startIndex)
                    }
                );
            }
            else if ( tableDef.isDefinedTableHeader(element.type) ){
                bestTableHeaderResults.push(
                    {
                        label: element.entity,
                        score: element.score,
                        type: element.type,
                        // startIndex: element.startIndex,
                        // endIndex: element.endIndex,
                        mapObject: getLuisSentenceMapObject(arr.query, luisSentenceMap, element.startIndex)
                    }
                );
            }
        });
    }
}


//TODO - this object can only return one word. Sometimes there are multiple words detected by LUIS (endIndex != word.length)
function getLuisSentenceMapObject(luisSentence, luisSentenceMap, startIndex) {
    let words = luisSentence.split(' ').filter(word => word != ''); //get rid of empty values in the end of the array (split function puts a '' string in the end)
    let i = 0, charAccumulator = 0;
    //accumulates the words length until it reaches the startIndex. Then is possible to retrieve the word index in the map
    while (startIndex != charAccumulator && i < words.length) {

        if (startIndex < charAccumulator + words[i].length) { //in case luis detected a word that the start index is not in the begin of the word
            console.log("Start index is not in the begin of the string");
            break;
        }
        charAccumulator += words[i++].length + 1; //gets the length of every word plus the space
    }
    if (i == words.length) i--; //subtract one to access the array of luisSentenceMap correctly if the counter has reached the end of the sentence

    console.log(luisSentenceMap[i]);

    //dont consider error cases here (startIndex is assumed always correct). otherwise returns the last index of the map
    return luisSentenceMap[i];
}

function analyseIntentsExtraction(jsonRes, textZoneIdx) {

    let arr = JSON.parse(jsonRes);
    // console.log(arr);
    let result;

    if (typeof arr.topScoringIntent != "undefined") {

        if (contTextDef.isDefinedIntent(arr.topScoringIntent.intent)) {
            result =
                {
                    intent: arr.topScoringIntent.intent,
                    score: arr.topScoringIntent.score,
                    entities: typeof arr.entities != "undefined" ? arr.entities : [],
                    compositeEntities: typeof arr.compositeEntities != "undefined" ? arr.compositeEntities : [],
                }
            //each sentence is an intent, so the posprocessing can happen independently
            bus.notifyEvent("ParsedContinuousText", { result: result });
        }
    }
}
