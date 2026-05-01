const express = require("express");
const { getLikeStatus, toggleLike } = require("../controllers/like.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:videoId", authMiddleware, getLikeStatus);
router.post("/toggle", authMiddleware, toggleLike);

module.exports = router;