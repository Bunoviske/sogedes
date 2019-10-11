module.exports = {
    run: run
}
const preproc = require('./preprocess/preprocess');
const posproc = require('./posprocess/posprocess');
const luis = require('./luisApi');

function run(xmlResult) {
    // console.log(xmlResult.document.page[0].zones[0].textZone); //array of textZones
    // console.log(xmlResult.document.page[0].zones[0].tableZone); //array of tableZones

    preproc.extractDocumentData(xmlResult.document.page[0].zones[0].textZone, xmlResult.document.page[0].zones[0].tableZone);
    posproc.createListeners();
    luis.extractLabels(preproc.getLuisSentences(), preproc.getLuisSentencesMap());
    luis.extractContinuousText(preproc.getContinuousTextLuisSentences(), preproc.getContinuousTextMap());
    
}
