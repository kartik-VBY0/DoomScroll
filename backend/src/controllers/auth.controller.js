const authService = require("../services/auth.service");

exports.login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body || {});
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const result = await authService.signupUser(req.body || {});
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.userId);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

exports.googleAuthStart = async (req, res, next) => {
  try {
    const authUrl = authService.getGoogleAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

exports.googleAuthCallback = async (req, res, next) => {
  try {
    const { code, error: providerError, mode } = req.query;

    if (providerError) {
      const error = new Error(`Google OAuth failed: ${providerError}`);
      error.statusCode = 400;
      throw error;
    }

    const result = await authService.loginWithGoogleCode(code);

    if (mode === "json") {
      res.status(200).json(result);
      return;
    }

    const frontendSuccessUrl = process.env.FRONTEND_OAUTH_SUCCESS_URL || `${process.env.FRONTEND_ORIGIN || "http://localhost:3000"}/auth/login`;
    const redirectUrl = new URL(frontendSuccessUrl);

    redirectUrl.searchParams.set("token", result.token);
    redirectUrl.searchParams.set("email", result.user.email);
    redirectUrl.searchParams.set("username", result.user.username);
    redirectUrl.searchParams.set("id", result.user.id);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
};
