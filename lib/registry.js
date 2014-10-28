var uuid = require('node-uuid');

var registeredAgents = [];

var generateDefaultName = (function () {
    var index = 0;
    var func = function() {
        return 'DefaultAgent' + index++;
    };
    return func;
})();

function register(req, res, next) {
    for (var i = 0; i < registeredAgents.length; ++i) {
        if (registeredAgents[i].url === req.params.url) {
            req.log.info({url: req.params.url}, "New registration with same url; deleting old agent");
            registeredAgents.splice(i, 1);
            break;
        }
    }
    newAgent = {
        id: uuid.v4(),
        name: req.params.name || generateDefaultName(),
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

function lookUp(req, res, next) {
    req.log.info({req: req}, 'lookUp called');
    if (req.params.id) {
        var agent = getAgent(req.params.id);
        if (agent) {
            res.send({agent: agent});
        } else {
            res.send(404);
        }
        next();
        return;
    } else if (req.params.name) {
        for (var i = 0; i < registeredAgents.length; ++i) {
            if (registeredAgents[i].name === req.params.name) {
                res.send({agent: registeredAgents[i]});
                next();
                return;
            }
        }
    }
    res.send(404);
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
module.exports.lookUp = lookUp;
module.exports.getAgents = getAgents;
module.exports.getAgent = getAgent;
module.exports.eraseAll = eraseAll;
