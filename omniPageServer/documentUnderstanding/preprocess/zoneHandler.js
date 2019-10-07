
module.exports = {
    addTextZoneData: addTextZoneData,
    addLineData: addLineData,
    addSpaceData: addSpaceData,
    addWordData: addWordData

}

/********
Common class that has methods for both textZone and tableZone extractors
********/

const coordHandler = require('../coordinatesHandler');

function addTextZoneData(zone, documentData) {
    let zonePosition = coordHandler.getPositionObject(zone.$.l, zone.$.t, zone.$.r, zone.$.b);
    documentData.push({
        zonePos: zonePosition,
        lines: []
    });
}

function addLineData(line, documentData) {
    let linePosition = coordHandler.getPositionObject(line.$.l, line.$.t, line.$.r, line.$.b);
    let lineFont = parseInt(line.$.fontSize);
    getLastZone(documentData).lines.push({
        linePos: linePosition,
        lineFont: lineFont,
        spaces: [],
        words: []
    });
}

function addSpaceData(space, documentData) {
    if (typeof space.$ != "undefined")
        getLastLine(documentData).spaces.push({
            width: parseInt(space.$.width)
        });
}

function addWordData(word, documentData) {
    let wordPosition = coordHandler.getPositionObject(word.$.l, word.$.t, word.$.r, word.$.b);
    let string = word.run[0]._;
    // console.log(string);

    getLastLine(documentData).words.push({
        wordPos: wordPosition,
        text: string
    });
}

function getLastZone(documentData) {
    return documentData[documentData.length - 1];
}

function getLastLine(documentData) {
    return getLastZone(documentData).lines[getLastZone(documentData).lines.length - 1];
}