const express = require("express");
const { googleAuthCallback, googleAuthStart, login, me, signup } = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", authMiddleware, me);
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);

module.exports = router;