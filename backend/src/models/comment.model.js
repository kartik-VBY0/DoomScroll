const db = require("../config/db");

exports.getCommentsByVideoId = async (videoId) => {
  const { rows } = await db.query(
    `
      SELECT c.id, c.user_id, c.video_id, c.body, c.created_at, u.username
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.video_id = $1
      ORDER BY c.created_at DESC
    `,
    [videoId]
  );
  return rows;
};

exports.createComment = async ({ videoId, userId, body }) => {
  const { rows } = await db.query(
    `
      WITH created AS (
        INSERT INTO comments (video_id, user_id, body)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, video_id, body, created_at
      )
      SELECT created.*, u.username
      FROM created
      JOIN users u ON u.id = created.user_id
    `,
    [videoId, userId, body]
  );
  return rows[0];
};