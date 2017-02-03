var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;

Parse.initialize('DiEded8eK6muPcH8cdHGj8iqYUny65Mva143CpQ3','unused');
Parse.serverURL = 'https://scoutparseserver.herokuapp.com/parse';

router.get('/', function(req, res, next) {
  console.log(req.session);
  if (req.session != null) {
  	var user = req.session.user
	req.session.destroy(function() {
		console.log('User Logged Out: ' + user);
	});
	console.log(req.session);
  }
  res.redirect('/');
});

module.exports = router;
