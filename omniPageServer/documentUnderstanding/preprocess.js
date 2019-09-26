module.exports = {
    getTextZones: getTextZones
}

const txtZoneHandler = require('./textZoneHandler');

function getTextZones(zones) {
    txtZoneHandler.extractTextZones(zones);
}
