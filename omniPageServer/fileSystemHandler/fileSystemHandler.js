
module.exports = {
    getFileSystemHandler: getFileSystemHandler
}

//class that deals with file system manipulation. Various modules can use this class, so there is a main function to handle 
const xml = require('./xmlFileHandler');

function getFileSystemHandler(handler) {

    if (handler == "xmlHandler")
        return xml.xmlFileHandler;
    
}



