
function hasManyNumbers(myString) {
    let digitCount = (myString.match(/\d/g) || []).length;
    let alphaNumCount = (myString.match(/\w/g) || []).length;
    //console.log(alphaNumCount + " " + myString.length + " " + myString);
    return digitCount / alphaNumCount > 0.5; //if 50% or more of the string are numbers, dont add to luis sentence
}
function hasNumber(myString) {
    return /\d/.test(myString);
}

module.exports = {
    hasNumber: hasNumber,
    hasManyNumbers: hasManyNumbers
}