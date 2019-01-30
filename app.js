'use strict';

const express = require('express');
const app = express();
const path = require('path')
const request = require('request');
var parseurl = require('parseurl');
const assert = require('assert');


var session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(session);


var store = new MongoDBStore({
  uri: 'mongodb://david:davidkester13@ds247499.mlab.com:47499/wattlab',
  collection: 'sessions'
});

// Catch errors
store.on('error', function(error) {
  assert.ifError(error);
  assert.ok(false);
});

app.use(session({
  secret: 'wattlab tool',
  store: store,
  cookie: {
    maxAge: 1000 * 60 * 60 * 1 // 1 hour
  },
  resave: true,
  saveUninitialized: true
}))


const NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({
  provider: 'openstreetmap'
});

var lon;
var lat;

app.get('/redirect', (req, res) => {
	geocoder.geocode(req.query.city, function(err, res) {
	  console.log(res);
	  console.log(res[0].city + ', ' + res[0].country);
	  console.log(res[0].formattedAddress);
	  console.log(res[0].longitude);

	  lon = res[0].longitude;
	  lat = res[0].latitude;
	}).then( PVGIS => {
		request('http://re.jrc.ec.europa.eu/pvgis5/PVcalc.php?loss=14&peakpower=1&lat='+ lat +'&lon='+lon, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		    console.log(body) // Print the google web page.
		    res.send(body)
		  }
		})
	}).catch(error => {
      // Do some proper error handling.
      res.send(error);
    });

});

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1

  next()
})

app.get('/foo', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})

app.get('/bar', function (req, res, next) {
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
})

//app.use('/', express.static('/Users/davidkester/Sites/wattlab-tool'));

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/', express.static(path.join(__dirname, 'public')));

app.listen(3025, () => console.log('Listening on port 3025'));


