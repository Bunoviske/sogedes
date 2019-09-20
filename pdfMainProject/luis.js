/********************************* 
 HTTP REQUEST
*********************************/

const https = require('https');
const querystring = require("querystring");

const fs = require('fs');
const { PerformanceObserver, performance } = require('perf_hooks');
let t0 = performance.now();

let responseCounter = 0;
let bestResults = [];
let outputJsonFile;

//create event bus
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const eventBus = new MyEmitter();

function createOutputJsonFile(filePath){
    var filename = filePath.replace(/^.*[\\\/]/, '');
    var dirname1 = filePath.substring(0, filePath.lastIndexOf("/")) + "/results";
    var dirname2 = filePath.substring(0, filePath.lastIndexOf("\\")) + "\\results";
    var dirname = dirname1.length > dirname2.length ? dirname1 : dirname2; //test the substring with the two separators and get the dirname that is bigger

    if (!fs.existsSync(dirname)){ //create subfolder /results if it doesn't exist. 
        fs.mkdirSync(dirname);
    }

    outputJsonFile = dirname + '/' + filename + "-luisResponse.json";
    fs.writeFile(outputJsonFile, "{\"Result\": \"Nothing\"}", (err) => { //create a result json file for this pdf document
        if (err) throw err;
    });
}

function callLuis(query, luisSentenceMap) {


    var urlLuis = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e396e0f0-076c-4d27-aa64-9811cd3a93b7?verbose=true&timezoneOffset=0&subscription-key=df4d7cbcb3ee4eae9df69e4016e636f5&q=';
    // query = 'überweisung $1650,00';

    https.get(urlLuis + querystring.escape(query) , (resp) => { //convert query to URL encoding

        let data = '';
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            //console.log(data);
            //fs.writeFile(__dirname + "/pdfResponse" + responseCounter + ".txt", JSON.stringify(data));
            responseCounter++;
            analyseResponse(data, luisSentenceMap);
            var t1 = performance.now();
            console.log("LUIS response in " + (t1 - t0) + " milliseconds.");

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function analyseResponse(jsonRes, luisSentenceMap) {

    let arr = JSON.parse(jsonRes);
    let pdfItems = [];

    arr.entities.forEach(element => {
        if (element.type == "TotalBrutto" || element.type == "TotalNetto" || element.type == "SV-nummer" || element.type == "Steuer-ID" ||
            element.type == "Geburtstag") {

            bestResults.push(
                {
                    label: element.entity,
                    score: element.score,
                    type: element.type,
                    startIndex: element.startIndex,
                    endIndex: element.endIndex
                }
            );
            //console.log(luisSentenceMap[element.startIndex]);
            pdfItems.push(luisSentenceMap[element.startIndex]);

        }
    });
    fs.writeFile(outputJsonFile, JSON.stringify(bestResults), (err) => {
        if (err) throw err;
    });
    eventBus.emit('receivedLuisResponse', pdfItems);
}

module.exports = {
    callLuis: callLuis,
    createOutputJsonFile: createOutputJsonFile,
    eventBus: eventBus
}