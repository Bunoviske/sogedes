
/***********
 *
 * Every type of document have typical key value pairs. They must be defined here and in LUIS app
 *
 ***********/

module.exports = {
    isDefinedEntity: isDefinedEntity
}

let entities = [
    "TotalBrutto",
    "TotalNetto",
    "SV-nummer",
    "Steuer-ID",
    "Geburtstag"
]

function isDefinedEntity(entityToCheck) {
    for (let index = 0; index < entities.length; index++) {
        if (entities[index] == entityToCheck){
            return true;
        }
    }            
    return false;
}