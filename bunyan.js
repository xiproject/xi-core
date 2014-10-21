var bunyan = require('bunyan');

var bunyanReq = bunyan.stdSerializers.req;
var bunyanRes = bunyan.stdSerializers.res;

function req(req) {
  return req;
  if (!req || !req.connection)
    return bunyanReq(req);
  var bReq = bunyanReq(req);
  bReq.body = req._body;
  return bReq;
}

function res(res) {
  return res;
  if (!res || !res.connection)
    return bunyanRes(res);
  var bRes = bunyanRes(res);
  bRes.body = res._body;
  return bRes;
}

bunyan.stdSerializers.req = req;
bunyan.stdSerializers.res = res;
module.exports = bunyan;
