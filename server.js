'use strict';

var express = require('express');
var helpers = require('express-stormpath/lib/helpers');
var stormpath = require('express-stormpath');
var uuid = require('node-uuid');

var app = express();

app.use(stormpath.init(app, { website: true }));

// This middleware will look at the incoming user Account request -- and if this
// Account is a social account, it will be swapped for a non-social Account.
function unify(req, res, next) {
  var application = app.get('stormpathApplication');

  if (!req.user) {
    return next();
  }

  req.user.getProviderData(function(err, data) {
    if (err) {
      return next(err);
    }

    if (data.providerId === 'stormpath') {
      return next();
    }

    // If this user was literally logged in on this SAME request, we cannot do
    // anything, so just continue onwards and force a page reload.
    if (res.headerSent) {
      return res.redirect(req.originalUrl);
    }

    // We found a social user, so we'll attempt to look up their Cloud
    // directory account.
    application.getAccounts({ email: req.user.email }, function(err, accounts) {
      if (err) {
        return next(err);
      }

      var cloudAccount;
      accounts.each(function(account, cb) {
        account.getProviderData(function(err, data) {
          if (err) {
            return cb(err);
          }

          if (data.providerId === 'stormpath') {
            cloudAccount = account;
          }

          cb();
        });
      }, function(err) {
        if (err) {
          return next(err);
        }

        // Swap session.
        if (cloudAccount) {
          res.locals.user = cloudAccount;
          req.user = cloudAccount;
          helpers.createIdSiteSession(req.user, req, res);

          return next();
        }

        // If we get here, it means we need to create a new Cloud account for
        // this social user -- so, let's do it!
        application.createAccount({
          status: req.user.status,
          givenName: req.user.givenName,
          surname: req.user.surname,
          middleName: req.user.middleName,
          email: req.user.email,
          password: uuid.v4() + uuid.v4().toUpperCase()
        }, { registrationWorkflowEnabled: false }, function(err, account) {
          if (err) {
            return next(err);
          }

          res.locals.user = account;
          req.user = account;
          helpers.createIdSiteSession(account, req, res);

          next();
        });
      });
    });
  });
};

app.use(unify);

app.get('/', stormpath.loginRequired, function(req, res) {
  res.send('Hi, ' + req.user.givenName + '! You are now logged in!');
});

app.listen(3000);
