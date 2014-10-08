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
_Note: The following guide assumes that a Linux/Unix-like System is used_

1. Clone this repository onto your server.
2. If you don't already have [Node](http://nodejs.org/) installed, do that now.
  * Also, you may need to install [Node Package Manager](https://www.npmjs.org/) `(npm)`, if that is not already installed.
3. Run `npm install`, whilst in the project directory.
4. Then run `cd public; bower install`.
5. Finally, to run the server change back to the main project directory  and run the server with node:
  ```
  cd ..
  node server.js
  ```
  * __NOTE:__ The server might fail to run if you don't have root/sudo/admin privileges and try to run the server on a _well-known port_ (any port from 0 to 1023). By default, this server is configured to run on well-known port 80, the HTTP port. If you want to change this so that you don't need speical permissions, you'll need to change this to any port number over 1023. The way to do this is as follows:
    At the end of the `server.js` file, you should see the following:

    ```
    // listen to 80 on the Pi
    app.listen(80);
    ```

    Change the number 80 to a port number of your choice.

server.js is the main file; it calls checkins.js and arbitrary.js to create the /checkins and /store endpoints.