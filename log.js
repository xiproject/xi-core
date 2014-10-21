var bunyan = require('bunyan');

function request(req) {
    if (!req || !req.connection)
        return req;
    return {
        method: req.method,
        url: req.url,
        headers: req.headers,
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort,
        params: req.params
    };
}

function response(res) {
    if (!res || !res.statusCode)
        return res;
    return {
        statusCode: res.statusCode,
        header: res._header,
        body: res._body
    };
}

var logger = bunyan.createLogger({
    name: 'xi-core',
    streams: [
        {
            stream: process.stdout,
            level: 'debug'
        },
    ],
    serializers: {
        req: request,
        res: response
    }
});

module.exports = logger;
