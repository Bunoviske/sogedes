module.exports = {
    extractTextZones: extractTextZones,
    getTextZones: getTextZones
}

const coordHandler = require('./coordinatesHandler');
const luisPreproc = require('./luisPreprocess');

let documentData = []; //main data structure that contains each text zone, line, words and attributes
/********
documentData = {
    zonePos: zonePosition,
    lines: [{ 
        linePos: linePosition,
        lineFont: lineFont,
        spaces: [{
            width: width
        }],
        words: [{
            wordPos: wordPosition,
            text: string
            }
        ]}
    ]                
}
********/

function getTextZones() {
    return documentData;
}

//retrieves the text from text zones and fill two data structures (one that contain all the xml useful information and other that helps with luis response processing)
function extractTextZones(zones) {

    // console.log(zones[0].ln[0].space);

    zones.forEach((zone, zoneIdx) => {
        // console.log(zone); 
        addZoneData(zone);

        zone.ln.forEach((line, lineIdx) => {
            // console.log(line);
            addLineData(line);

            if (typeof line.space != "undefined")
                line.space.forEach((space) => {
                    // console.log(space);
                    addSpaceData(space);
                });

            if (typeof line.wd != "undefined")
                line.wd.forEach((word, wordIdx) => {
                    // console.log(word);
                    addWordData(word);
                });
                
            luisPreproc.addLuisSentence(documentData, zoneIdx, lineIdx);
        });
        luisPreproc.addContinuousTextLuisSentence(documentData, zoneIdx);
    });
    luisPreproc.sinalizeEndOfDocument(); //it is necessary to sinalize end of the document to the luis preprocessing class
    // console.log(documentData[0].lines[0]);
}

function addZoneData(zone) {
    let zonePosition = coordHandler.getPositionObject(zone.$.l, zone.$.t, zone.$.r, zone.$.b);
    documentData.push({
        zonePos: zonePosition,
        lines: []
    });
}

function addLineData(line) {
    let linePosition = coordHandler.getPositionObject(line.$.l, line.$.t, line.$.r, line.$.b);
    let lineFont = parseInt(line.$.fontSize);
    getLastZone().lines.push({
        linePos: linePosition,
        lineFont: lineFont,
        spaces: [],
        words: []
    });
}

function addSpaceData(space) {
    if (typeof space.$ != "undefined")
        getLastLine().spaces.push({
            width: parseInt(space.$.width)
        });
}

function addWordData(word) {
    let wordPosition = coordHandler.getPositionObject(word.$.l, word.$.t, word.$.r, word.$.b);
    let string = word.run[0]._;
    // console.log(string);

    getLastLine().words.push({
        wordPos: wordPosition,
        text: string
    });
}

function getLastZone() {
    return documentData[documentData.length - 1];
}

function getLastLine() {
    return getLastZone().lines[getLastZone().lines.length - 1];
}