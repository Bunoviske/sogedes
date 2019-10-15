module.exports = {
    run: run
}
const preproc = require('./preprocess/preprocess');
const posproc = require('./posprocess/posprocess');
const luis = require('./luisApi');
const bus = require('../eventBus');
const sysHandler = require('../fileSystemHandler/fileSystemHandler');

function run(xmlResult) {
    // console.log(xmlResult.document.page[0].zones[0].textZone); //array of textZones
    // console.log(xmlResult.document.page[0].zones[0].tableZone); //array of tableZones

    preproc.extractDocumentData(xmlResult.document.page[0].zones[0].textZone, xmlResult.document.page[0].zones[0].tableZone);
    posproc.createListeners();
    createrResultsSaverListener();
    luis.extractLabels(preproc.getLuisSentences(), preproc.getLuisSentencesMap());
    luis.extractContinuousText(preproc.getContinuousTextLuisSentences(), preproc.getContinuousTextMap());

}

//results are saved async, so every time this listener is called, it push the new data in the output json file
function createrResultsSaverListener() {

    /********
    @parameters = {
        step: posProcessingStepName
    }
    ********/
    //every time a posprocessing step is finished, add data to the file
    bus.addEventListener("finishedPosProcessingStep", function (parameters) {
        sysHandler.getFileSystemHandler("jsonHandler").writeJsonFile( posproc.getPosProcessingResult() );
    });
}

