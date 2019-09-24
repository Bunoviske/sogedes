
const utils = require('./commonUtils');
const fs = require('fs');
const path = require('path');

//imitation of a class (javascript object)
let xmlFileHandler = {

    //variables

    //methods 
    getXmlFilePath(fileURI, jobId) {
        let xmlPath = "";
        let dir = utils.getParentDirName(fileURI) + jobId;
        fs.readdirSync(dir).forEach(file => {
            //for now, there is just one file. This pageXML conversion creates a new document for every page of the pdf
            xmlPath = String(dir + path.sep + file);
        });
        return xmlPath;
    },

    readXmlFile(file){
        return fs.readFileSync(file, {encoding: 'utf8'});
    }
}

module.exports = {
    xmlFileHandler: xmlFileHandler
}



