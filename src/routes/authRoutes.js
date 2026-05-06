import express from "express";

import passport from "../config/passport.js";

const router = express.Router();

router.get(
  "/google",
  (req, res, next) => {
    // Example frontend: /auth/google?state=role=player
    const { state } = req.query;
    if (!state) {
      return res
        .status(400)
        .json({ error: true, message: "Role is required in state", code: 400 });
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"], // request profile + email
    session: false,
  })
);

// Step 2: Google callback (redirects back here after login)
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // passport done() passes { user, roles, token }
    const { user, roles, token } = req.user;

    if (!user.gender || !user.birthday) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "Google login success,but profile incomplete!",
        requireProfileCompletion: true,
        user,
        token,
      });
    }

    // Send data back to frontend
    res.status(200).json({
      code: 200,
      error: false,
      message: "Google login success",
      user,
      roles,
      token,
    });
  }
);

// Step 1: redirect to Facebook
router.get(
  "/facebook",
  (req, res, next) => {
    const { state } = req.query;
    if (!state) {
      return res
        .status(400)
        .json({ error: true, message: "Role is required in state", code: 400 });
    }
    next();
  },
  passport.authenticate("facebook", {
    scope: ["email"], // request email
    session: false,
  })
);

// Step 2: Facebook callback
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const { user, roles, token } = req.user;

    if (!user.gender || !user.birthday) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "facebook login success,but profile incomplete!",
        requireProfileCompletion: true,
        user,
        token,
      });
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "Facebook login success",
      user,
      roles,
      token,
    });
  }
);

// Step 1: redirect to Apple
router.get(
  "/apple",
  (req, res, next) => {
    const { state } = req.query;
    if (!state) {
      return res
        .status(400)
        .json({ error: true, message: "Role is required in state", code: 400 });
    }
    next();
  },
  passport.authenticate("apple", { scope: ["name", "email"], session: false })
);

// Step 2: Apple callback
router.post(
  "/apple/callback", // Apple usually sends POST
  passport.authenticate("apple", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const { user, roles, token } = req.user;
    if (!user.gender || !user.birthday) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "Apple login success,but profile incomplete!",
        requireProfileCompletion: true,
        user,
        token,
      });
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "apple login success",
      user,
      roles,
      token,
    });
  }
);

export default router;
