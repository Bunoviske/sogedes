

//create event bus
const EventEmitter = require('events');
class MyEmitter extends EventEmitter { }
const eventBus = new MyEmitter();

//CONTRACT : every eventListener must receive an object called parameters with the real parameters defined inside it

function notifyEvent(eventName, parameters) {
    eventBus.emit(eventName, parameters);
}

function addEventListener(eventName, eventListener){
    eventBus.on(eventName, eventListener);
}

module.exports = {
    notifyEvent: notifyEvent,
    addEventListener: addEventListener
}