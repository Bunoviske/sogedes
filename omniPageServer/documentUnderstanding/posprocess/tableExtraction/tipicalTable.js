module.exports = {
    extractItems: extractItems,
    checkTipicalTable: checkTipicalTable
}

const tablesDef = require('../../luisDefinitions/tablesDefinition');
const txtHandler = require('../../preprocess/textZoneHandler');
const tableHandler = require('../../preprocess/tableZoneHandler');
const coordHandler = require('../../coordinatesHandler');
const utils = require('../../commonUtils');

function extractItems(headerTxtZone) {

    //it is already known that the header and the items are in a table

    let tableDocData = tableHandler.getTableZones();
    let table = tableDocData[headerTxtZone.cellZoneInfo.tableIdx];
    let headerCell = table.cellZones[headerTxtZone.cellZoneInfo.cellZoneIdx];
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
                    tableIdx: headerTxtZone.cellZoneInfo.tableIdx,
                    zoneIdx: cellIdx, //here a zone is considered as cellZone, because tableIdx is defined
                    lineIdx: lineIdx,
                    wordIdx: null, //it is null because it may be not just one word
                    text: itemText
                });
            });
        }
    });

    return items;
}

function checkTipicalTable(headerTxtZone, headerEntityName) {
    //best scenario, when header is alone in the table cell
    let isTipicalTable = false;

    //TODO - if the header is splitted in two lines, this will not work. Until luisSentenceMapObject doesnt return all the words and its position (if there is more than one),
    //this is not possible to do.
  
    if (isCellZone(headerTxtZone) && headerTxtZone.lines.length == 1 && headerTxtZone.lines[0].words.length <= tablesDef.getHeaderNumWords(headerEntityName)) {
        //check if the next zone below is a cell zone and aligned with the header cell (then, it is considered to be a tipical table)
        let tableDocData = tableHandler.getTableZones();
        let table = tableDocData[headerTxtZone.cellZoneInfo.tableIdx];
        let headerCell = table.cellZones[headerTxtZone.cellZoneInfo.cellZoneIdx];
        for (let it in table.cellZones){
            //check if there is a cell below with same colRange
            let cell = table.cellZones[it];
            if (headerCell.gridColFrom == cell.gridColFrom && headerCell.gridColTill == cell.gridColTill && headerCell.gridRowTill + 1 == cell.gridRowFrom) {
                isTipicalTable = true;
                return isTipicalTable;
            }
        }
    }
    return isTipicalTable;

}

function isCellZone(txtZone) {
    return (txtZone.hasOwnProperty("cellZoneInfo")); //if the textZone has cellZoneInfo, this is inside a table
}
