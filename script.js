require('dotenv').config();
const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const Twilio = require("twilio");
const path = require("path");

// If modifying these SCOPES, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.modify"];
const TOKEN_PATH = process.env.TOKEN_PATH;

// Twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

// Define the path to the credentials file
const CRED_PATH = path.resolve(process.env.CRED_PATH);

// Load client secrets from a local file.
fs.readFile(CRED_PATH, (err, content) => {
  if (err) return console.log("Error loading client secret file:", err);
  authorize(JSON.parse(content), checkEmails);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris && redirect_uris.length > 0
      ? redirect_uris[0]
      : "http://localhost:3000"
  );

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {function} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error("Error retrieving access token", err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function checkEmails(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  setInterval(() => {
    gmail.users.messages.list(
      {
        userId: "me",
        q: "is:unread",
      },
      (err, res) => {
        if (err) return console.log("The API returned an error: " + err);
        const messages = res.data.messages;
        if (!messages || messages.length === 0) {
          console.log("No new emails.");
        } else {
          console.log("New emails:");
          messages.forEach((message) => {
            gmail.users.messages.get(
              {
                userId: "me",
                id: message.id,
              },
              (err, res) => {
                if (err)
                  return console.log("The API returned an error: " + err);
                const email = res.data;
                const snippet = email.snippet;
                sendWhatsAppAlert(snippet);
                // Mark the email as read
                gmail.users.messages.modify(
                  {
                    userId: "me",
                    id: message.id,
                    requestBody: {
                      removeLabelIds: ["UNREAD"],
                    },
                  },
                  (err, res) => {
                    if (err) console.log("Error marking email as read:", err);
                  }
                );
              }
            );
          });
        }
      }
    );
  }, 60000); // Check for new emails every 60 seconds
}

function sendWhatsAppAlert(emailSnippet) {
  client.messages
    .create({
      body: `New important email received: ${emailSnippet}`,
      from: process.env.WHATSAPP_FROM, // Twilio sandbox number for WhatsApp
      to: process.env.WHATSAPP_TO, // Your verified number
    })
    .then((message) => console.log(`WhatsApp alert sent: ${message.sid}`))
    .catch((error) => {
      console.error("Error sending WhatsApp alert:", error);
      console.error("Error details:", error.response ? error.response.data : error.message);
    });
}
