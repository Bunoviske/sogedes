module.exports = {
    run: run
}
const preproc = require('./preprocess');
const luis = require('./luisApi');

function run(xmlResult) {
    // console.log(xmlResult.document.page[0].zones[0].textZone); //array of textZones
    // console.log(xmlResult.document.page[0].zones[0].tableZone); //array of tableZones

    preproc.extractTextZones(xmlResult.document.page[0].zones[0].textZone);
    preproc.extractTableZones(xmlResult.document.page[0].zones[0].tableZone);
    luis.extractLabels(preproc.getLuisSentences(), preproc.getLuisSentencesMap());
    // luis.extractContinuousText();

    // posprocess.getKeyValuePairs();
    
}
