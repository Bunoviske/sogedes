module.exports = {
    extractEntitiesFromGenericText: extractEntitiesFromGenericText,
    extractIntentsFromContinuousText: extractIntentsFromContinuousText
}

const bus = require('../../eventBus');
const httpReq = require('./httpRequest')
const httpParse = require('./httpResponseParse')

let DEBUG_POSPROCESSING = true;

function extractEntitiesFromGenericText(luisSentences, luisSentencesMap) {

    createGenericResponseListener(luisSentences, luisSentencesMap);
    httpReq.sendGenericTextSentences(luisSentences, luisSentencesMap, DEBUG_POSPROCESSING)
}

function extractIntentsFromContinuousText(continuousTextSentences, continuousTextMap) {

    createContTextResponseListener(continuousTextSentences, continuousTextMap);
    // httpReq.sendContinuousTextSentences(continuousTextSentences, continuousTextMap, DEBUG_POSPROCESSING)
}

function createGenericResponseListener(luisSentences, luisSentencesMap) {

    let responseCounter = 0; //this is just used for counting the response from the generic sentences app
    //Parameters = {data: data, sentenceIdx: idx}
    bus.addEventListener("ReceivedGenericSentenceResponse", function (parameters) { //when there is a http response, call the parser
        responseCounter++; 
        httpParse.analyseEntitiesExtraction(parameters.data, luisSentencesMap[parameters.sentenceIdx]);
        httpParse.checkIfReceivedAllResponses(responseCounter, luisSentences.length);
    });
}

function createContTextResponseListener(continuousTextSentences, continuousTextMap) {

    //Parameters = {data: data, sentenceIdx: idx}
    bus.addEventListener("ReceivedContTextSentenceResponse", function (parameters) { //when there is a http response, call the parser
        httpParse.analyseIntentsExtraction(parameters.data, continuousTextMap[parameters.sentenceIdx]);
    });
}




