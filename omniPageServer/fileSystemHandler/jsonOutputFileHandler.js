
const utils = require('./commonUtils');
const fs = require('fs');
const path = require('path');
var rimraf = require("rimraf");
const utf8 = require('utf8');
//imitation of a class (javascript object)
let jsonOutputFileHandler = {

    //variables
    jsonFile: "",

    //methods 
    createEmptyJsonFile(fileURI, fileNameExtension, jsonInitialData) {
        let resultDirPath = utils.getParentDirName(fileURI) + "results/";
        let filename = utils.getFileName(fileURI);
        console.log(resultDirPath);


        if (fs.existsSync(resultDirPath)) { //delete if exists
            rimraf.sync(resultDirPath);
        }
        fs.mkdirSync(resultDirPath); //create subfolder /results 
        this.createFile(resultDirPath, filename, fileNameExtension, jsonInitialData);
    },

    createFile(resultDirPath, filename, fileNameExtension, jsonInitialData) {
        jsonFile = resultDirPath + '/' + filename + fileNameExtension;
        fs.writeFile(jsonFile, jsonInitialData, (err) => { //create a result json file for this pdf document
            if (err) throw err;
        });
    },

    writeJsonFile(data) {
        fs.writeFile(jsonFile, JSON.stringify(data), (err) => {
            if (err) throw err;
        });
    }
}

module.exports = {
    jsonOutputFileHandler: jsonOutputFileHandler
}



