var registry = require('./registry');
var log = require('./log');
var restify = require('restify');
var uuid = require('node-uuid');

var agents = registry.getAgents();
var events = {};

function updateObject(obj1, obj2) {
  for (var key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      log.debug({key: key}, "trying to update key");
      if (typeof obj1[key] === 'object') {
        obj1[key] = obj1[key] || {};
        updateObject(obj1[key], obj2[key]);
      } else if (obj2[key] === null) {
        delete obj1[key];
      } else {
        obj1[key] = obj2[key];
      }
    }
  }
}

function subscribe(req, res, next) {
  var events = req.params.events;
  var agent = registry.getAgent(req.params.id);
  if (!agent.subscribe.events)
    agent.subscribe.events = [];
  for (var i = 0; i < events.length; ++i) {
    var event = events[i];
    if (agent.subscribe.events.indexOf(event) >= 0) {
      req.log.warn({agentId: agent.id, event: event}, "Agent already subscribed to event");
    } else {
      agent.subscribe.events.push(event);
      req.log.info({agentId: agent.id, event: event}, "Agent subscribed to event");
    }
  }
  res.send(200);
  next();
}

function create(req, res, next) {
  var event = req.params['xi.event'];
  event.id = uuid.v4();
  res.send({'xi.event': event});
  events[event.id] = event;
  log.info({event: event}, "Event created");
  next();
  sendUpdates(null, event);
}

function update(req, res, next) {
  log.debug({requestParams: req.params}, "request params");
  var eventUpdate = req.params['xi.event'];
  var event = events[eventUpdate.id];
  var oldEvent = JSON.parse(JSON.stringify(event));
  log.debug({oldEvent: oldEvent}, "after copying");
  req.log.info({update: eventUpdate, event: event}, "Applying update to event");
  updateObject(event, eventUpdate);
  req.log.info({event: event}, "Updated event");
  res.send(200);
  next();
  events[event.id] = event;
  log.debug({oldEvent: oldEvent}, "before sending");
  sendUpdates(oldEvent, event);
}

function getValue(obj, name) {
  if (obj === null)
    return null;
  if (obj.hasOwnProperty(name))
    return obj[name];
  var keys = name.split('.');
  for (var i = 0; i < keys.length; ++i) {
    var key = keys.slice(0, i+1).join('.');
    if (obj.hasOwnProperty(key))
      return getValue(obj[key], keys.slice(i+1, keys.length).join('.'));
  }
  return null;
}

function sendUpdate(agent, event) {
  log.debug("started sendUpdate");
  var agentClient = restify.createJsonClient({
    url: agent.url,
    version: '*',
    log: log
  });
  log.debug("agent client created");
  agentClient.post('/event', {'xi.event': event}, function(err, req, res, body) {
    if (err) {
      log.warn({err: err, agent: agent}, "Couldn't send update to agent");
      return;
    }
    log.info({res:res}, "Event sent to agent " + agent.id);
  });
}

function sendUpdates(oldEvent, newEvent) {
  log.info("Sending updates");
  var changedEvents = [], unchangedEvents = [];
  log.debug({agents: agents}, "all agents");
  for (var i = 0; i < agents.length; ++i) {
    log.debug({agent: agents[i]}, "considering agent for updates");
    var sendUpdateToAgent = false;
    for (var j = 0; j < agents[i].subscribe.events.length; ++j) {
      log.debug({oldEvent: oldEvent, newEvent: newEvent}, "Trying to match changes wrt " + agents[i].subscribe.events[j]);
      if (changedEvents.indexOf(agents[i].subscribe.events[j]) >= 0) {
        log.debug("found subscription in changed events, breaking");
        sendUpdateToAgent = true;
        break;
      }
      if (unchangedEvents.indexOf(agents[i].subscribe.events[j]) >= 0) {
        log.debug("found subscription in unchanged events, continuing");
        continue;
      }
      var oldValue = getValue(oldEvent, agents[i].subscribe.events[j].replace('xi.event.', ''));
      var newValue = getValue(newEvent, agents[i].subscribe.events[j].replace('xi.event.', ''));
      log.debug({oldValue: oldValue , newValue: newValue}, "trying to get values");
      if (oldValue != newValue) {
        changedEvents.push(agents[i].subscribe.events[i]);
        sendUpdateToAgent = true;
        break;
      }
      else
        unchangedEvents.push(agents[i].subscribe.events[i]);
    }
    if (sendUpdateToAgent) {
      log.info({event: newEvent, agent: agents[i]}, "Sending updates about event to agent");
      sendUpdate(agents[i], newEvent);
    }
  }
}

function del(req, res, next) {
  res.send(404);
  next();
}

module.exports.subscribe = subscribe;
module.exports.create = create;
module.exports.update = update;
module.exports.del = del;
