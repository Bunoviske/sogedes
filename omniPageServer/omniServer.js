module.exports = {
    convertDocument: convertDocument,
    debugXmlFile: debugXmlFile
}

const request = require('request');
const bus = require('./eventBus');
const sysHandler = require('./fileSystemHandler/fileSystemHandler');

const JobTypeId = {
    "docClassification": 36,
    "searchablePdf": 35,
    "preprocData": 30,
    "formData": 29,
    "pdfForm": 27,
    "xmlPage": 26,
    "xmlDoc": 25,
    "excelDoc": 14,
    "wordDoc": 13
}
const JobStatus = {
    "Unknown": -1,
    "Created": 0,
    "Started": 1,
    "Running": 2,
    "Completed": 3,
    "Failed": 4,
    "Cancelled": 5,
    "Abandoned": 6
}

function debugXmlFile(xmlFilePath, pdfFilePath){
    //DEBUG - Parse document directly
    sysHandler.getFileSystemHandler("jsonHandler").createEmptyJsonFile(pdfFilePath ,"-posprocessingResult.json","{\"Result\": \"Nothing\"}");
    sysHandler.getFileSystemHandler("logHandler").createEmptyLogFile(pdfFilePath ,"-log.txt");
    bus.notifyEvent("parseXml", { xmlFilePath: xmlFilePath});
}

function convertDocument(fileURI) {

    request.post('http://bruno-pc/Nuance.OmniPage.Server.Service/api/Job/CreateLocalJob', {
        json: {
            "JobTypeId": JobTypeId.xmlPage,
            "Priority": "2", //maximum priority
            "Title": "XML Conversion",
            "Description": "",
            "Metadata": "",
            "InputURIs": fileURI,
            "TimeToLiveSec": 20,
            "ConversionParameters": getConversionParameters() //just add the language
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        let thisJobId = body.JobId;
        console.log(thisJobId);
        pollJobStatus(fileURI, thisJobId);
    });

    //after converting the document, create a folder and an empty json file where the results are going to be stored
    sysHandler.getFileSystemHandler("jsonHandler").createEmptyJsonFile(fileURI ,"-posprocessingResult.json","{\"Result\": \"Nothing\"}");
    sysHandler.getFileSystemHandler("logHandler").createEmptyLogFile(fileURI ,"-log.txt"); //create log file
}

function pollJobStatus(fileURI, jobId) {
    console.log("Polling OmniPage Server every 2 seconds");
    let pollInterval = 2000;
    let intervalObject = setInterval(function () {
        request.get('http://bruno-pc/Nuance.OmniPage.Server.Service/api/Job/GetJobsStatus?jobIds=' + jobId,
            { json: true },
            (err, res, body) => {
                if (err) { return console.log(err); }
                console.log(`statusCode: ${res.statusCode}`);
                // console.log(body[0]);
                if (body[0].State == JobStatus.Completed) {
                    clearInterval(intervalObject); //finished the convertion
                    console.log("File Conversion Sucessful");
                    bus.notifyEvent("parseXml", { xmlFilePath: getXmlFilePath(fileURI, jobId) });

                }
                else if (body[0].State == JobStatus.Failed){
                    clearInterval(intervalObject); //failed the convertion
                    console.log("File Conversion Failed");
                }
            }
        );
    }, pollInterval);
}

function getConversionParameters(){
    return "<?xml version=\"1.0\" encoding=\"utf-16\"?> \
    <ConversionParameters xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns=\"http://www.nuance.com/2008/ConversionParameters\"> \
    <Language>LANG_GER</Language> \
    </ConversionParameters>";
}

function getXmlFilePath(fileURI, jobId){
    let filePath = sysHandler.getFileSystemHandler("xmlHandler").getXmlFilePath(fileURI, jobId);
    return filePath;
}
