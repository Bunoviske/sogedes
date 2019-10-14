

function getParentDirName(filePath) {
    var dirname1 = filePath.substring(0, filePath.lastIndexOf("/")) + "/";
    var dirname2 = filePath.substring(0, filePath.lastIndexOf("\\")) + "\\";
    return dirname1.length > dirname2.length ? dirname1 : dirname2; //test the substring with the two separators and get the dirname that is bigger
}

function getFileName(filePath){
    return filePath.replace(/^.*[\\\/]/, ''); //get file name
}


module.exports = {
    getParentDirName: getParentDirName,
    getFileName: getFileName
}


