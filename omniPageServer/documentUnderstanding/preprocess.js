module.exports = {
    extractTextZones: extractTextZones,
    extractTableZones: extractTableZones,
    getTextZones: getTextZones,
    getLuisSentences: getLuisSentences,
    getLuisSentencesMap: getLuisSentencesMap,
    getContinuousTextLuisSentences: getContinuousTextLuisSentences
}

const txtZoneHandler = require('./textZoneHandler');
const luisPreproc = require('./luisPreprocess');

function extractTextZones(zones) {
    txtZoneHandler.extractTextZones(zones); //during the extraction, the luis sentences are build
}

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

function extractTableZones(zones){
    // getTableZones();
}
