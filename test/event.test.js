var event = require('../lib/event');
var _ = require('underscore');
var mock = require('./mock');
var registry = require('../lib/registry');
var restify = require('restify');

describe('Event', function() {
    describe('#updateObject', function() {
        // object
        var obj1 = {
            some: 'test',
            another: {
                yet: 'another',
                value: false,
                nothing: 0
            }
        };
        // subset
        var obj2 = {
            another: {
                yet: 'another'
            }
        };
        // update
        var obj3 = {
            some: null,
            another: {
                nothing: null,
                yet: 'foobar'
            }
        };
        // after update
        var obj4 = {
            another: {
                yet: 'foobar',
                value: false
            }
        };
        // intersection
        var obj5 = {
            someMore: 'anything',
            thisIs: {
                a: 'value'
            },
            another: {
                nothing: 0,
                value: false
            }
        };

        it('should update an empty object', function() {
            var obj = {};
            event.updateObject(obj, obj1);
            _.isEqual(obj, obj1).should.equal(true);
        });
        it('should not change a superset object', function() {
            var obj = JSON.parse(JSON.stringify(obj1));
            event.updateObject(obj, obj2);
            _.isEqual(obj, obj1).should.equal(true);
        });
        it('should update a subset object', function() {
            var obj = JSON.parse(JSON.stringify(obj2));
            event.updateObject(obj, obj1);
            _.isEqual(obj, obj1).should.equal(true);
        });
        it('should delete a subset from object', function() {
            var a = _.clone(obj1);
            var b = _.clone(obj3);
            event.updateObject(a, b);
            _.isEqual(a, obj4).should.equal(true);
        });
        it('should update an intersection object', function() {
            var a = _.clone(obj5);
            var aResult = _.clone(obj5);
            var b = _.clone(obj3);
            event.updateObject(a, b);
            delete aResult.another.nothing;
            aResult.another.yet = 'foobar';
            _.isEqual(a, aResult).should.equal(true);
        });
    });

    describe('subscribe; create event; send updates', function() {
        var agentIds = [];
        var subscribedEvents1 = ['xi.event.input.text', 'xi.event.another.test.input'];
        var subscribedEvents2 = ['xi.event.another.different.input', 'xi.event.input.text'];
        var oldCreateJsonClient = restify.createJsonClient;

        before(function() {
            agentIds.push(registry.register({
                url: 'http://10.10.10.10:' + Math.round(10000 * Math.random())
            }).id);
            agentIds.push(registry.register({
                url: 'http://10.10.10.10:' + Math.round(10000 * Math.random())
            }).id);
        });

        after(function() {
            registry.eraseAll();
            restify.createJsonClient = oldCreateJsonClient;
        });

        describe('#subscribe', function() {
            it('should subscribe agents to events', function() {
                event.subscribe(
                    agentIds[0],
                    subscribedEvents1);
                var agent = registry.getAgent(agentIds[0]);
                agent.subscribe.events.should.eql(subscribedEvents1);

                event.subscribe(
                    agentIds[1],
                    subscribedEvents2
                );
                agent = registry.getAgent(agentIds[1]);
                agent.subscribe.events.should.eql(subscribedEvents2);

            });
        });

        describe('#create', function() {

            it('should create a new event', function() {

                var testEvent = {
                    xi: {
                        event: {
                            input: {
                                text: 'test'
                            }
                        }
                    }
                };

                restify.createJsonClient = mock.mockCreateJsonClient(function(method, url, event, done) {
                    method.should.equal('POST');
                    url.should.equal('/event');
                    event.should.eql(testEvent);
                });

                var retEvent = event.create(testEvent);
                event.getValue(retEvent, 'xi.event.id').should.be.ok;

            });
            it('should send a response to all subscribed agents', function(done) {
                done();
            });
        });

    });


});
