module.exports = {
    findInfoFromContinuousText: findInfoFromContinuousText
}


/********
@parameters = {
    result =
        {
            intent:
            score:
            entities: 
            compositeEntities:
        }
}
********/

//TODO - there is no criteria to select multiple results for the same information


function findInfoFromContinuousText(parameters) {
    let result = parameters.result;

    if (result.intent == "FirmaAngaben") {
        return [parseFirmaAngaben(result)]; //return in array format
    }
    else if (result.intent == "PersonAngaben") {
        return [parsePersonAngaben(result)]; //return in array format
    }
    else if (result.intent == "FirmaUndPersonAngaben") {
        return parseFirmaUndPersonAngaben(result); //already is returned as an array
    }
    
    return [null];
}

function parseFirmaUndPersonAngaben(result, jsonResult) {

    //the addresses inside composite entities are always in the right order, so I have to search if person or firma appears first and then split the composite entities
    let splittedResults = splitAddresses(result);
    //return both jsonResults in an array format
    return [parseFirmaAngaben(splittedResults.firmaResults, jsonResult), parsePersonAngaben(splittedResults.personResults, jsonResult)];

}

function splitAddresses(result) {
    let startIndexes = findFirmaUndPersonStartIndex(result);
    let firstEntity = getFirstAppearanceEntity(startIndexes);
    return splitCompositeEntitiesAddresses(result, firstEntity);
}

function splitCompositeEntitiesAddresses(result, firstEntity) {
    let firmaResults = Object.assign({}, result), personResults = Object.assign({}, result);
    let firstCompositeEntities = [], secondCompositeEntities = [], changeToSecondComposite = false;

    result.compositeEntities.forEach(element => {
        if (element.parentType == "address") {
            if (!changeToSecondComposite) {
                firstCompositeEntities.push(element);
                // console.log(element.children);
                if (element.children[0].type == "city") changeToSecondComposite = true; //split the addresses when find the first city
            }
            else {
                // console.log(element.children);
                secondCompositeEntities.push(element);
            }
        }
    });

    if (firstEntity == "firma") {
        firmaResults.compositeEntities = firstCompositeEntities;
        personResults.compositeEntities = secondCompositeEntities;
    }
    else if (firstEntity == "personName") {
        personResults.compositeEntities = firstCompositeEntities;
        firmaResults.compositeEntities = secondCompositeEntities;
    }
    return { firmaResults, personResults }; //return the results without modification in case firma or personName werent detected
}

function getFirstAppearanceEntity(startIndexes) {
    if (startIndexes.firmaIndex != -1 && startIndexes.personNameIndex != -1) {
        return startIndexes.firmaIndex < startIndexes.personNameIndex ? "firma" : "personName";
    }
    else if (startIndexes.firmaIndex == -1 && startIndexes.personNameIndex != -1) {
        return "personName";
    }
    else if (startIndexes.firmaIndex != -1 && startIndexes.personNameIndex == -1) {
        return "firma";
    }
    else return null;
}

function findFirmaUndPersonStartIndex(result) {
    let firmaIndex = -1, personNameIndex = -1;
    result.entities.forEach(element => {
        if (element.type == "firma") {
            firmaIndex = element.startIndex;
        }
        else if (element.type == "personName") {
            personNameIndex = element.startIndex;
        }
    });
    return { firmaIndex, personNameIndex };
}

function parseFirmaAngaben(result) {
    let jsonResult;

    result.entities.forEach(element => {
        if (element.type == "firma") {
            console.log("Firma: " + element.entity);

            let address = ""; //just search the address if there is a firma
            result.compositeEntities.forEach(element => {
                if (element.parentType == "address") {
                    address += element.value + " ";
                }
            });
            console.log("Address: " + address);
            if (address != "") //just add complete information! If address is not defined, dont add
                jsonResult = {
                    "FirmaName": element.entity,
                    "FirmaAddress": address
                };
        }
    });

    return jsonResult;
}

function parsePersonAngaben(result) {
    let jsonResult;

    result.entities.forEach(element => {
        if (element.type == "personName") {
            console.log("Person name: " + element.entity);

            let address = ""; //just search the address if there is a name
            result.compositeEntities.forEach(element => {
                if (element.parentType == "address") {
                    address += element.value + " ";
                }
            });
            console.log("Address: " + address);
            if (address != "") //just add complete information! If address is not defined, dont add
                jsonResult = {
                    "PersonName": element.entity,
                    "PersonAddress": address
                };
        }
    });

    return jsonResult;
}