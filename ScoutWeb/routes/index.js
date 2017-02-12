var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;

Parse.initialize('DiEded8eK6muPcH8cdHGj8iqYUny65Mva143CpQ3','unused');
Parse.serverURL = 'https://scoutparseserver.herokuapp.com/parse';

router.get('/', function(req, res, next) {
console.log(req.session);
  if (req.session != null && req.session.user != null) {
    res.redirect('/dashboard');
  }
  else {
    res.render('index', { title: 'Scout', filename: 'index' });
  }
});

router.post('/', function (req, res) {
  var email = req.body['email'];
  var password = req.body['password'];
  Parse.User.logIn(email, password, {
    success: function(user) {
      console.log(user);
      req.session.user = user;
      req.session.save();
      res.status(200).send();
    },
    error: function(error) {
      console.log('ERROR: Unable to log in user '+email);
      console.log(error.message);
      req.session = null;
      res.status(400).send('Unable to login user.');
    }
  });
});

module.exports = router;
