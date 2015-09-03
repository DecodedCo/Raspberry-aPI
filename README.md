Raspberry aPI
===============

![Raspberry aPI](http://assets.decoded.co/images/raspberry-api.jpg)

This repository contains the code for the Decoded API, running on a Raspberry Pi in our London HQ.

It uses the open source platform [Node.js](https://github.com/joyent/node) and [Express framework](https://github.com/strongloop/express), and is written in JavaScript.

Run the server by cloning this repo onto your own server, installing node and node package manager (npm). Then run in order:

```
npm install;
cd public && bower install;
cd ../;
node server.js
```
server.js is the main file; it calls checkins.js and arbitrary.js to create the /checkins and /store endpoints.

If you are interested in running this on your own Raspberry Pi, let us know how you get on! We will be writing full documentation shortly.
