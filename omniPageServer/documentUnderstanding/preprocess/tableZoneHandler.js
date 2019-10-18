module.exports = {
    extractTableZones: extractTableZones,
    getTableZones: getTableZones
}

const coordHandler = require('../coordinatesHandler');
const zoneHandler = require('./zoneHandler');

let tableDocumentData = []; //main data structure that contains each table and its attributes
/********
tableDocumentData = {
    tablePos: tablePosition
    tableGrid: {
        gridCols: [
            colSize: size
        ],
        gridRows: [
            rowSize: size
        ]
    }
    cellZones: [{
        zonePos: zonePosition,
        gridColFrom: ,
        gridColTill: ,
        gridRowFrom: ,
        gridRowTill: ,
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
        }]           
    ]     
}        

********/

function extractTableZones(tableZones) {

    if (typeof tableZones == "undefined")
        return; //no tables detected in this document

    tableZones.forEach((table, tableIdx) => {

        addTableZoneData(table, tableDocumentData);
        // console.log(table);

        if (typeof table.cellZone != "undefined")

            table.cellZone.forEach(cellZone => {
                // console.log(cellZone);

                //the second argument is the zone array to push cell zone informations. Each table has an array of cell zones
                addCellZoneData(cellZone, tableDocumentData[tableIdx].cellZones); 

                if (typeof cellZone.ln != "undefined")
                    cellZone.ln.forEach((line, lineIdx) => {
                        // console.log(line);
                        zoneHandler.addLineData(line, tableDocumentData[tableIdx].cellZones);

                        if (typeof line.space != "undefined")
                            line.space.forEach((space) => {
                                // console.log(space);
                                zoneHandler.addSpaceData(space, tableDocumentData[tableIdx].cellZones);
                            });

                        if (typeof line.wd != "undefined")
                            line.wd.forEach((word, wordIdx) => {
                                // console.log(word);
                                zoneHandler.addWordData(word, tableDocumentData[tableIdx].cellZones);
                            });
                    });
            });
    });
    // console.log(tableDocumentData[0].cellZones[0].lines[0].words);
}

function addTableZoneData(table, tableDocumentData) {
    let tablePosition = coordHandler.getPositionObject(table.$.l, table.$.t, table.$.r, table.$.b);

    let colsSize = getColsGrid(table.gridTable[0].gridCol);
    let rowsSize = getRowsGrid(table.gridTable[0].gridRow);

    tableDocumentData.push({
        tablePos: tablePosition,
        tableGrid: {
            gridCols: colsSize,
            gridRows: rowsSize
        },
        cellZones: []
    });
}

function addCellZoneData(zone, documentData) {
    let zonePosition = coordHandler.getPositionObject(zone.$.l, zone.$.t, zone.$.r, zone.$.b);
    documentData.push({
        zonePos: zonePosition,
        lines: [],
        gridColFrom: parseInt(zone.$.gridColFrom), 
        gridColTill: parseInt(zone.$.gridColTill), 
        gridRowFrom: parseInt(zone.$.gridRowFrom), 
        gridRowTill: parseInt(zone.$.gridRowTill)
    });
}

function getColsGrid(gridCol) {
    let cols = [];
    gridCol.forEach(col => {
        cols.push({
            colSize: parseInt(col)
        })
    });
    return cols;
}

function getRowsGrid(gridRow) {
    let rows = [];
    gridRow.forEach(row => {
        rows.push({
            rowSize: parseInt(row)
        })
    });
    return rows;
}

function getTableZones() {
    return tableDocumentData;
}
