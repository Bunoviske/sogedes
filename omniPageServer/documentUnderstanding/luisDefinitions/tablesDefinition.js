
/***********
 *
 * Every type of document have typical tables. They must be defined here and in LUIS app
 *
 ***********/

/**
 * Salary statement main table containing lohnart, bezeichnung and betrag
 */

module.exports = {
    isDefinedTableHeader: isDefinedTableHeader
}

let documentTables = {
    taxesTable: {
        headers: [
            "Lohnart",
            "Bezeichnung",
            "Betrag"
        ]
    }
}

function isDefinedTableHeader(headerToCheck) {

    for (let table in documentTables) {
        for (let index = 0; index < documentTables[table].headers.length; index++) {
            if (documentTables[table].headers[index] == headerToCheck) {
                return true;
            }
        }
    }
    return false;
}