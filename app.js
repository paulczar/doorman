var http = require('http');
var express = require('express');
var connect = require('connect');
var conf = require('./conf');
var everyauth = require('everyauth');
var Proxy = require('./lib/proxy');
var github = require('./lib/modules/github');

var proxy = new Proxy(conf.proxyTo.host, conf.proxyTo.port);

github.setup(everyauth);

function userCanAccess(req) {
  var auth = req.session.auth;
  if(!auth) {
    console.log("User rejected because they haven't authenticated.");
    return false;
  }

  for(var authType in req.session.auth) {
    if(everyauth[authType].authorize(auth)) { return true; }
  }

  return false;
}

function checkUser(req, res, next) {
  if(userCanAccess(req)) {
    proxyMiddleware(req, res, next);
  } else {
    next();
  }
}

function loginPage(req, res, next) {
  res.render('login.jade', { pageTitle: 'Login', providers: everyauth.enabled });
}

// Store the middleware since we use it in the websocket proxy
var connectSession = connect.session({secret: conf.sessionSecret,
                                      fingerprint: function(req) { return "default"; }});

var proxyMiddleware = proxy.middleware();

var app = express.createServer(
  connect.logger(),
  connect.cookieParser(),
  connectSession,
  checkUser,
  everyauth.middleware(),
  connect.static(__dirname + "/public", {maxAge: 30 * 24 * 60 * 60 * 1000 * 0 }),
  loginPage
);

app.on('upgrade', function(req, socket, head) {
  connect.cookieParser()(req, new http.ServerResponse(req), function() {});
  connectSession(req, new http.ServerResponse(req), function() {
    if(userCanAccess(req)) {
      proxy.proxyWebSocketRequest(req, socket, head);
    } else {
      socket.end();
    }
  });
});

app.listen(conf.port);
