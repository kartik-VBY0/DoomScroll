const userModel = require("../models/user.model");
const videoModel = require("../models/video.model");

exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findUserById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const videos = await videoModel.listVideosByUser(userId);
    res.status(200).json({ user, videos });
  } catch (error) {
    next(error);
  }
};
