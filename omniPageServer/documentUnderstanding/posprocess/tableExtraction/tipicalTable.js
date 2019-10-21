module.exports = {
    extractItems: extractItems,
    checkTipicalTable: checkTipicalTable
}

const tablesDef = require('../../luisDefinitions/tablesDefinition');
const txtHandler = require('../../preprocess/textZoneHandler');
const tableHandler = require('../../preprocess/tableZoneHandler');
const coordHandler = require('../../coordinatesHandler');
const utils = require('../../commonUtils');

function extractItems(txtZone) {

    //it is already known that the header and the items are in a table

    let tableDocData = tableHandler.getTableZones();
    let table = tableDocData[txtZone.cellZoneInfo.tableIdx];
    let headerCell = table.cellZones[txtZone.cellZoneInfo.cellZoneIdx];
    let items = [];

    table.cellZones.forEach((cell, cellIdx) => {
        //check if there is a cell below with same colRange
        if (headerCell.gridColFrom == cell.gridColFrom && headerCell.gridColTill == cell.gridColTill && cell.gridRowFrom > headerCell.gridRowTill) {
            cell.lines.forEach((line, lineIdx) => {
                let itemText = "";
                line.words.forEach((word, wordIdx) => {
                    itemText += word.text + " ";
                });
                console.log(itemText);
                items.push({
                    tableIdx: txtZone.cellZoneInfo.tableIdx,
                    zoneIdx: cellIdx,
                    lineIdx: lineIdx,
                    wordIdx: null,
                    text: itemText
                });
            });
        }
    });

    return items;
}

function checkTipicalTable(thisTxtZone, headerEntityName) {
    //best scenario, when header is alone in the table cell
    let isTipicalTable = false;
  
    if (isCellZone(thisTxtZone) && thisTxtZone.lines.length == 1 && thisTxtZone.lines[0].words.length <= tablesDef.getHeaderNumWords(headerEntityName)) {
        //check if the next zone below is a cell zone and aligned with the header cell (then, it is considered to be a tipical table)
        let tableDocData = tableHandler.getTableZones();
        let table = tableDocData[thisTxtZone.cellZoneInfo.tableIdx];
        let headerCell = table.cellZones[thisTxtZone.cellZoneInfo.cellZoneIdx];
        for (let it in table.cellZones)
        /*table.cellZones.forEach(cell =>*/ {
            //check if there is a cell below with same colRange
            let cell = table.cellZones[it];
            if (headerCell.gridColFrom == cell.gridColFrom && headerCell.gridColTill == cell.gridColTill && headerCell.gridRowTill + 1 == cell.gridRowFrom) {
                isTipicalTable = true;
                return isTipicalTable;
            }
        }//);
    }
    return isTipicalTable;

}

function isCellZone(thisTxtZone) {
    return (thisTxtZone.hasOwnProperty("cellZoneInfo")); //if the textZone has cellZoneInfo, this is inside a table
}
