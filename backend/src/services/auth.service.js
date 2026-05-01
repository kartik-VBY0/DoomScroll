const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { signToken } = require("../utils/jwt");
const { assertGoogleOAuthConfig, createGoogleOAuthClient, getGoogleOAuthConfig } = require("../config/googleOAuth");
const userModel = require("../models/user.model");

function buildAuthPayload(user) {
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at,
    },
    token: signToken({ userId: user.id }),
  };
}

function toSafeUsernameSeed(value) {
  return (value || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 16) || "user";
}

async function createOAuthUser({ email, preferredUsername }) {
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
  const baseUsername = toSafeUsernameSeed(preferredUsername || email.split("@")[0]);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const suffix = attempt === 0 ? "" : `${Math.floor(Math.random() * 9000) + 1000}`;
    const username = `${baseUsername}${suffix}`.slice(0, 24);
    const existing = await userModel.findUserByUsername(username);
    if (existing) continue;

    return userModel.createUser({
      email,
      username,
      passwordHash,
    });
  }

  const fallbackUsername = `user${Date.now()}`;
  return userModel.createUser({
    email,
    username: fallbackUsername,
    passwordHash,
  });
}

exports.signupUser = async ({ email, username, password }) => {
  if (!email || !username || !password) {
    const error = new Error("Email, username and password are required");
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await userModel.findUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await userModel.createUser({
    email: normalizedEmail,
    username: username.trim(),
    passwordHash,
  });

  return buildAuthPayload(user);
};

exports.loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await userModel.findUserByEmail(normalizedEmail);

  if (!user || !user.password_hash) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return buildAuthPayload(user);
};

exports.getCurrentUser = async (userId) => {
  const user = await userModel.findUserById(userId);
  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.created_at,
  };
};

exports.getGoogleAuthUrl = () => {
  assertGoogleOAuthConfig();

  const client = createGoogleOAuthClient();
  const state = crypto.randomBytes(16).toString("hex");

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["openid", "email", "profile"],
    state,
  });
};

exports.loginWithGoogleCode = async (code) => {
  if (!code) {
    const error = new Error("Missing Google authorization code");
    error.statusCode = 400;
    throw error;
  }

  assertGoogleOAuthConfig();

  const client = createGoogleOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  if (!tokens.id_token) {
    const error = new Error("Google OAuth failed: id_token missing");
    error.statusCode = 401;
    throw error;
  }

  const { clientId } = getGoogleOAuthConfig();
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });
  const payload = ticket.getPayload();

  const email = payload?.email?.toLowerCase();
  if (!email) {
    const error = new Error("Google account does not provide a valid email");
    error.statusCode = 400;
    throw error;
  }

  let user = await userModel.findUserByEmail(email);
  if (!user) {
    user = await createOAuthUser({
      email,
      preferredUsername: payload?.name || email.split("@")[0],
    });
  }

  return buildAuthPayload(user);
};