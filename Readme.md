[![Build Status](https://travis-ci.org/kernicPanel/skproject.png)](https://travis-ci.org/kernicPanel/skproject)

1. run "npm install" in root to install modules dependencies.

2. install mongodb

3. copy /lib/config.example.js to /lib/config.js and edit it

4. run "node server.js" to run server

5. open "http://localhost:8081/" in browser to connect

6. register a user using redmine api key

7. add user login to config.server.admin[] in /lib/config.js

8. open "http://localhost:8081/admin" in browser

9. click rebuild base to sync realteam db with redmine data
(can take long time depending on your redmine data and your system).
This is a bit buggy for now, check the logs and retry if necessary
