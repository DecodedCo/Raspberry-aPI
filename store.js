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

  Store.prototype.save = function(dbname, property, value) {
    if (!this._store.hasOwnProperty(dbname)) {
      // If there's no db yet, create it
      this._store[dbname] = {};
    }

    this._store[dbname][property] = value;

    // Add the db to the list of changed dbs
    pushIfDoesntContain(this._changed, dbname);
  };

  Store.prototype.get = function(dbname, property) {
    // Fetch stuff out of _store, with sensible defaults for when the requested stuff doesn't exist
    if (property === undefined) {
      if (this._store[dbname] === undefined) {
        return {};
      } else {
        return this._store[dbname];
      }
    }

    if (this._store[dbname] && this._store[dbname][property]) {
      return this._store[dbname][property];
    } else {
      return undefined;
    }
  };

  return Store;
}();
