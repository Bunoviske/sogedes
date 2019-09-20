
function hasManyNumbers(myString) {
    let digitCount = (myString.match(/\d/g) || []).length;
    let alphaNumCount = (myString.match(/\w/g) || []).length;
    //console.log(alphaNumCount + " " + myString.length + " " + myString);
    return digitCount / alphaNumCount > 0.5; //if 50% or more of the string are numbers, dont add to luis sentence
}
function hasNumber(myString) {
    return /\d/.test(myString);
}

function getResultDirPath(filePath){
    var dirname1 = filePath.substring(0, filePath.lastIndexOf("/")) + "/results"; //get parent folder with / as separator and add results subfolder
    var dirname2 = filePath.substring(0, filePath.lastIndexOf("\\")) + "\\results"; //get parent folder with \ as separator and add results subfolder
    var resultDirPath = dirname1.length > dirname2.length ? dirname1 : dirname2; 
    //test the substring with the two separators and get the dirname with the right separator (the one that is bigger)
    return resultDirPath;
}

function getFileName(filePath){
    return filePath.replace(/^.*[\\\/]/, ''); //get file name
}

module.exports = {
    hasNumber: hasNumber,
    hasManyNumbers: hasManyNumbers,
    getFileName: getFileName,
    getResultDirPath: getResultDirPath
}