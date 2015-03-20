var restify = require('restify');
var log = require('./log');

function sendUpdate(agent, event) {
    log.debug("started sendUpdate");
    var agentClient = restify.createJsonClient({
        url: agent.url,
        version: '*',
        log: log
    });
    log.debug("agent client created");
    agentClient.post('/event', event, function(err, req, res, body) {
        if (err) {
            log.warn({
                err: err,
                agent: agent
            }, "Couldn't send update to agent");
            return;
        }
        log.info({
            event: event,
            res: res
        }, "Event sent to agent " + agent.id);
    });
}

module.exports.sendUpdate = sendUpdate;
