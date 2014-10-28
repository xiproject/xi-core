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
    req.log.debug({req: req}, "request");
    next();
});

server.pre(restify.pre.userAgentConnection());

server.on('after', function(req, res, route) {
    req.log.debug({res: res}, "response");
});

server.on('uncaughtException', function(req, res, route, error) {
    req.log.fatal(error);
    res.send(500);
    req.log.error("Couldn't serve %s %s", request.method, request.url);
});

function ping(req, res, next) {
    res.send({ping: 'pong'});
    next();
}

server.get('/ping', ping);
server.post('/register', registry.register);
server.get('/register', registry.lookUp);
server.post('/subscribe', event.subscribe);
server.post('/event', event.create);
server.put('/event', event.update);
server.del('/event', event.del);

var port = argv.port || 9999;
function start(cb) {
    server.listen(port, function() {
        log.info('%s listening at %s', server.name, server.url);
        if (cb && typeof cb === 'function')
            cb();
    });
}

module.exports.start = start;
