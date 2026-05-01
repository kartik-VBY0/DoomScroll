const fs = require("fs/promises");
const cloudinary = require("../config/cloudinary");
const videoModel = require("../models/video.model");

exports.getVideos = async (req, res, next) => {
  try {
    const videos = await videoModel.listVideos();
    res.status(200).json({ videos });
  } catch (error) {
    next(error);
  }
};

exports.uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("Video file is required");
      error.statusCode = 400;
      throw error;
    }

    const caption = (req.body.caption || "").trim();
    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
      folder: "scroll-reels",
    });

    await fs.unlink(req.file.path);

    const fileUrl = uploadResult.secure_url;

    const created = await videoModel.createVideo({
      userId: req.userId,
      videoUrl: fileUrl,
      caption: caption || null,
    });

    res.status(201).json({ video: created });
  } catch (error) {
    next(error);
  }
};
