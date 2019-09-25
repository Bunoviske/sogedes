module.exports = {
    getTextZones: getTextZones
}

const coordHandler = require('./coordinatesHandler');

let luisSentence = ""; //sentence to be sent to luis
let luisSentenceMap = []; //maps luis sentence and the documentData structure
let documentData = []; //main data structure that contains each zone, line, words and attributes

//retrieves the text from text zones and fill two data structures (one that contain all the xml useful information and other that helps with luis response processing)
function getTextZones(zones) {

    let zonePosition, linePosition, lineFont, wordPosition;
    zones.forEach( (zone, zoneIdx) => {
        // console.log(zone); 
        zonePosition = coordHandler.getPositionObject(zone.$.l, zone.$.t, zone.$.r, zone.$.b);  

        zone.ln.forEach( (line, lineIdx) => {
            // console.log(line);
            linePosition = coordHandler.getPositionObject(line.$.l, line.$.t, line.$.r, line.$.b);
            lineFont = line.$.fontSize;

            line.wd.forEach( (word, wordIdx) => {
                // console.log(word);
                wordPosition = coordHandler.getPositionObject(word.$.l, word.$.t, word.$.r, word.$.b);
                word.run.forEach( string => {

                    // console.log(string._);
                });
            });
        });
    });
    
}