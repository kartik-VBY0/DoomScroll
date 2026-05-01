const db = require("../config/db");

exports.listVideos = async () => {
  const { rows } = await db.query(
    `
      SELECT v.*, u.username,
        (SELECT COUNT(*)::int FROM likes l WHERE l.video_id = v.id) AS like_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count
      FROM videos v
      JOIN users u ON u.id = v.user_id
      ORDER BY v.created_at DESC
    `
  );
  return rows;
};

exports.listVideosByUser = async (userId) => {
  const { rows } = await db.query(
    `
      SELECT v.*, u.username,
        (SELECT COUNT(*)::int FROM likes l WHERE l.video_id = v.id) AS like_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count
      FROM videos v
      JOIN users u ON u.id = v.user_id
      WHERE v.user_id = $1
      ORDER BY v.created_at DESC
    `,
    [userId]
  );
  return rows;
};

exports.createVideo = async ({ userId, videoUrl, caption }) => {
  const query = `
    INSERT INTO videos (user_id, video_url, caption)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, video_url, thumb_url, caption, created_at
  `;
  const { rows } = await db.query(query, [userId, videoUrl, caption]);
  return rows[0];
};

exports.getVideoById = async (videoId) => {
  const { rows } = await db.query("SELECT * FROM videos WHERE id = $1 LIMIT 1", [videoId]);
  return rows[0] || null;
};

exports.deleteVideoById = async (videoId) => {
  const { rows } = await db.query(
    "DELETE FROM videos WHERE id = $1 RETURNING id, user_id, video_url",
    [videoId]
  );
  return rows[0] || null;
};