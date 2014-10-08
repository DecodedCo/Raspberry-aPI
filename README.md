Raspberry aPI
===============

![Raspberry aPI](http://assets.decoded.co/images/raspberry-api.jpg)

Documentation<a name="documentation"></a>
================

###About<a name="about"></a>

This repository contains the code for the [Decoded API](http://api.decoded.co), running on a Raspberry Pi in our London HQ.

It uses the open source platform [Node.js](https://github.com/joyent/node) and [Express framework](https://github.com/strongloop/express), and is written in JavaScript.

If you are interested in running this on your own Raspberry Pi, [see here for setup details](#setting-up) and let us know how you get on! This [Documentation](#documentation) is still a work in progress.

###Setting up<a name="setting-up"></a>

1. First, clone this repository onto your server.
2. If you don't already have [Node]() installed, do that now.
..* Also, you may need to install Node Package Manager (npm).

Run the server by cloning this repo onto your own server, installing node and node package manager (npm). Then run `npm install`, `cd public; bower install` and then run `node server.js`

server.js is the main file; it calls checkins.js and arbitrary.js to create the /checkins and /store endpoints.

