const commentModel = require("../models/comment.model");

exports.addComment = async (req, res, next) => {
  try {
    const { videoId, body } = req.body;
    if (!videoId || !body || !body.trim()) {
      const error = new Error("videoId and body are required");
      error.statusCode = 400;
      throw error;
    }

    const created = await commentModel.createComment({
      videoId,
      userId: req.userId,
      body: body.trim(),
    });

    res.status(201).json({ comment: created });
  } catch (error) {
    next(error);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const comments = await commentModel.getCommentsByVideoId(videoId);
    res.status(200).json({ comments });
  } catch (error) {
    next(error);
  }
};
