var should = require('should');
var registry = require('../lib/registry');

function mockRequest(params) {
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
}

function mockResponse(cb) {
    return {
        send: cb || function() {}
    };
}

describe('Registry', function() {
    var agentId;
    describe('#register', function() {
        it('should register without error', function(done) {
            registry.register(mockRequest({
                url: 'http://10.10.10.10:8080',
                name: 'Foobar'
            }), mockResponse(function(res) {
                agentId = res.id;
            }), done);
        });
        it ('should return an id', function() {
            agentId.should.be.type('string');
        });
        describe('#getAgent', function() {
            it ('should be able to retrieve agent later', function() {
                var agent = registry.getAgent(agentId);
                agent.should.be.an.Object;
                agent.id.should.equal(agentId);
            });
        });
    });
    var agentIds = [];
    describe('#getAgents', function() {
        before(function() {
            registry.eraseAll();
        });
        it ('should register ten agents', function(done) {
            var registered = 0;
            var onRegistered = function() {
                registered++;
                if (registered === 10)
                    done();
            };
            for (var i = 0; i < 10; ++i) {
                registry.register(mockRequest({
                    url: 'http://10.10.10.10:' + i,
                    name: 'Foobar'
                }), mockResponse(function(res) {
                    agentIds.push(res.id);
                }), onRegistered);
            }
        });
        it ('should retrieve the ten agents from the registry', function() {
            var agents = registry.getAgents();
            agents.length.should.equal(10);
            for (var i = 0; i < agents.length; ++i) {
                agentIds.should.containEql(agents[i].id);
            }
        });
    });
});
