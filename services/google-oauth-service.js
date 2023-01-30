require("dotenv").config();

const { google } = require("googleapis");

const gCred = {
  CLIENT_ID: process.env.G_CLIENT_ID,
  CLIENT_SECRET: process.env.G_CLIENT_SECRET,
  REDIRECT_URI: process.env.G_REDIRECT_URI,
  REFRESH_TOKEN: process.env.G_REFRESH_TOKEN,
};

const oAuth2Client = new google.auth.OAuth2(
  gCred.CLIENT_ID,
  gCred.CLIENT_SECRET,
  gCred.REDIRECT_URI
);

oAuth2Client.setCredentials({
  refresh_token: gCred.REFRESH_TOKEN,
});

/**
 * @deprecated not used anymore
 */
module.exports = { gCred, oAuth2Client };
