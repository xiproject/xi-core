var mockCreateJsonClient = function(test) {
    return function(args) {
        var client = {};
        client.post = function(url, event, cb) {
            test('POST', url, event, function(err, req, res, body) {
                cb(err, req, res, body);
            });
        };
        return client;
    };
};

var mockRequest = function(params) {
   var request = {
        log: {
            error: function() {},
            warn: function() {},
            info: function() {},
            debug: function() {}
        }
    };
    request.params = params;
    return request;
};

var mockResponse = function(cb) {
    return {
        send: cb || function() {}
    };
};

var emptyFunc = function() {
    return function () {};
};

module.exports.mockCreateJsonClient = mockCreateJsonClient;
module.exports.mockRequest = mockRequest;
module.exports.mockResponse = mockResponse;
module.exports.emptyFunc = emptyFunc;
