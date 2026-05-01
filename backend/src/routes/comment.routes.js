const express = require("express");
const { addComment, getComments } = require("../controllers/comment.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/:videoId", getComments);
router.post("/", authMiddleware, addComment);

module.exports = router;