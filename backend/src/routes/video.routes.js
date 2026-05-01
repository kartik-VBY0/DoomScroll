const express = require("express");
const { getVideos, uploadVideo } = require("../controllers/video.controller");
const authMiddleware = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/", getVideos);
router.post("/", authMiddleware, upload.single("video"), uploadVideo);

module.exports = router;