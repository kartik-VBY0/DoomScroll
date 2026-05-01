const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const videoRoutes = require("./routes/video.routes");
const userRoutes = require("./routes/user.routes");
const likeRoutes = require("./routes/like.routes");
const commentRoutes = require("./routes/comment.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);

app.use(errorMiddleware);

module.exports = app;