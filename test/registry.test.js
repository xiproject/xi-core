var should = require('should');
var registry = require('../lib/registry');
var mock = require('./mock');

describe('Registry', function() {
    var agentId;
    before(function() {
        registry.eraseAll();
    });
    describe('#register', function() {
        it('should register without error', function() {
            agentId = registry.register({
                url: 'http://10.10.10.10:8080',
                name: 'Foobar'
            }).id;
        });
        it('should return an id', function() {
            agentId.should.be.type('string');
        });
        describe('#getAgent', function() {
            it('should be able to retrieve agent later', function() {
                var agent = registry.getAgent(agentId);
                agent.should.be.an.Object;
                agent.id.should.equal(agentId);
            });
        });
        it('should delete old agent if new agent with same URL registers', function() {
            agentId = registry.register({
                url: 'http://10.10.10.10:8080',
                name: 'Foobar2'
            }).id;
            registry.getAgents().length.should.equal(1);
            registry.getAgent(agentId).name.should.equal('Foobar2');
        });
    });

    describe('#lookUp', function() {
        var testName = 'FoobarLookUp';
        before(function() {
            registry.eraseAll();
            agentId = registry.register({
                url: 'http://10.10.10.10:8080',
                name: testName
            }).id;

        });
        it('should be able to retrieve agent by id', function() {
            var agent = registry.lookUp({
                id: agentId
            }).agent;
            agent.name.should.equal(testName);
        });
        it('should be able to retrieve agent by name', function() {
            var agent = registry.lookUp({
                name: testName
            }).agent;
            agent.id.should.equal(agentId);
        });
    });

    var agentIds = [];
    describe('#getAgents', function() {
        before(function() {
            registry.eraseAll();
        });
        it('should register ten agents', function() {

            for (var i = 0; i < 10; ++i) {
                agentIds.push(registry.register({
                    url: 'http://10.10.10.10:' + i,
                    name: 'Foobar'
                }).id);
            }
        });
        it('should retrieve the ten agents from the registry', function() {
            var agents = registry.getAgents();
            agents.length.should.equal(10);
            for (var i = 0; i < agents.length; ++i) {
                agentIds.should.containEql(agents[i].id);
            }
        });
    });
});
