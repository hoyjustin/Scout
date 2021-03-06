var express = require('express');
var router = express.Router();
var Parse = require('parse/node').Parse;
var moment = require('moment');

Parse.initialize('DiEded8eK6muPcH8cdHGj8iqYUny65Mva143CpQ3','unused');
Parse.serverURL = 'https://scoutparseserver.herokuapp.com/parse';

// Mock data
var data = {
    new: {
        daily: 'N/A',
        monthly: 'N/A'
    },
    visitlength: 'N/A',
    points: {
        earned: 'N/A',
        avg: 'N/A'
    }
};

router.get('/', function(req, res, next) {
    res.render('dashboard', { title: 'Scout', banner: 'Overview', filename: 'dashboard', data: data});
});

// Fetch a parse object collection for a current user's business
// given an identifier.
// Applies a given function to it and returns its JSON representation.
var queryObjForUserJSON = function(currUser, objName, func) {
    var businessObj = Parse.Object.extend('Business');
    var businessQuery = new Parse.Query(businessObj);
    var query = new Parse.Query(Parse.Object.extend(objName));
    businessQuery.equalTo('owner', currUser);

    var getObjforBusiness = function(business) {
        // queries for this page.
        query.equalTo('business', business);
        query.find().then(
        function (collection) {
            // apply given function to array of ParseObjects turned into JSON
            return func(collection.map(function(item){return item.toJSON();}));
        });
    }
    
    var JSONresult = businessQuery.first().then(getObjforBusiness);
    return JSONresult;
};

router.get('/index', function(req, res, next) {

    var getPoints = function(json) {
        // new daily customers with points
        data.new.daily = json.filter( function(point) {
            date = new Date(point.firstVisit);
            return date.setDate(date.getDate() + 1) > new Date();
        }).length;
        // new monthly customers with points
        data.new.monthly = json.filter( function(point) {
            date = new Date(point.firstVisit);
            return date.setMonth(date.getMonth() + 1) > new Date();
        }).length;
        // points earned
        data.points.earned = json.reduce( function(a, b) {
            return a + b.points;
        }, 0);
        // average points
        data.points.avg = data.points.earned / json.length;
    }

    var getAvgDuration = function(json) {;
            // average the durations sum / count
            var visitlength = json.reduce( function(a, b) {
                return a + (new Date(b.to.iso) - new Date(b.from.iso));
            }, 0) / json.length;
            data.visitlength = moment.duration(visitlength).humanize();
        res.json(data);
    }

    console.log("\nGetting points and average duration of customers...");
    queryObjForUserJSON(req.app.get('userQueried'), 'Points', getPoints).then( function() {
        queryObjForUserJSON(req.app.get('userQueried'), 'Interval', getAvgDuration);
    });
});


router.get('/points', function(req, res, next) {

    var pointsData = [{
        key : 'Points',
        values : []
    }];

    var mapSeries = function(json) {
        // map collection into series, with js timestamps
        var series = json.map( function (point) {
            return {
                x: +new Date(point.createdAt),
                y: point.points,
                size: 50
            };
        });
        // set and display
        pointsData[0].values = series;
        res.json(pointsData);
    }

    console.log("\nGetting points as series...");
    queryObjForUserJSON(req.app.get('userQueried'), 'Points', mapSeries);

});


router.get('/customers', function(req, res, next) {

    var customerData = [
        {
            key : 'Visits',
            values : []
        },
        {
            key : 'New Customers',
            values : []
        },
    ];

    var getVisitsByDate = function(json) {
        // get dates, and unique visits counts binned by said dates.
        var counts =  {};
        var arr = [];
        json.forEach( function(interval) {
            var d = moment(interval.from.iso);
            d.startOf('day');
            counts[+d] = 1 + (counts[+d] || 0);
        });
        for (key in counts)
            arr.push({x: parseInt(key), y: counts[key]});
        // sort entries by date.
        customerData[0].values = arr.sort( function(a, b) {
            return a.x - b.x;
        });
    }

    var getPointsByDate = function(json) {
            // bin dates for points data (where unique business-customer
            // relationships should first be instatiated... eventually)
            var counts = {};
            var arr = [];
            json.forEach( function(point) {
                var d = point.firstVisit ? moment(point.firstVisit.iso) : moment(point.createdAt.iso);
                d.startOf('day');
                counts[+d] = 1 + (counts[+d] || 0);
            });
            for (key in counts)
                arr.push({x: parseInt(key), y: counts[key]});
            customerData[1].values = arr.sort( function(a, b) {
                return a.x - b.x;
            });
            res.json(customerData);
        }

    console.log("\nGetting visits and points binned by date...");
    queryObjForUserJSON(req.app.get('userQueried'), 'Interval', getVisitsByDate).then( function() {
        queryObjForUserJSON(req.app.get('userQueried'), 'Points', getPointsByDate);
    });
});

module.exports = router;
