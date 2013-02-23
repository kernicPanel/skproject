[![Build Status](http://travis-ci.org/kernicPanel/skproject.png)](http://travis-ci.org/kernicPanel/skproject)

run "npm install" in root to install modules dependencies.

install mongodb

copy /lib/config.example.js to /lib/config.js and edit it

run "node server.js" to run server

open "http://localhost:8081/" in browser to connect

register a user using redmine api key

add user login to config.server.admin[] in /lib/config.js

open "http://localhost:8081/admin" in browser

click rebuild base to sync realteam db with redmine data
(can take long time depending on your redmine data and your system)
