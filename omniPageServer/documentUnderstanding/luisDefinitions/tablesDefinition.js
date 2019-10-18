
/***********
 *
 * Every type of document have typical tables. They must be defined here and in LUIS app
 *
 ***********/

/**
 * Salary statement main table containing lohnart, bezeichnung and betrag
 */

module.exports = {
    isDefinedTableHeader: isDefinedTableHeader,
    getTableName: getTableName,
    getHeaderNumWords: getHeaderNumWords
}

let documentTables = {
    taxesTable: {
        headers: [
            {
                name: "Lohnart",
                headerNumWords: 1, //while there isnt a luisSentenceMapObject that can return multiple words, each header has this property to define how many words the header can have
                itemType: "number"
            },
            {
                name: "Bezeichnung",
                headerNumWords: 1,
                itemType: "text"
            },
            {
                name: "Betrag",
                headerNumWords: 1,
                itemType: "number"
            }
        ]
    },
    invoiceTable: {
        headers: [
            {
                name: "QTY",
                headerNumWords: 1,
                itemType: "number"
            },
            {
                name: "DESCRIPTION",
                headerNumWords: 1,
                itemType: "text"
            },
            {
                name: "UNIT_PRICE",
                headerNumWords: 2,
                itemType: "number"
            },
            {
                name: "AMOUNT",
                headerNumWords: 1,
                itemType: "number"
            }
        ]
    }
}

function isDefinedTableHeader(headerToCheck) {

    for (let table in documentTables) {
        for (let index = 0; index < documentTables[table].headers.length; index++) {
            if (documentTables[table].headers[index].name == headerToCheck) {
                return true;
            }
        }
    }
    return false;
}

function getTableName(header) {

    //same header maybe in multiple tables - TODO. have to return an array of table names

    for (let table in documentTables) {
        for (let index = 0; index < documentTables[table].headers.length; index++) {
            if (documentTables[table].headers[index].name == header) {
                return table;
            }
        }
    }
    return null;
}

function getHeaderNumWords(header){
    for (let table in documentTables) {
        for (let index = 0; index < documentTables[table].headers.length; index++) {
            if (documentTables[table].headers[index].name == header) {
                return documentTables[table].headers[index].headerNumWords;
            }
        }
    }
    return null;
}