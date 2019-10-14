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

function findInfoFromContinuousText(parameters) {
    let result = parameters.result;

    if (result.intent == "FirmaAngaben") {
        result.entities.forEach(element => {
            if (element.type == "firma") {
                console.log("Firma: " + element.entity);

                let address = ""; //just search the address with there is a name
                result.compositeEntities.forEach(element => {
                    if (element.parentType == "address") {
                        address += element.value + " ";
                    }
                });
                console.log("Address: " + address);
            }
        });
    }
    else if (result.intent == "PersonAngaben") {
        result.entities.forEach(element => {
            if (element.type == "personName") {
                console.log("Person name: " + element.entity);

                let address = ""; //just search the address with there is a name
                result.compositeEntities.forEach(element => {
                    if (element.parentType == "address") {
                        address += element.value + " ";
                    }
                });
                console.log("Address: " + address);
            }
        });
    }
}