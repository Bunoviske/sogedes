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
    else if (result.intent == "PersonAngaben") {
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
    return jsonResult;
}