const db = require("../config/db");

exports.listVideos = async () => {
  const { rows } = await db.query(
    `
      SELECT v.*,
        (SELECT COUNT(*)::int FROM likes l WHERE l.video_id = v.id) AS like_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count
      FROM videos v
      ORDER BY v.created_at DESC
    `
  );
  return rows;
};

exports.listVideosByUser = async (userId) => {
  const { rows } = await db.query(
    `
      SELECT v.*,
        (SELECT COUNT(*)::int FROM likes l WHERE l.video_id = v.id) AS like_count,
        (SELECT COUNT(*)::int FROM comments c WHERE c.video_id = v.id) AS comment_count
      FROM videos v
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