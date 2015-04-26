var server = require('./lib/server');
var log = require('./lib/log');
var app = require('http').createServer();
var io = require('socket.io')(app);

app.listen(9000);

var connections = {};

io.on('connection', function(socket) {
    log.info('Got connection new connection');
    socket.on('registration', function(data) {
        log.info({agentName: data.name}, 'New agent registered');
        connections[data.name] = socket;
    });
    socket.on('disconnect', function() {
        for (var key in connections) {
            if (connections.hasOwnProperty(key)) {
                if (connections[key] === this) {
                    log.warn({agentName: key}, 'Agent disconnected');
                }
            }
        }
        io.emit('agent disconnected');
    });
});

server.start();
