const utils = require('./commonUtils');
const fs = require('fs');

//imitation of a class (javascript object)
let logFileHandler = {

    //variables
    logFile: "",

    //methods 
    createEmptyLogFile(fileURI, fileNameExtension) {

        let resultDirPath = utils.getParentDirName(fileURI) + "results/";
        let filename = utils.getFileName(fileURI);

        if (!fs.existsSync(resultDirPath)) { //if results folder dont exists, create one
            // rimraf.sync(resultDirPath);
            fs.mkdirSync(resultDirPath); //create subfolder /results 
        }
        this.createFile(resultDirPath, filename, fileNameExtension);
    },

    createFile(resultDirPath, filename, fileNameExtension) {
        this.logFile = resultDirPath + '/' + filename + fileNameExtension;
        this.writeLogFile("Log for the document " + filename + "\n\n");
    },

    writeLogFile(data) {
        fs.writeFile(this.logFile, data, (err) => {
            if (err) throw err;
        });        
    },

    appendLogFile(data) {
        fs.appendFile(this.logFile, data, (err) => {
            if (err) throw err;
        });        
    }
}

module.exports = {
    logFileHandler: logFileHandler
}


