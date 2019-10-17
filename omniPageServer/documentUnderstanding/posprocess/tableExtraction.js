
module.exports = {
    findTables: findTables,
}

let tablesDef = require('../luisDefinitions/tablesDefinition');


/********
@parameters = {
    bestResults: [{
        label: entity,
        score: score,
        type: type,
        //startIndex: startIndex,
        //endIndex: endIndex,
        mapObject: luisSentenceMapObject
    }]
}
mapObject = { //maps a word with the documentData structure
    zoneIdx: zoneIdx,
    lineIdx: lineIdx,
    wordIdx: wordIdx,
    text: text            
}
********/
function findTables(parameters){
    
    console.log(parameters.bestResults);

    // let jsonResult = [];

    // parameters.bestResults.forEach(result => {
    //     let label = result.type;
    //     let mapObject = result.mapObject;

    //     let value = searchValueInSameTextZone(label, mapObject);
    //     if (value == null) //if no value is found in the same zone, search nearby
    //         value = searchValueInNearbyTextZones(label, mapObject);
    //     if (value != null){
    //         console.log("Label: " + label + "      Value: " + value.text);
    //         jsonResult.push({
    //            [label]: value.text
    //         });
    //     }
    // });

    // return jsonResult;
}