module.exports = {
    extractTextZones: extractTextZones,
    getTextZones: getTextZones,
    addCellZonesAsTexZones: addCellZonesAsTexZones
}

const luisPreproc = require('./luisPreprocess');
const zoneHandler = require('./zoneHandler');

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

function addCellZonesAsTexZones(cellZones) {
    // console.log(cellZones.length);
    let lastZoneIdx = documentData.length;

    cellZones.forEach( (cellZone, zoneIdx) => {
        documentData.push(cellZone); //add cell zone in the documentData 
        //take care of luis sentences here 
        cellZone.lines.forEach( (line, lineIdx) => {
            // console.log(line);
            luisPreproc.addLuisSentence(documentData, zoneIdx + lastZoneIdx, lineIdx);
        });
        luisPreproc.addContinuousTextLuisSentence(documentData, zoneIdx + lastZoneIdx);
    });
    luisPreproc.sinalizeEndOfDocument(); //it is necessary to sinalize end of the document extraction to the luis preprocessing class
}

//retrieves the text from text zones and fill two data structures (one that contain all the xml useful information and other that helps with luis response processing)
function extractTextZones(zones) {

    // console.log(zones[0].ln[0].space);

    zones.forEach((zone, zoneIdx) => {
        // console.log(zone); 
        zoneHandler.addTextZoneData(zone, documentData);

        zone.ln.forEach((line, lineIdx) => {
            // console.log(line);
            zoneHandler.addLineData(line, documentData);

            if (typeof line.space != "undefined")
                line.space.forEach((space) => {
                    // console.log(space);
                    zoneHandler.addSpaceData(space, documentData);
                });

            if (typeof line.wd != "undefined")
                line.wd.forEach((word, wordIdx) => {
                    // console.log(word);
                    zoneHandler.addWordData(word, documentData);
                });

            luisPreproc.addLuisSentence(documentData, zoneIdx, lineIdx);
        });
        luisPreproc.addContinuousTextLuisSentence(documentData, zoneIdx);
    });
    // console.log(documentData[0].lines[0]);
}