/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

// commands for packing and unpacking tarballs
// this file is used by lib/cache.js

const events = require('weexpack-common').events;
const fs = require('fs');
const Q = require('q');
const tar = require('tar');
const zlib = require('zlib');

exports.unpackTgz = unpackTgz;

// Returns a promise for the path to the unpacked tarball (unzip + untar).
function unpackTgz (packageTgz, unpackTarget) {
  return Q.promise(function (resolve, reject) {
    const extractOpts = { type: 'Directory', path: unpackTarget, strip: 1 };

    fs.createReadStream(packageTgz)
        .on('error', function (err) {
          events.emit('warn', 'Unable to open tarball ' + packageTgz + ': ' + err);
          reject(err);
        })
        .pipe(zlib.createUnzip())
        .on('error', function (err) {
          events.emit('warn', 'Error during unzip for ' + packageTgz + ': ' + err);
          reject(err);
        })
        .pipe(tar.Extract(extractOpts))
        .on('error', function (err) {
          events.emit('warn', 'Error during untar for ' + packageTgz + ': ' + err);
          reject(err);
        })
        .on('end', resolve);
  })
    .then(function () {
      return unpackTarget;
    });
}
