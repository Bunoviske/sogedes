module.exports = {
    run: run
}

const bus = require('../eventBus');

function run() {
    bus.addEventListener("posprocessLuisResponse", findKeyValuePairs)
}

/********
@parameters = {
    bestResults: {
        label: entity,
        score: score,
        type: type,
        startIndex: startIndex,
        endIndex: endIndex,
        luisSentenceMapObject: luisSentenceMapObject
    }
}
********/
function findKeyValuePairs(parameters) {
    console.log(parameters.bestResults);
}

