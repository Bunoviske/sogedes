module.exports = {
    extractEntitiesFromGenericText: extractEntitiesFromGenericText,
    extractIntentsFromContinuousText: extractIntentsFromContinuousText
}

const https = require('https');
const querystring = require("querystring");
const bus = require('../eventBus');
const { _, performance } = require('perf_hooks');
const tableDef = require('./luisDefinitions/tablesDefinition')
const keyValDef = require('./luisDefinitions/keyValPairsDefinition')
const contTextDef = require('./luisDefinitions/continuousTextDefinition')

const genericSentenceLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/1e35ceda-dfc9-4a94-8535-85a788a63a64?verbose=true&timezoneOffset=0&subscription-key=21ddb7c530d841c59feb5f7d8b8d28e1&q=';
const continuousTextLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/7a89d70d-fb31-48b0-b6e0-0a330757dd10?verbose=true&timezoneOffset=0&subscription-key=21ddb7c530d841c59feb5f7d8b8d28e1&q=';

let bestLabelResults = [];
let bestTableHeaderResults = [];
let responseCounter = 0; //this is just used for counting the response from the key value pair app

let DEBUG_POSPROCESSING = true;

function extractEntitiesFromGenericText(luisSentences, luisSentencesMap) {

    luisSentences.forEach((luisSentence, idx) => {
        if (DEBUG_POSPROCESSING) {
            // console.log(luisSentence);
            let searchVariable = "Betrag";
            let foundElem = luisSentence.search(searchVariable);
            if (foundElem != -1) {
                bus.notifyEvent("posprocessTablesLuisResponse", {
                    bestResults: [{
                        label: searchVariable,
                        score: "element.score",
                        type: "element.type",
                        mapObject: getLuisSentenceMapObject(luisSentence, luisSentencesMap[idx], foundElem)
                    }]
                });
            }
            return;
        }

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) {
            responseCounter++;
            let t1 = performance.now();
            // console.log("LUIS response for sentence number " + idx + " in " + (t1 - t0) + " milliseconds.");
            analyseEntitiesExtraction(parameters.data, luisSentencesMap[idx]);
            checkIfReceivedAllResponses(luisSentences.length);
        };
        callLuis(genericSentenceLuisUrl, luisSentence, thisSentenceListener);
    });
}

function extractIntentsFromContinuousText(continuousTextSentences, continuousTextMap) {
    // console.log(continuousTextSentences);
    // console.log(continuousTextMap);

    continuousTextSentences.forEach((luisSentence, idx) => {

        if (DEBUG_POSPROCESSING) {
            // console.log(luisSentence);
            return;
        }

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) {
            let t1 = performance.now();
            // console.log("LUIS response for continuous text number " + idx + " in " + (t1 - t0) + " milliseconds.");
            analyseIntentsExtraction(parameters.data, continuousTextMap[idx]);
        };
        callLuis(continuousTextLuisUrl, luisSentence, thisSentenceListener);
    });
}

function callLuis(urlLuis, query, listenerFunction) {
    httpRequest(urlLuis, query, listenerFunction);
}

function httpRequest(urlLuis, query, listenerFunction) {
    // query = 'überweisung $1650,00';
    https.get(urlLuis + querystring.escape(query), (resp) => { //convert query to URL encoding
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            // console.log(data);
            console.log(`statusCode: ${resp.statusCode}`)
            listenerFunction({ data: data }); //call response listener callback
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function checkIfReceivedAllResponses(numCalls) { //call posprocessing step for generic sentences when you have all the results. it is important to know all entities before posprocessing
    if (responseCounter == numCalls) {
        responseCounter = 0;
        // console.log("Calling posprocessing step for these best results: " + bestResults);
        bus.notifyEvent("posprocessKeyValuesLuisResponse", { bestResults: bestLabelResults });
        bus.notifyEvent("posprocessTablesLuisResponse", { bestResults: bestTableHeaderResults });
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
            bus.notifyEvent("posprocessContinuousTextLuisResponse", { result: result });
        }
    }
}



