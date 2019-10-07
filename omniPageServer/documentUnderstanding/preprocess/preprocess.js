module.exports = {
    extractDocumentData: extractDocumentData,
    getTextZones: getTextZones,
    getTableZones: getTableZones,
    getLuisSentences: getLuisSentences,
    getLuisSentencesMap: getLuisSentencesMap,
    getContinuousTextLuisSentences: getContinuousTextLuisSentences,
    getContinuousTextMap: getContinuousTextMap
}

const tableZoneHandler = require('./tableZoneHandler');
const txtZoneHandler = require('./textZoneHandler');
const luisPreproc = require('./luisPreprocess');

function extractDocumentData(textZones, tableZones){
    tableZoneHandler.extractTableZones(tableZones);
    txtZoneHandler.extractTextZones(textZones);
    
    //add the cell zones because they may have labels that fits in key value pair extraction (key value pair extraction is done with the textZones)
    txtZoneHandler.addCellZonesAsTexZones(convertCellZonesInTextZones()); 
}

/**
 *Text zones extraction
 */

function getTextZones(){
    return txtZoneHandler.getTextZones();
}

function getLuisSentences() {
    return luisPreproc.getLuisSentences();
}

function getLuisSentencesMap() {
    return luisPreproc.getLuisSentencesMap();
}

function getContinuousTextLuisSentences(){
    return luisPreproc.getContinuousTextLuisSentences();
}

function getContinuousTextMap(){
    return luisPreproc.getContinuousTextMap();
}


/**
 *Table zones extraction
 */

function getTableZones(){
    return tableZoneHandler.getTableZones();
}

/**
 * This class knows both text and table handler, so it is the best one to convert between its structure
 */

function convertCellZonesInTextZones(){
    let tableDocumentData = getTableZones();
    let textZones = [];
    
    //For now, every cell and text zones are the same, but in the future it may change, so it will be necessary to convert the cell zone to text zone    
    tableDocumentData.forEach( table => {
        table.cellZones.forEach( cellZone =>{
            textZones.push(cellZone);
        });
    });
    
    return textZones;
}