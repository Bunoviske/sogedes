module.exports = {
    sendGenericTextSentences: sendGenericTextSentences,
    sendContinuousTextSentences: sendContinuousTextSentences
}

const https = require('https');
const querystring = require("querystring");
const bus = require('../../eventBus');
const { _, performance } = require('perf_hooks');
const debug = require('./debugWithoutApi');
const sysHandler = require('../../fileSystemHandler/fileSystemHandler')

// Free Tier
// const genericSentenceLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/1e35ceda-dfc9-4a94-8535-85a788a63a64?verbose=true&timezoneOffset=0&subscription-key=21ddb7c530d841c59feb5f7d8b8d28e1&q=';
// const continuousTextLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/7a89d70d-fb31-48b0-b6e0-0a330757dd10?verbose=true&timezoneOffset=0&subscription-key=21ddb7c530d841c59feb5f7d8b8d28e1&q=';

// Standard Tier
const genericSentenceLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/1e35ceda-dfc9-4a94-8535-85a788a63a64?verbose=true&timezoneOffset=0&subscription-key=1fe11ea8af6f4792a87a32a93b8f198d&q=';
const continuousTextLuisUrl = 'https://westeurope.api.cognitive.microsoft.com/luis/v2.0/apps/7a89d70d-fb31-48b0-b6e0-0a330757dd10?verbose=true&timezoneOffset=0&subscription-key=1fe11ea8af6f4792a87a32a93b8f198d&q=';



let responseCounter = 0; 

function sendGenericTextSentences(luisSentences, luisSentencesMap, DEBUG_POSPROCESSING) {

    sysHandler.getFileSystemHandler("logHandler").appendLogFile("\n\n\n Generic Sentences: \n\n\n");
    luisSentences.forEach((luisSentence, idx) => {
        sysHandler.getFileSystemHandler("logHandler").appendLogFile(luisSentence + "\r\n\r\n");

        if (DEBUG_POSPROCESSING) {
            // console.log(luisSentence);
            debug.debugWithoutApi(luisSentence, luisSentencesMap, idx);
            return;
        }

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) {
            let t1 = performance.now();
            // console.log("LUIS response for sentence number " + idx + " in " + (t1 - t0) + " milliseconds.");

            bus.notifyEvent("ReceivedGenericSentenceResponse", { //notify API Handler that a http response has arrived. Pass all the necessary parameters 
                data: parameters.data,
                sentenceIdx: idx
            });
        };
        callLuis(genericSentenceLuisUrl, luisSentence, thisSentenceListener);
    });
}

function sendContinuousTextSentences(continuousTextSentences, continuousTextMap, DEBUG_POSPROCESSING) {
    // console.log(continuousTextSentences);
    // console.log(continuousTextMap);
    
    sysHandler.getFileSystemHandler("logHandler").appendLogFile("\n\n\n Continuous Text Sentences: \n\n\n");
    continuousTextSentences.forEach((luisSentence, idx) => {
        sysHandler.getFileSystemHandler("logHandler").appendLogFile(luisSentence + "\r\n\r\n");
        if (DEBUG_POSPROCESSING) {
            // console.log(luisSentence);
            return;
        }

        let t0 = performance.now();

        //Parameters = {data: data}
        let thisSentenceListener = function (parameters) {
            let t1 = performance.now();
            // console.log("LUIS response for continuous text number " + idx + " in " + (t1 - t0) + " milliseconds.");

            bus.notifyEvent("ReceivedContTextSentenceResponse", { //notify API Handler that a http response has arrived. Pass all the necessary parameters 
                data: parameters.data,
                sentenceIdx: idx
            });
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
            sysHandler.getFileSystemHandler("logHandler").appendLogFile("Http response from LUIS: \r\n" + data + "\r\n\r\n");
            if (parseInt(resp.statusCode) == 429 ) console.log(`Http Error: ${resp.statusCode}`);
            listenerFunction({ data: data }); //call response listener callback
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}