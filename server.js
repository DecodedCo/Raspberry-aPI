/*

Decoded API

Copyright (C) 2014 Decoded Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var express = require('express'),
  fs = require('fs'),
  checkins = require('./checkins'),
  path = require('path'),
  arbitrary = require('./arbitrary'),
  app = express();

//  create a directory
//  don't check for directory first as may instigate a race condition
//  just handle the error

function mkdir(name) {
  try {
    fs.mkdirSync(name);
    return true;
  } catch (e) {
    return false;
  }
}

mkdir('./data');
mkdir('./data/checkins');
mkdir('./data/store');

// CORS middleware
function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

// Set jsonp callback - mirrored in javascript calls
app.set('jsonp callback name', 'callback');
app.use(allowCrossDomain);
app.use(express.json());
app.use(express.urlencoded());

function errorHandler(res, err) {
  'use strict';

  console.log('Error:', err, err.stack);

  res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
}

checkins(app, errorHandler);
arbitrary(app, errorHandler);


app.use(express.static(path.join(__dirname, '/public')));

// listen to 80 on the Pi
app.listen(3000);
