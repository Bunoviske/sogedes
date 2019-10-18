module.exports = {
    extractItems: extractItems,
    checkTipicalTable: checkTipicalTable
}


function extractItems(txtZone) {

    //it is already known that the header and the items are in a table

    let tableDocData = tableHandler.getTableZones();
    let table = tableDocData[txtZone.cellZoneInfo.tableIdx];
    let headerCell = table.cellZones[txtZone.cellZoneInfo.cellZoneIdx];
    let items = [];

    table.cellZones.forEach((cell, cellIdx) => {
        //check if there is a cell below with same colRange
        if (headerCell.gridColFrom == cell.gridColFrom && headerCell.gridColTill == cell.gridColTill && cell.gridRowFrom > headerCell.gridRowTill) {
            table.cellZones.lines.forEach((line, lineIdx) => {
                let itemText = "";
                line.words.forEach((word, wordIdx) => {
                    itemText += word.text;
                });
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

function checkTipicalTable(thisTxtZone) {
    //best scenario, when header is alone in the table cell
    let isTipicalTable = false;

    if (isCellZone(thisTxtZone) && thisTxtZone.lines.length == 1 && thisTxtZone.lines.words.length == 1) {
        //check if the next zone below is a cell zone and aligned with the header cell (then, it is considered to be a tipical table)
        let tableDocData = tableHandler.getTableZones();
        let table = tableDocData[thisTxtZone.cellZoneInfo.tableIdx];
        let headerCell = table.cellZones[thisTxtZone.cellZoneInfo.cellZoneIdx];
        table.cellZones.forEach(cell => {
            //check if there is a cell below with same colRange
            if (headerCell.gridColFrom == cell.gridColFrom && headerCell.gridColTill == cell.gridColTill && headerCell.gridRowTill + 1 == cell.gridRowFrom) {
                isTipicalTable = true;
                return;
            }
        });
    }
    return isTipicalTable;

}

function isCellZone(thisTxtZone) {
    return (typeof thisTxtZone.cellZoneInfo != "undefined"); //if the textZone has cellZoneInfo, this is inside a table
}
