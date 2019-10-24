
module.exports = {
    getFileSystemHandler: getFileSystemHandler
}

//class that deals with file system manipulation. Various modules can use this class, so there is a main function to handle 
const xml = require('./xmlFileHandler');
const json = require('./jsonOutputFileHandler');
const log = require('./logFileHandler');


function getFileSystemHandler(handler) {

    if (handler == "xmlHandler")
        return xml.xmlFileHandler;
    else if (handler == "jsonHandler")
        return json.jsonOutputFileHandler;
    else if (handler == "logHandler")
        return log.logFileHandler;

}



