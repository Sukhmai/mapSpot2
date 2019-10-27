// Define server and plugins
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var server = http.createServer(app);
var io = require('socket.io').listen(server);
require('dotenv').config();
const mbxUpload = require('@mapbox/mapbox-sdk/services/uploads');
const uploadsClient = mbxUpload({ accessToken: process.env.uploadKey });
const AWS = require('aws-sdk');

// Main server runs on this port, will be used by other scripts
server.listen(8080);

app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/** The following methods provide GET functionality for
 *** the server, simplifying file locations for other scripts. */

//This is the default page, which holds the map
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
//This is the page for people to upload their own custom maps
app.get('/upload', function(req, res) {
  res.sendFile(__dirname + '/public/upload.html');
})

//This is the post request to upload a file to mapbox
//Reference Mapbox JS SDK on uploads
app.post('/uploadFile', function(req, res) {
  let file = req.body.file;
  let password = req.body.password;
  let tilesetName = req.body.tilesetName;
  let username = "atlmaproom";

  if (password === process.env.password) {
    let mbxCredentials = null;

    //Function to get the AWS credentials from Mapbox
    const getCredentials = () => {
      return uploadsClient.createUploadCredentials().send().then(response => response.body);
    }

    //Function to load file onto AWS
    const putFileOnS3 = (credentials) => {
      const s3 = new AWS.S3({
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        sessionToken: credentials.sessionToken,
        region: 'us-east-1'
      });
      return s3.putObject({
        Bucket: credentials.bucket,
        Key: credentials.key,
        Body: "hi"
      }).promise();
    };

    //This function syncs the functions in order
    async function upload() {
      credentials = await getCredentials();
      await putFileOnS3(credentials);
      uploadsClient.createUpload({
        mapId: `${username}.${tilesetName}`,
        url: credentials.url
      });
    }

    upload();
  }
})
/**
 * Handles logic for all incoming socket events, when
 * connection is received from projector and controller.
 *
 * @listens socket connection
 */
io.on('connection', function(socket) {

    // Fired when map is updated on controller
    socket.on('mapUpdate', function(data) {
        socket.broadcast.emit('pushMapUpdate', data)
        console.log("Map Updated")
    });

    // Fired when keyboard keys are used to nudge map on projector
    socket.on("projNudge", function(data) {
        console.log(data.direction)
        socket.broadcast.emit("projNudge", data);
    });

    // Fired when a layer is hidden on the controller
    socket.on('hideLayer', function(data) {
        socket.broadcast.emit('pushHideLayer', data)
    });

    // Fired when a layer is shown on the controller
    socket.on('showLayer', function(data) {
        socket.broadcast.emit('pushShowLayer', data)
    });

    // Fired when the laser sensor server connects to the socket
    socket.on('sensorConnected', function(data) {
        console.log("Sensor server connected");
    })

    // Fired when a new sensor reading is received from the sensor server
    socket.on('sensorUpdate', function(data) {
        socket.broadcast.emit('pushSensorUpdate', data);
    })
})
