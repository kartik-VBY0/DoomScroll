const express = require("express");
const { deleteVideo, getVideos, uploadVideo } = require("../controllers/video.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", getVideos);
router.post("/", authMiddleware, upload.single("video"), uploadVideo);
router.delete("/:videoId", authMiddleware, deleteVideo);

module.exports = router;