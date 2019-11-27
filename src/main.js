// Define server and plugins
var fs = require('fs');
var express = require('express');
var app = express();
var http = require('http');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var server = http.createServer(app);

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
});

app.get('/sources', function(req, res) {
  fs.readFile('sourcelist.txt', 'utf8', function(err, data) {
    if (err) throw err;
    res.send(data);
  });

});

//This is the post request to upload a file to mapbox
//Reference Mapbox JS SDK on uploads
app.post('/uploadFile', upload.single('datafile'), function(req, res) {
  let file = req.file;
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
          Body: file.buffer
        }).promise();
    };

    //This function syncs the functions in order
    async function upload() {
      credentials = await getCredentials();
      await putFileOnS3(credentials);
      uploadsClient.createUpload({
        mapId: `${username}.${tilesetName}`,
        url: credentials.url,
        tilesetName: `${tilesetName}`
      }).send().then(response => {
          const upload = response.body;
        }).catch(err => console.log('error:', err));;
    }

    upload();
  }
})
