
module.exports = {
    findTables: findTables,
}

const tablesDef = require('../../luisDefinitions/tablesDefinition');
const txtHandler = require('../../preprocess/textZoneHandler');
const tableHandler = require('../../preprocess/tableZoneHandler');
const coordHandler = require('../../coordinatesHandler');
const utils = require('../../commonUtils');

const tableCases = {
    tipicalTable: require('./tipicalTable'), //header and items inside a table zone
    headerOutsideTable: require('./headerOutsideTable'), //header in text zone and items inside a table zone

    else: 23
};


/********
@parameters = {
    bestResults: [{
        label: entity,
        score: score,
        type: type,
        //startIndex: startIndex,
        //endIndex: endIndex,
        mapObject: luisSentenceMapObject
    }]
}
mapObject = { //maps a word with the documentData structure
    zoneIdx: zoneIdx,
    lineIdx: lineIdx,
    wordIdx: wordIdx,
    text: text            
}
********/
function findTables(parameters) {

    // console.log(parameters.bestResults);

    let tables = groupTableHeaders(parameters.bestResults);

    for (const table in tables) {
        extractTableItems(tables[table].headers);
    }

}

function groupTableHeaders(bestResults) {

    // TODO - check if all the table headers are in the same Y coordinate

    /**
    tables = [{
        headers: [result.mapObject]
    }]
    */
    let tables = {};

    bestResults.forEach(result => {
        let tableName = tablesDef.getTableName(result.type); //get the table regarding this header
        if (tableName == null) {
            console.log("Header is not defined in any table");
            return;
        }
        //each table is composed of header objects that contains the objectMap and entityType
        if (tableName in tables) {
            tables[tableName].headers.push({ map: result.mapObject, entityType: result.type});
        }
        else {
            tables[tableName] = {
                headers: [{ map: result.mapObject, entityType: result.type}]
            }
        }
    });
    // console.log(tables);
    return tables;
}

function extractTableItems(headers) {
    let tableItems = [];
    headers.forEach(header => {
        /**
        item = {  //items object contains the text and position of the item (see function that assembles this object)
            tableIdx: tableIdx,
            zoneIdx: cellIdx,
            lineIdx: lineIdx,
            wordIdx: wordIdx,
            text: itemText
        }
         */
        tableItems.push({
            header: header,
            items: extractHeaderItems(header) //process each header items separately.
        });
    });
    // console.log(tableItems);
    return tableItems;
}

function extractHeaderItems(header) { //header here is a mapObject
    let documentData = txtHandler.getTextZones();
    let headerTxtZone = documentData[header.map.zoneIdx];

    if (tableCases.tipicalTable.checkTipicalTable(headerTxtZone, header.entityType)) {
        console.log("Processing tipical table");
        return tableCases.tipicalTable.extractItems(headerTxtZone);
    }
    else if (tableCases.headerOutsideTable.checkHeaderOutsideTable(headerTxtZone, header.entityType)) {
        console.log("Processing table with header outside it");
        return tableCases.headerOutsideTable.extractItems(headerTxtZone);
    }
    else {
        console.log("Last table case. Unknown");
        tableCases.else;
    }

}



