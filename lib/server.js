var restify = require('restify');
var uuid = require('node-uuid');
var log = require('./log');
var event = require('./event');
var registry = require('./registry');
var argv = require('minimist')(process.argv.slice(2));

var server = restify.createServer({
    name: 'xi-core',
    log: log
});

server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.requestLogger());

server.use(function(req, res, next) {
    req.log.debug({
        req: req
    }, "request");
    next();
});

server.pre(restify.pre.userAgentConnection());

server.on('after', function(req, res, route) {
    req.log.debug({
        res: res
    }, "response");
});

server.on('uncaughtException', function(req, res, route, error) {
    req.log.fatal(error);
    res.send(500);
    req.log.error("Couldn't serve %s %s", req.method, req.url);
});

function ping(req, res, next) {
    res.send({
        ping: 'pong'
    });
    next();
}

server.get('/ping', ping);

server.post('/register', function(req, res, next) {
    var newAgent = registry.register(req.params);
    res.send(newAgent);
    req.log.info({
        agent: newAgent
    }, "New agent registered");
    next();

});

server.get('/register', function(req, res, next) {
    req.log.info({
        req: req
    }, 'lookUp called');
    var agent = registry.lookUp(req.params);
    if (agent) {
        res.send(agent);
    } else {
        res.send(404);
    }
    next();
});


server.post('/subscribe', function(req, res, next) {
    event.subscribe(req.params.id, req.params.events);
    res.send(200);
    next();

});
server.post('/event', function(req, res, next) {
    res.send(event.create(req.params));
    next();
});
server.put('/event', function(req, res, next) {
    event.update(req.params);
    res.send(200);
    next();
});
server.del('/event', function(req, res, next) {
    res.send(404);
    next();
});

var port = argv.port || 9999;

function start(cb) {
    server.listen(port, function() {
        log.info('%s listening at %s', server.name, server.url);
        if (cb && typeof cb === 'function')
            cb();
    });
}

module.exports.start = start;
module.exports.app = server;
