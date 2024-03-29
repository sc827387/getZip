const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
var request = require('request');
var JSZip = require("jszip");







function handleCreateProjectResponse(intent, session, callback){

//Drive API, v3
//https://www.googleapis.com/auth/drive	See, edit, create, and delete all of your Google Drive files
//https://www.googleapis.com/auth/drive.file View and manage Google Drive files and folders that you have opened or created with this app
//https://www.googleapis.com/auth/drive.metadata.readonly View metadata for files in your Google Drive
//https://www.googleapis.com/auth/drive.photos.readonly View the photos, videos and albums in your Google Photos
//https://www.googleapis.com/auth/drive.readonly See and download all your Google Drive files
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Drive API.
    //authorize(JSON.parse(content), listFiles);
    //authorize(JSON.parse(content), getFile);
    authorize(JSON.parse(content), uploadFile);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);//list files and upload file
        //callback(oAuth2Client, '0B79LZPgLDaqESF9HV2V3YzYySkE');//get file

    });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function getFile() {
  return new Promise(function(resolve, reject) {
    request(
      {
        method: "GET",
        url: "https://start.spring.io/starter.zip",
        encoding: null // <- this one is important !
      },
      function(error, response, body) {
        if (error && response.statusCode != 200) {
          reject(error);
          return;
        }
        resolve(body);
      }
    );
  });
}


async function uploadFile(auth) {
  const stream = require("stream"); // In this script, use this module.

  const buffer = await getFile();
  const bs = new stream.PassThrough();
  bs.end(buffer);

  const drive = google.drive({ version: "v3", auth });
  var fileMetadata = {
    name: "demo.zip"
  };
  var media = {
    mimeType: "application/zip",
    body: bs // Modified
  };
  drive.files.create(
    {
      resource: fileMetadata,
      media: media,
      fields: "id"
    },
    function(err, res) {
      if (err) {
        // Handle error
        console.log(err);
      } else {
        console.log("File Id: ", res.data.id);
      }
    }
  );
}

}



