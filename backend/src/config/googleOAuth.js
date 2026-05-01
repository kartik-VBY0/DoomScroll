const { OAuth2Client } = require("google-auth-library");

function getGoogleOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_CALLBACK_URL,
  };
}

function assertGoogleOAuthConfig() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();

  if (!clientId || !clientSecret || !redirectUri) {
    const error = new Error(
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL."
    );
    error.statusCode = 500;
    throw error;
  }
}

function createGoogleOAuthClient() {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  return new OAuth2Client(clientId, clientSecret, redirectUri);
}

module.exports = {
  getGoogleOAuthConfig,
  assertGoogleOAuthConfig,
  createGoogleOAuthClient,
};