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
* The above will need to happen each time a git pull is done. See below for restarting the server.

server.js is the main file; it calls checkins.js and arbitrary.js to create the /checkins and /store endpoints respectively

If you are interested in running this on your own Raspberry Pi, let us know how you get on! We will be writing full documentation shortly.

## Restarting the server

* The server is best handled by systemd or initd. Your choice. We are running this on a raspberry pi and are using systemd. 
To copy that setup, create node.service in `/etc/systemd/system/` with the following contents and permissions. Alternatively (and much better) would be to user supervisord, however we haven't got around to setting that up yet

* permissions:

`-rw-r--r-- 1 root root  304 Jun 18  2013 node.service`

```
[Unit]
Description=node.js
Requires=network.target
After=network.target

[Service]
WorkingDirectory=/srv/node
ExecStart=/usr/bin/node /srv/node/server.js
Restart=always
StandardOutput=syslog
SyslogIdentifier=node
User=root
Group=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```
