/*

Decoded API

Copyright (C) 2014 Decoded Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var fs = require('fs'),
  path = require('path'),
  async = require('async');

var second = 1000;

function pushIfDoesntContain(arr, value) {
  if (arr.indexOf(value) === -1) {
    arr.push(value);
  }
}

module.exports = function() {
  'use strict';

  // new Store('./data');
  function Store(root, timeout) {
    var _ths = this;

    this.root = root;
    this.timeout = (timeout || 3) * second;

    this._store = {};
    this._changed = [];

    // Load existing DBs into memory
    var files = fs.readdirSync(root);

    for (var i = 0, l = files.length; i < l; i++) {
      var filename = files[i];

      if (fs.statSync(path.join(root, filename)).isFile()) {
        this._store[filename] = JSON.parse(fs.readFileSync(path.join(root, filename), {encoding: 'utf8'}));
        this._changed.push(filename);
      }
    }

    // Every few seconds, write changed DBs to disk
    setTimeout(function() {
      _ths.write();
    }, this.timeout);
  }

  Store.prototype.write = function() {
    var _ths = this,
      changed = this._changed;
    if (this._changed.length !== 0) {
      // We've got a list of changed dbs, start capturing new ones.
      this._changed = [];

      // For each changed DB, write the file to the disk.
      async.each(changed, function(name, callback) {
        console.log("writing to", path.join(_ths.root, name));
        fs.writeFile(path.join(_ths.root, name), JSON.stringify(_ths._store[name]), callback);
      }, function() {
        // We've written everything to the disk, yay! Now let's wait a while and write again.
        console.log("Wrote " + changed.length + " dbs to disk.");
        setTimeout(function() {
          _ths.write();
        }, _ths.timeout);
      });
    } else {
      // No changes to write, check again later:
      setTimeout(function() {
        _ths.write();
      }, this.timeout);
    }
  };

  //this will create a database if it doesnt exist
  Store.prototype.save = function(dbname, property, value) {
    //if the store doesnt have a database called dbname
    if (!this._store.hasOwnProperty(dbname)) {
      //create it
      this._store[dbname] = {};
    }
    //set the db property to the value specified
    this._store[dbname][property] = value;

    //and save the database!
    pushIfDoesntContain(this._changed, dbname);
  };

  Store.prototype.get = function(dbname, property) {
    // Fetch stuff out of _store, with sensible defaults for when the requested stuff doesn't exist
    if (property === undefined) {
      //if no property (i.e ID) then return the whole database
      if (this._store[dbname] === undefined) {
        //if there is no database return empty json
        return {};
      } else {
        return this._store[dbname];
      }
    }
    //if database exists, and property in the database exists return only that entry
    if (this._store[dbname] && this._store[dbname][property]) {
      return this._store[dbname][property];
    } else {
      //do nothing
      return undefined;
    }
  };

  return Store;
}();
