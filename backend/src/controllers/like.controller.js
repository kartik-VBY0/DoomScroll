const likeModel = require("../models/like.model");

exports.toggleLike = async (req, res, next) => {
  try {
    const { videoId } = req.body;
    if (!videoId) {
      const error = new Error("videoId is required");
      error.statusCode = 400;
      throw error;
    }

    const liked = await likeModel.toggleLike(videoId, req.userId);
    const count = await likeModel.countLikesByVideoId(videoId);

    res.status(200).json({ liked, count });
  } catch (error) {
    next(error);
  }
};

exports.getLikeStatus = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const liked = await likeModel.isLikedByUser(videoId, req.userId);
    const count = await likeModel.countLikesByVideoId(videoId);
    res.status(200).json({ liked, count });
  } catch (error) {
    next(error);
  }
};
