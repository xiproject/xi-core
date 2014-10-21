var uuid = require('node-uuid');

var registeredAgents = [];

function register(req, res, next) {
    newAgent = {
        id: uuid.v4(),
        subscribe: {
            events: req.params.events || []
        },
        url: req.params.url
    };
    registeredAgents.push(newAgent);
    res.send({
        id: newAgent.id
    });
    req.log.info({agent: newAgent}, "New agent registered");
    next();
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
module.exports.getAgents = getAgents;
module.exports.getAgent = getAgent;
module.exports.eraseAll = eraseAll;
