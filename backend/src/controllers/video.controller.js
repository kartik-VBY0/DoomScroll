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

function getCloudinaryPublicId(videoUrl) {
  try {
    const url = new URL(videoUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const uploadIndex = parts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) return null;

    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0]?.startsWith("v") ? afterUpload.slice(1) : afterUpload;
    if (!withoutVersion.length) return null;
    const joined = withoutVersion.join("/");
    return joined.replace(/\.[^/.]+$/, "");
  } catch (error) {
    return null;
  }
}

exports.deleteVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const video = await videoModel.getVideoById(videoId);

    if (!video) {
      const error = new Error("Video not found");
      error.statusCode = 404;
      throw error;
    }

    if (String(video.user_id) !== String(req.userId)) {
      const error = new Error("Forbidden");
      error.statusCode = 403;
      throw error;
    }

    const publicId = getCloudinaryPublicId(video.video_url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    }

    await videoModel.deleteVideoById(videoId);
    res.status(200).json({ message: "Video deleted" });
  } catch (error) {
    next(error);
  }
};
