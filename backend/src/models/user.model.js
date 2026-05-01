const db = require("../config/db");

exports.findUserByEmail = async (email) => {
  const query = `
    SELECT id, email, username, password_hash, created_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;
  const { rows } = await db.query(query, [email]);
  return rows[0] || null;
};

exports.findUserById = async (id) => {
  const query = `
    SELECT id, email, username, created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0] || null;
};

exports.findUserByUsername = async (username) => {
  const query = `
    SELECT id, email, username, password_hash, created_at
    FROM users
    WHERE username = $1
    LIMIT 1
  `;
  const { rows } = await db.query(query, [username]);
  return rows[0] || null;
};

exports.createUser = async ({ email, username, passwordHash }) => {
  const query = `
    INSERT INTO users (email, username, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, email, username, created_at
  `;
  const { rows } = await db.query(query, [email, username, passwordHash]);
  return rows[0];
};