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
    let jsonResult;

    if (result.intent == "FirmaAngaben") {
        parseFirmaAngaben(result);
    }
    else if (result.intent == "PersonAngaben") {
        parsePersonAngaben(result)
    }
    else if (result.intent == "FirmaUndPersonAngaben") {
        parseFirmaUndPersonAngaben(result);
    }
    return jsonResult;
}

function parseFirmaUndPersonAngaben(result) {

    //the addresses inside composite entities are always in the right order, so I have to search if person or firma appears first and then split the composite entities
    let splittedResults = splitAddresses(result);
    parseFirmaAngaben(splittedResults.firmaResults);
    parsePersonAngaben(splittedResults.personResults);

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
    else if(firstEntity == "personName") {
        personResults.compositeEntities = firstCompositeEntities;
        firmaResults.compositeEntities = secondCompositeEntities;
    }
    return {firmaResults, personResults}; //return the results without modification in case firma or personName werent detected
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
}

function parsePersonAngaben(result) {
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
}