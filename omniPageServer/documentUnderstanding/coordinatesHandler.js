module.exports = {
    getPositionObject: getPositionObject
}

function getPositionObject(l, t, r, b){
    return {
        left: parseInt(l),
        right: parseInt(r),
        top: parseInt(t),
        bottom: parseInt(b)
    }
}



