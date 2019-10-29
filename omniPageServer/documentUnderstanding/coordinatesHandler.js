module.exports = {
    getPositionObject: getPositionObject,
    isValueBelow: isValueBelow,
    isValueRight: isValueRight,
    wordDistance: wordDistance,
    horizontalZoneDistance: horizontalZoneDistance,
    verticalZoneDistance: verticalZoneDistance,
    isValidRightZone: isValidRightZone,
    isValidBelowZone: isValidBelowZone,
    isValidOverlappedZone: isValidOverlappedZone

}

function getPositionObject(l, t, r, b) { // the coordinate system is at (top, left)
    return {
        left: parseInt(l), //left of the object regarding the Y axis
        right: parseInt(r), //right of the object regarding the Y axis
        top: parseInt(t), //top of the object regarding the X axis
        bottom: parseInt(b) //bottom of the object regarding the X axis
    }
}

//if the label starts after the value ends, it is not consider as a below value (key value pairs shouldnt have a value before the label)
function isValueBelow(labelPos, valuePos) {
    if (labelPos.top < valuePos.top && labelPos.left < valuePos.right)
        return true;
    return false;
}

//this function returns values that are at the right of the label and a little bit above it. If they are a little bit below, the function isBelow will return this value
//TODO - make the tolerance relative to the size of the document if necessary
function isValueRight(labelPos, valuePos, upperMarginTolerance = 125) {
    if (labelPos.top - upperMarginTolerance <= valuePos.top && labelPos.right < valuePos.left)
        return true;
    return false;
}

//calculate euclidean distance from the center of each word
function wordDistance(labelPos, valuePos) {
    let labelYCenter = (labelPos.top + labelPos.bottom) / 2;
    let labelXCenter = (labelPos.left + labelPos.right) / 2;
    let valueYCenter = (valuePos.top + valuePos.bottom) / 2;
    let valueXCenter = (valuePos.left + valuePos.right) / 2;
    return euclideanDistance(labelXCenter, valueXCenter, labelYCenter, valueYCenter);
}

function euclideanDistance(x1, x2, y1, y2) {
    var a = x1 - x2;
    var b = y1 - y2;
    return Math.sqrt((a * a) + (b * b));
}

/***************************
//these methods are specific for finding nearby zones (at the right and below)
***************************/
function horizontalZoneDistance(labelZonePos, zoneCandidatePos) {
    return Math.abs(labelZonePos.right - zoneCandidatePos.left);
}

function verticalZoneDistance(labelZonePos, zoneCandidatePos) {
    return Math.abs(labelZonePos.bottom - zoneCandidatePos.top);
}

function isValidOverlappedZone(zone1Pos, zone2Pos) {
    let x_overlap = Math.max(0, Math.min(zone1Pos.right, zone2Pos.right) - Math.max(zone1Pos.left, zone2Pos.left));
    let y_overlap = Math.max(0, Math.min(zone1Pos.bottom, zone2Pos.bottom) - Math.max(zone1Pos.top, zone2Pos.top));
    
    let overlapArea = x_overlap * y_overlap;
    let zone1Area = (zone1Pos.bottom - zone1Pos.top) * (zone1Pos.right - zone1Pos.left);
    let zone2Area = (zone2Pos.bottom - zone2Pos.top) * (zone2Pos.right - zone2Pos.left);
    let smallestZone = zone1Area <= zone2Area ? zone1Area : zone2Area;

    return overlapArea/smallestZone >= 0.5; //if at least 50% of the smallest zone is inside the largest zone, return true
}

//check if the candidate zone as at the right of the label. also check if there is a intersection in the height direction
function isValidRightZone(labelZonePos, zoneCandidatePos) {
    if (zoneCandidatePos.left >= labelZonePos.right && heightDirectionIntersection(labelZonePos, zoneCandidatePos))
        return true;
    return false;
}

//check if the candidate zone as at the bottom of the label. also check if there is a intersection in the width direction
function isValidBelowZone(labelZonePos, zoneCandidatePos) {
    if (zoneCandidatePos.top >= labelZonePos.bottom && widthDirectionIntersection(labelZonePos, zoneCandidatePos))
        return true;
    return false;
}

function heightDirectionIntersection(labelZonePos, zoneCandidatePos) {
    return ((zoneCandidatePos.top < labelZonePos.bottom && zoneCandidatePos.top > labelZonePos.top) ||
        (zoneCandidatePos.bottom < labelZonePos.bottom && zoneCandidatePos.bottom > labelZonePos.top) ||
        (zoneCandidatePos.top <= labelZonePos.top && zoneCandidatePos.bottom >= labelZonePos.bottom))
}

function widthDirectionIntersection(labelZonePos, zoneCandidatePos) {
    return ((zoneCandidatePos.right < labelZonePos.right && zoneCandidatePos.right > labelZonePos.left) ||
        (zoneCandidatePos.left < labelZonePos.right && zoneCandidatePos.left > labelZonePos.left) ||
        (zoneCandidatePos.left <= labelZonePos.left && zoneCandidatePos.right >= labelZonePos.right))
}

