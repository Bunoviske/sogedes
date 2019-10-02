module.exports = {
    extractTableZones: extractTableZones,
    getTableZones: getTableZones
}

const coordHandler = require('../coordinatesHandler');

let tableDocumentData = []; //main data structure that contains each text zone, line, words and attributes
/********
tableDocumentData = {
                
}
********/

function extractTableZones(zones){

}

function getTableZones() {
    return tableDocumentData;
}
