module.exports = {
    hasManyNumbers: hasManyNumbers,
    hasNumber: hasNumber
}

function hasManyNumbers(myString) {
    let digitCount = (myString.match(/\d/g) || []).length;
    let alphaNumCount = (myString.match(/\w/g) || []).length;
    //console.log(alphaNumCount + " " + myString.length + " " + myString);
    return digitCount / alphaNumCount > 0.5; //return true if 50% or more of the string are numbers
}
function hasNumber(myString) {
    return /\d/.test(myString);
}


