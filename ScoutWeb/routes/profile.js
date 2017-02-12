var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
var parseHandler = require('parse-handler');

Parse.initialize('DiEded8eK6muPcH8cdHGj8iqYUny65Mva143CpQ3','unused');
Parse.serverURL = 'https://scoutparseserver.herokuapp.com/parse';

router.get('/', function(req, res, next) {
    res.render('profile', { title: 'Scout', banner: 'Profile', filename: 'profile' });
});

router.get('/index', function(req, res) {
    var businessSuccess = function (business) {

        data = {};

        //Load the pre-existing business values
        var profileImage = business.get("image");
        console.log(JSON.stringify(profileImage));
        if(profileImage != undefined) {
            data.image = profileImage.url();
        }

        data.businessname = business.get("name");
        data.points = business.get("points");
        data.rate = business.get("rate");

        res.json(data);
    };

    var businessFailure = function (error) {
        var msg = 'ERROR: Unable to query business for owner' + req.app.get('userQueried');

        console.log(msg);
        console.log(error.message);

        res.status(400).send(msg);
    };

    var businessArgs = {'user': req.app.get('userQueried')};

    parseHandler.retrieveBusiness(businessSuccess, businessFailure, businessArgs);
});

router.post('/', function (req, res) {
    var businessSuccess = function (business) {
        data = {};

        var password = req.body['password'];
        var businessName = req.body['businessname'];
        var points = req.body['points'];
        var rate = req.body['rate'];
        var curPassword = req.body['curpassword'];
        var image = req.files['image'];

        if (businessName != undefined &&
            businessName.trim().length > 0 &&
            businessName.trim() !== business.get("name")) {
            business.set("name", businessName);
        }

        business.set("points", points);
        business.set("rate", rate);


        var curLoggedUser = req.app.get('userQueried');
        //checks if current password is the same as the one provided
        //only change the password if current password and a new password is entered
        if (password != undefined && password.trim().length > 0) {
            //keep track of current logged in user so that we can
            //log him back if the current password entered in edit profile is invalid
            var curUser = req.app.get('sess').sessionToken;
            var curUserName = curLoggedUser["username"];
            Parse.User.logOut();
            Parse.User.logIn(curUserName, curPassword, {
                success: function (user) {
                    curLoggedUser.set("password", password);
                    curLoggedUser.save(null, {
                        success: function () {
                            saveImage(image, business, res);
                        },
                        error: function (myObject, error) {
                            res.status(502).send('Failed to update personal information.');
                        }
                    });
                },
                error: function (user, error) {
                    Parse.User.become(curUser);
                    res.status(403).send('Current password entered is not correct.');
                }
            });
        } else {
            saveImage(image, business, res);
        }
    };

    var businessFailure = function (error) {
        var msg = 'ERROR: Unable to query business for owner' + req.app.get('userQueried');

        console.log(msg);
        console.log(error.message);

        res.status(400).send(msg);
    };

    var businessArgs = {'user': req.app.get('userQueried')};

    parseHandler.retrieveBusiness(businessSuccess, businessFailure, businessArgs);
});

//Save the business object
function saveBusiness(business, res) {
    business.save(null, {
        success: function(myObject) {
            res.status(200).send();
        },
        error: function(myObject, error) {
            res.status(502).send('Failed to update business.');
        }
    });
}

//Save images into cloud then add it to the business if successful
function saveImage(image, business, res) {
    if (image != undefined && image != null) {
        var base64Img = new Buffer(image.buffer).toString('base64');
        var parseFile = new Parse.File(image.name, { base64: base64Img });
        console.log('Image saving...');
        parseFile.save(null, {useMasterKey:true}).then(function () {
            // The file has been saved to Parse. Now attach it to our business model
            console.log('Image successfully saved.');
            console.log('Business saving...');
            business.set("image", parseFile);
            saveBusiness(business, res);
            Console.log('Business successfully saved.');
        }, function (error) {
            console.log(error);
            res.status(502).send('Failed to update business profile picture.');
        });
    } else {
        saveBusiness(business, res);
    }
}

module.exports = router;
