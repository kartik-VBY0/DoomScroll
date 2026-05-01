const db = require("../config/db");

exports.countLikesByVideoId = async (videoId) => {
  const { rows } = await db.query("SELECT COUNT(*)::int AS count FROM likes WHERE video_id = $1", [videoId]);
  return rows[0]?.count || 0;
};

exports.isLikedByUser = async (videoId, userId) => {
  const { rows } = await db.query(
    "SELECT 1 FROM likes WHERE video_id = $1 AND user_id = $2 LIMIT 1",
    [videoId, userId]
  );
  return rows.length > 0;
};

exports.toggleLike = async (videoId, userId) => {
  const exists = await exports.isLikedByUser(videoId, userId);
  if (exists) {
    await db.query("DELETE FROM likes WHERE video_id = $1 AND user_id = $2", [videoId, userId]);
    return false;
  }

  await db.query("INSERT INTO likes (video_id, user_id) VALUES ($1, $2)", [videoId, userId]);
  return true;
};