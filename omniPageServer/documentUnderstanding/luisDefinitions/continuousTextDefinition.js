
/***********
 *
 * Every type of document have typical continuous text to be extracted (defined intents). They must be defined here and in LUIS app
 *
 ***********/

module.exports = {
    isDefinedIntent: isDefinedIntent
}

let intents = [
    "FirmaAngaben",
    "PersonAngaben"
]

function isDefinedIntent(intentToCheck) {
    
    for (let index = 0; index < intents.length; index++) {
        if (intents[index] == intentToCheck){
            return true;
        }
    }            
    return false;
}