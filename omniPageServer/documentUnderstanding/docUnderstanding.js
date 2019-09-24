module.exports = {
    run: run
}
const preprocess = require('./preprocess');

function run(xmlResult) {
    // console.log(xmlResult.document.page[0].zones[0].textZone); //array of textZones
    // console.log(xmlResult.document.page[0].zones[0].tableZone); //array of tableZones

    preprocess.getTextZones(xmlResult.document.page[0].zones[0].textZone);
    // preprocess.getTextZonesWithContinuousText(); //get text zones with multiple lines and regular spacing between words -> good to retrieve blocks of text
    // preprocess.getTableZones();
    // luis.callLuis();
    // posprocess.getKeyValuePairs();
    
}