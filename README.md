Raspberry aPI
===============

![Raspberry aPI](http://assets.decoded.co/images/raspberry-api.jpg)

This repo runs our Raspberry Pi from our London HQ.

It uses Node.js as the server framework, and is written in JavaScript. 

Run the server by cloning this repo onto your own server, installing node and node package manager (npm), and then run `node server.js`

Server.js is the main file; it calls checkins.js and arbitrary.js to create the /checkins and /store endpoints.

If you are interested in running this on your own Raspberry Pi, let us know how you get on! We will be writing full documentation shortly. 