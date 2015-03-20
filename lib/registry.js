var uuid = require('node-uuid');
var log = require('./log');
var registeredAgents = [];

var generateDefaultName = (function() {
    var index = 0;
    var func = function() {
        return 'DefaultAgent' + index++;
    };
    return func;
})();

function register(params) {
    var url = params.url;
    var name = params.name;
    var events = params.events;
    for (var i = 0; i < registeredAgents.length; ++i) {
        if (registeredAgents[i].url === url) {
            log.info({url: url}, "New registration with same url; deleting old agent");
            registeredAgents.splice(i, 1);
            break;
        }
    }
    newAgent = {
        id: uuid.v4(),
        name: name || generateDefaultName(),
        subscribe: {
            events: events || []
        },
        url: url
    };
    registeredAgents.push(newAgent);
    return {
        id: newAgent.id
    };
}

function lookUp(params) {
    if (params.id) {
        var agent = getAgent(params.id);
        if (agent) {
            return {
                agent: agent
            };
        } else {
            return null;
        }
        return;
    } else if (params.name) {
        for (var i = 0; i < registeredAgents.length; ++i) {
            if (registeredAgents[i].name === params.name) {
                return {
                    agent: registeredAgents[i]
                };
            }
        }
    }
    return null;
}

function getAgents() {
    return registeredAgents;
}

function getAgent(id) {
    for (var i = 0; i < registeredAgents.length; ++i) {
        if (registeredAgents[i].id === id)
            return registeredAgents[i];
    }
    return null;
}

function eraseAll() {
    registeredAgents = [];
}

module.exports.register = register;
module.exports.lookUp = lookUp;
module.exports.getAgents = getAgents;
module.exports.getAgent = getAgent;
module.exports.eraseAll = eraseAll;
