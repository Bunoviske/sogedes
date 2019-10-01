module.exports = {
    getPositionObject: getPositionObject,
    isBelow: isBelow,
    distance: distance
}

function getPositionObject(l, t, r, b){
    return {
        left: parseInt(l),
        right: parseInt(r),
        top: parseInt(t),
        bottom: parseInt(b)
    }
}

//if the label starts after the value ends, it is not consider as a below value (key value pairs shouldnt have a value before the label)
function isBelow(labelPos, valuePos) {
    if (labelPos.top < valuePos.top && labelPos.left < valuePos.right)
        return true;
    return false;
}

//calculate euclidean distance from the center of each word
function distance(labelPos, valuePos){
    let labelYCenter = (labelPos.top + labelPos.bottom)/2;
    let labelXCenter = (labelPos.left + labelPos.right)/2;
    let valueYCenter = (valuePos.top + valuePos.bottom)/2;
    let valueXCenter = (valuePos.left + valuePos.right)/2;
    return euclideanDistance(labelXCenter,valueXCenter,labelYCenter,valueYCenter);
}

function euclideanDistance(x1, x2, y1, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt((a * a) + (b * b));
}


