module.exports = {
    debugWithoutApi: debugWithoutApi,
}

const bus = require('../../eventBus');

function debugWithoutApi(luisSentence, luisSentencesMap, idx) {

    let searchVariable = "Betrag";
    let foundElem = luisSentence.search(searchVariable);
    if (foundElem != -1) {
        bus.notifyEvent("ParsedTableHeaders", {
            bestResults: [{
                label: searchVariable,
                score: "element.score",
                type: "element.type",
                mapObject: getLuisSentenceMapObject(luisSentence, luisSentencesMap[idx], foundElem)
            }]
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
