module.exports = {
    extractLabels: extractLabels,
    extractContinuousText: extractContinuousText
}

const https = require('https');
const querystring = require("querystring");
const bus = require('../eventBus');
const { _, performance } = require('perf_hooks');

const urlLuis = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e396e0f0-076c-4d27-aa64-9811cd3a93b7?verbose=true&timezoneOffset=0&subscription-key=df4d7cbcb3ee4eae9df69e4016e636f5&q=';
let bestResults = [];
let responseCounter = 0;

function extractLabels(luisSentences, luisSentencesMap) {

    luisSentences.forEach((luisSentence, idx) => {

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) { 
            responseCounter++;
            let t1 = performance.now();
            console.log("LUIS response for sentence number " + idx + " in " + (t1 - t0) + " milliseconds.");
            analyseLabelExtraction(parameters.data, luisSentencesMap[idx]);
            checkIfReceivedAllResponses(luisSentences.length);
        };
        callLuis(luisSentence, thisSentenceListener);
    });
}

function extractContinuousText(continuousTextSentences, continuousTextMap) {
    // console.log(continuousTextSentences);
    // console.log(continuousTextMap);

    continuousTextSentences.forEach((luisSentence, idx) => {

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) { 
            responseCounter++;
            let t1 = performance.now();
            console.log("LUIS response for continuous text number " + idx + " in " + (t1 - t0) + " milliseconds.");
            analyseContinuousTextExtraction(parameters.data, continuousTextMap[idx]);
        };
        callLuis(luisSentence, thisSentenceListener);
    });
}

function callLuis(query, listenerFunction) {
    listenerFunction({ data: "{\"data\": \"data OLA OI\"}" });
    return;

    // query = 'überweisung $1650,00';
    https.get(urlLuis + querystring.escape(query), (resp) => { //convert query to URL encoding
        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log(data);
            listenerFunction({ data: data }); //call response listener callback
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function checkIfReceivedAllResponses(numCalls) { //call posprocessing step when you have all the results. it is important to know all entities before posprocessing
    if (responseCounter == numCalls) {
        responseCounter = 0;
        console.log("Calling posprocessing step for these best results: " + bestResults);
        bus.notifyEvent("posprocessLuisResponse", { bestResults: bestResults });
    }
}

function analyseLabelExtraction(jsonRes, luisSentenceMap) {

    let arr = JSON.parse(jsonRes);

    if (typeof arr.entities != "undefined") {
        arr.entities.forEach(element => {
            if (element.type == "TotalBrutto" || element.type == "TotalNetto" || element.type == "SV-nummer" || element.type == "Steuer-ID" ||
                element.type == "Geburtstag") {

                bestResults.push(
                    {
                        label: element.entity,
                        score: element.score,
                        type: element.type,
                        startIndex: element.startIndex,
                        endIndex: element.endIndex,
                        luisSentenceMapObject: getLuisSentenceMapObject(arr.query, luisSentenceMap, element.startIndex)
                    }
                );
            }
        });
    }
}

function getLuisSentenceMapObject(luisSentence, luisSentenceMap, startIndex) {
    let words = luisSentence.split(' ');
    let i = 0, charAccumulator = 0;
    //accumalates the words length until it reaches the startIndex. Then is possible to retrieve the word index in the map
    while (startIndex != charAccumulator && i < words.length) {
        charAccumulator += words[i++].length + 1; //gets the length of every word plus the space
    }
    console.log(luisSentenceMap[i]);
    //dont consider error cases here (startIndex is assumed always correct). otherwise returns the last index of the map
    return luisSentenceMap[i];
}

function analyseContinuousTextExtraction(jsonRes, textZoneIdx) {

    let arr = JSON.parse(jsonRes);
    // console.log(arr);

    //TODO - Implement this function

    //each sentence is an intent, so the posprocessing can happen independently
    console.log("Calling posprocessing step for this continuous text: " + arr);
    bus.notifyEvent("posprocessContinuousTextLuisResponse", { bestResults: "bestResults" });

}



