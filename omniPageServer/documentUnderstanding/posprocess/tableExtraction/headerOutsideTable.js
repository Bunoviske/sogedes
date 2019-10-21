

module.exports = {
    extractItems: extractItems,
    checkHeaderOutsideTable: checkHeaderOutsideTable
}
const tablesDef = require('../../luisDefinitions/tablesDefinition');
const txtHandler = require('../../preprocess/textZoneHandler');
const tableHandler = require('../../preprocess/tableZoneHandler');
const coordHandler = require('../../coordinatesHandler');
const utils = require('../../commonUtils');

let firstItemTxtZone;

function extractItems(headerTxtZone) {

    //it is already known that the the items are in a table and its position are stored in the variable firstItemTxtZoneIdx

    let tableDocData = tableHandler.getTableZones();
    let firstItemZone = getfirstItemTxtZone(); // this is a cellZone, so they have the property cellZoneInfo
    let table = tableDocData[firstItemZone.cellZoneInfo.tableIdx];
    let firstItemCell = table.cellZones[firstItemZone.cellZoneInfo.cellZoneIdx];
    let items = [];

    table.cellZones.forEach((cell, cellIdx) => {
        //check if there is a cell below with same colRange
        if (firstItemCell.gridColFrom == cell.gridColFrom && firstItemCell.gridColTill == cell.gridColTill && cell.gridRowFrom >= firstItemCell.gridRowFrom) {
            cell.lines.forEach((line, lineIdx) => {
                let itemText = "";
                line.words.forEach((word, wordIdx) => {
                    itemText += word.text + " ";
                });
                console.log(itemText);
                items.push({
                    tableIdx: firstItemZone.cellZoneInfo.tableIdx,
                    zoneIdx: cellIdx,//here a zone is considered as cellZone, because tableIdx is defined
                    lineIdx: lineIdx,
                    wordIdx: null, //it is null because it may be not just one word
                    text: itemText
                });
            });
        }
    });

    return items;


}

function checkHeaderOutsideTable(headerTxtZone, headerEntityName) {
    //only the header is outside the table, the items are inside cell zones.

    let isHeaderOutsideTable = false;

    //TODO - if the header is splitted in two lines, this will not work. Until luisSentenceMapObject doesnt return all the words and its position (if there is more than one),
    //this is not possible to do.

    //the header is alone in a text zone
    if (!isCellZone(headerTxtZone) && headerTxtZone.lines.length == 1 && headerTxtZone.lines[0].words.length <= tablesDef.getHeaderNumWords(headerEntityName)) {

        //check if the next zone below is a cell zone and aligned with the header zone 
        let zoneBelowIdx = findZoneBelow(headerTxtZone);

        //check if the nearest zone below is a cell zone
        let documentData = txtHandler.getTextZones();
        if (zoneBelowIdx != -1 && isCellZone(documentData[zoneBelowIdx])) {
            setfirstItemTxtZone(documentData[zoneBelowIdx]); //save the location of the first item zone
            isHeaderOutsideTable = true;
        }

    }
    return isHeaderOutsideTable;
}

function isCellZone(txtZone) {
    return (txtZone.hasOwnProperty("cellZoneInfo")); //if the textZone has cellZoneInfo, this is inside a table
}

function setfirstItemTxtZone(zoneBelow){
    firstItemTxtZone = zoneBelow;
}
function getfirstItemTxtZone(){
    return firstItemTxtZone;
}

//get the first text zone that is below
function findZoneBelow(txtZone) {
    let documentData = txtHandler.getTextZones();
    let zonePos = txtZone.zonePos;  //get label position

    let bestZoneIdx = -1, bestZoneDistance = 2000000;

    //isValidBelowZone function applies here because I consider that the header zone and the cell zone below it intersect each other in the width direction.
    //that case of table extraction happens when the OCR dont recognize the header inside a table, but the item and the header are aligned
    documentData.forEach((zone, zoneIdx) => {
        let candidateZonePos = zone.zonePos;
        if (coordHandler.isValidBelowZone(zonePos, candidateZonePos)) { //check if this zone is at the bottom and if intersect in the width direction
            let distance = coordHandler.verticalZoneDistance(zonePos, candidateZonePos); //get the zone that is closest to the label zone
            // console.log(zone.lines);

            if (distance < bestZoneDistance) {
                bestZoneDistance = distance;
                bestZoneIdx = zoneIdx;
            }
        }
    });

    return bestZoneIdx; //if there isnt a best zone, return -1
}