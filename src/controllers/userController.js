import crypto from "crypto";
// import sqsClient from "../config/sqsClient.js";
import bcrypt from "bcrypt";
import models from "../models/Associations.js";
// import Club from "../models/Club.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
// import { SendMessageCommand } from "@aws-sdk/client-sqs";

const { User, UserRole, Role } = models;
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_JWT_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_JWT_SECRET || ACCESS_TOKEN_SECRET;

const ensureJwtSecrets = () => {
  if (!ACCESS_TOKEN_SECRET) {
    throw new Error(
      "JWT secret missing. Set ACCESS_TOKEN_JWT_SECRET or JWT_SECRET."
    );
  }
};

const signAccessToken = (user, roleNames) =>
  jwt.sign(
    {
      id: user.id,
      roles: roleNames,
      tokenVersion: user.tokenVersion || 0,
      isVerified: user.isVerified,
      expiresAt: user.accountExpiresAt,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

const signRefreshToken = (user, roleNames) =>
  jwt.sign(
    {
      id: user.id,
      roles: roleNames,
      tokenVersion: user.tokenVersion || 0,
      type: "refresh",
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

const buildSigninResponse = (user, roleNames) => {
  ensureJwtSecrets();
  const accessToken = signAccessToken(user, roleNames);
  const refreshToken = signRefreshToken(user, roleNames);

  return {
    code: 200,
    error: false,
    message: "signin successful",
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      roles: roleNames,
    },
  };
};

const signinByRequiredRole = async (req, res, requiredRole) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return res.status(401).json({
        error: true,
        code: 401,
        message: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        error: true,
        code: 401,
        message: "Invalid email or password",
      });
    }

    const roleNames = user.userRoles.map((userRole) => userRole.role.name);

    if (!roleNames.includes(requiredRole)) {
      return res.status(403).json({
        error: true,
        code: 403,
        message: `Access denied. ${requiredRole} role required`,
      });
    }

    return res.status(200).json(buildSigninResponse(user, roleNames));
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//singup
// const generateTokens = (user, roleNames) => {
//   const accessToken = jwt.sign(
//     { id: user.id, roles: roleNames },
//     process.env.ACCESS_TOKEN_JWT_SECRET,
//     { expiresIn: "1h" }
//   );

//const refreshToken = jwt.sign(
//     {
//       id: user.id,
//       roles: roleNames,
//     },
//     process.env.REFRESH_TOKEN_JWT_SECRET,
//     { expiresIn: "7d" }
//   );
//   return { accessToken, refreshToken };
// };

//signup
const signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      role,
      age,
      gender,
      phoneNumber,
    } = req.body;
    // if (role === "player") {
    //   const clubs = await Club.findAll();
    //   if (clubs.length === 0) {
    //     return res.status(400).json({
    //       code: 400,
    //       error: false,
    //       message: "we are sorry.No Clubs available now try to come again!",
    //     });
    //   }
    // }

    const roleRecord = await Role.findOne({ where: { name: role } });

    let user = await User.findOne({ where: { email: email } });

    /* checking if user exists means 
    we have to check role is already their or not 
    if not assign new role to user*/
    if (user) {
      // if (!user.isVerified) {
      //   return res.status(403).json({
      //     error: true,
      //     code: 403,
      //     message:
      //       "User exists but is not verified.Please verify your email first.",
      //   });
      // }

      const hasRole = await UserRole.findOne({
        where: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      if (hasRole) {
        return res.status(400).json({
          code: 400,
          error: true,
          message: `user already registered with role ${role}`,
        });
      }

      await UserRole.create({
        userId: user.id,
        roleId: roleRecord.id,
      });

      const roles = await user.getRoles();

      const roleNames = roles.map((role) => role.name);

      // const { accessToken, refreshToken } = generateTokens(user, roleNames);

      // user.refreshToken = refreshToken;

      // await user.save();

      const accessToken = jwt.sign(
        {
          id: user.id,
          roles: roleNames,
          tokenVersion: user.tokenVersion || 0,
          isVerified: user.isVerified,
        },
        process.env.ACCESS_TOKEN_JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        code: 201,
        error: false,
        message: `user successfully registered as ${role}`,
        accessToken: accessToken,
        firstname: user.firstname,
        roles: roleNames,
      });
    } else {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      const verificationToken = crypto.randomBytes(32).toString("hex");

      const EXPIRATION_TIME_MS = 24 * 60 * 60 * 1000; // 24 hours
      const expiresAt = new Date(Date.now() + EXPIRATION_TIME_MS);

      user = await User.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashedPassword,
        age: age,
        phoneNumber,
        gender: gender,
        isVerified: false,
        verificationToken: verificationToken,
        accountExpiresAt: expiresAt,
      });

      await UserRole.create({
        userId: user.id,
        roleId: roleRecord.id,
      });

      const verificationUrl = `${process.env.SERVER_BASE_URL}/auth/verify-email?token=${verificationToken}&role=${role}`;

      // const sqsJob = {
      //   jobType: "verification",
      //   firstname: user.firstname,
      //   email: user.email,
      //   url: verificationUrl,
      // };
      // const command = new SendMessageCommand({
      //   QueueUrl: process.env.EMAIL_QUEUE_URL,
      //   MessageBody: JSON.stringify(sqsJob),
      // });
      // await sqsClient.send(command);

      const roles = await user.getRoles();

      const roleNames = roles.map((role) => role.name);

      // const { accessToken, refreshToken } = generateTokens(user, roleNames);

      // user.refreshToken = refreshToken;

      // await user.save();

      const accessToken = jwt.sign(
        {
          id: user.id,
          roles: roleNames,
          tokenVersion: user.tokenVersion || 0,
          isVerified: user.isVerified,
          expiresAt: user.accountExpiresAt,
        },
        process.env.ACCESS_TOKEN_JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(201).json({
        code: 201,
        error: false,
        message: `user successfully registered as ${role}`,
        accessToken: accessToken,
        firstname: user.firstname,
        roles: roleNames,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//verify email
const verifyEmail = async (req, res) => {
  try {
    const { token, role } = req.query;

    console.log(token);

    if (!token) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "verification token is missing",
      });
    }

    const user = await User.findOne({
      where: { verificationToken: token },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Invalid or expired token",
      });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.accountExpiresAt = null;
    await user.save();

    const accessToken = jwt.sign(
      {
        id: user.id,
        tokenVersion: user.tokenVersion || 0,
        isVerified: true,
        expiresAt: user.accountExpiresAt,
      },
      process.env.ACCESS_TOKEN_JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 6. Send a success response
    // Your frontend can now use this token to log the user in
    if (role === "player") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/playerdashboard?isVerified=true&token=${accessToken}`
      );
    } else if (role === "host") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard?isVerified=true&token=${accessToken}`
      );
    }
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "user doesn't found try to singup",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "user doesnt have option to login with password",
      });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "invalid credentials",
      });
    }

    // if (!user.isVerified) {
    //   return res.status(403).json({
    //     error: true,
    //     code: 403,
    //     message: "Please verify your email address before logging in.",
    //   });
    // }

    const roles = await user.getRoles();

    const roleNames = roles.map((role) => role.name);

    if (role && !roleNames.includes(role)) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: `User exists but not registered as ${role}. Please sign up as ${role}`,
      });
    }

    //  const { accessToken, refreshToken } = generateTokens(user, roleNames);

    // user.refreshToken = refreshToken;

    // await user.save();

    const accessToken = jwt.sign(
      {
        id: user.id,
        roles: roleNames,
        tokenVersion: user.tokenVersion || 0,
        isVerified: user.isVerified,
        expiresAt: user.accountExpiresAt,
      },
      process.env.ACCESS_TOKEN_JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      code: 201,
      error: false,
      accessToken: accessToken,
      // refreshToken: refreshToken,
      firstname: user.firstname,
      message: "user login successfully",
      roles: roleNames,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const organizerSignin = async (req, res) =>
  signinByRequiredRole(req, res, "organizer");

const adminSignin = async (req, res) =>
  signinByRequiredRole(req, res, "super_admin");

const organizerLogout = async (req, res) => {
  try {
    await User.increment("tokenVersion", {
      by: 1,
      where: { id: req.user.id },
    });

    return res.status(200).json({
      code: 200,
      error: false,
      message: "logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//resend email for verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({ where: { email: email } });

    //  User not found
    if (!user) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "User with this email not found. Please sign up.",
      });
    }

    //  User is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "This account is already verified. You can log in.",
      });
    }

    // generating new token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // creating the new verification URL
    const verificationUrl = `${process.env.SERVER_BASE_URL}/api/auth/verify-email?token=${verificationToken}`;

    // const sqsJob = {
    //   jobType: "verification",
    //   firstname: user.firstname,
    //   email: user.email,
    //   url: verificationUrl,
    // };
    // const command = new SendMessageCommand({
    //   QueueUrl: process.env.EMAIL_QUEUE_URL,
    //   MessageBody: JSON.stringify(sqsJob),
    // });
    // await sqsClient.send(command);
    res.status(200).json({
      code: 200,
      error: false,
      message: `A new verification email has been sent to ${user.email}.`,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(200).json({
        error: false,
        code: 200,
        message:
          "If an account with that email exists, a reset code has been sent.",
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    user.passwordResetToken = hashedCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes
    await user.save();

    // const sqsJob = {
    //   jobType: "passwordReset",
    //   email: user.email,
    //   firstname: user.firstname,
    //   code: resetCode,
    // };
    // const command = new SendMessageCommand({
    //   QueueUrl: process.env.EMAIL_QUEUE_URL,
    //   MessageBody: JSON.stringify(sqsJob),
    // });
    // await sqsClient.send(command);

    res.status(200).json({
      error: false,
      code: 200,
      message: "A 6-digit code has been sent to your email.",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//resetcode verification
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
        passwordResetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user || !user.passwordResetToken) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "Code has expired or invalid.Please click Resend Verification",
      });
    }

    const isCodeValid = await bcrypt.compare(code, user.passwordResetToken);

    if (!isCodeValid) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Invalid Verification Code.",
      });
    }

    const resetTicket = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetTicket;
    user.passwordResetExpires = Date.now() + 5 * 60 * 1000; //5 minutes
    await user.save();

    res.status(200).json({
      error: false,
      code: 200,
      resetTicket: resetTicket,
      message: "code verified.you can reset your password.",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//reset password
const resetPassword = async (req, res) => {
  try {
    const { resetTicket, password } = req.body;

    if (!resetTicket || !password) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "resetTicket and password are required!",
      });
    }

    const user = await User.findOne({
      where: {
        passwordResetToken: resetTicket,
        passwordResetExpires: { [Op.gt]: Date.now() },
      },
    });

    if (!user) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Reset session is invalid or has expired. Please try again.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      error: false,
      code: 200,
      message: "Password has been reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//updating user
const completeProfile = async (req, res) => {
  try {
    const { gender, age, phoneNumber } = req.body;

    if (!gender || !age) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Gender and birthday are required",
      });
    }

    await User.update(
      { gender, age, phoneNumber },
      { where: { id: req.user.id } }
    );

    const updatedUser = await User.findByPk(req.user.id);

    res.status(200).json({
      code: 200,
      error: false,
      message: "Profile completed successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
};

//identifying role
const identifyingRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, email } = req.user;
    const user = await User.findOne({ where: { id, email } });
    if (user) {
      const roleRecord = await Role.findOne({ where: { name: role } });
      if (!roleRecord) {
        return res.status(400).json({
          code: 400,
          error: true,
          message: "Role does not exist!",
        });
      }

      const hasRole = await UserRole.findOne({
        where: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      if (!hasRole) {
        return res.status(200).json({
          error: false,
          code: 200,
          message: `Try to Register as ${role}`,
        });
      }

      return res.status(201).json({
        error: false,
        message: `user already registered with ${role}`,
        code: 201,
      });
    }

    res.status(400).json({
      code: 400,
      error: true,
      message: "user not found!",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 500,
    });
  }
};

//register role
const registerRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id, email } = req.user;
    const user = await User.findOne({ where: { id, email } });
    const roleRecord = await Role.findOne({ where: { name: role } });
    if (user) {
      const hasRole = await UserRole.findOne({
        where: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });

      if (hasRole) {
        return res.status(400).json({
          error: true,
          message: `user already registered with ${role}`,
          code: 400,
        });
      }

      await UserRole.create({
        userId: user.id,
        roleId: roleRecord.id,
      });

      const roles = await user.getRoles();

      const roleNames = roles.map((r) => r.name);

      const accessToken = jwt.sign(
        {
          id: user.id,
          roles: roleNames,
          tokenVersion: user.tokenVersion || 0,
        },
        process.env.ACCESS_TOKEN_JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(201).json({
        error: false,
        code: 201,
        accessToken,
        message: `user registered for role ${role}`,
      });
    }

    res.status(400).json({
      code: 400,
      error: true,
      message: "user not found!",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 500,
    });
  }
};

//verify role
const verifyingRole = async (req, res) => {
  try {
    res.status(200).json({
      error: false,
      code: 200,
      message: "host can navigate",
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: error.message,
      code: 500,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "User not found",
      });
    }

    const roles = await user.getRoles();
    const roleNames = roles.map((role) => role.name);

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Current user fetched",
      data: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        gender: user.gender,
        roles: roleNames,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default {
  signup,
  login,
  organizerSignin,
  adminSignin,
  organizerLogout,
  completeProfile,
  identifyingRole,
  registerRole,
  verifyingRole,
  verifyEmail,
  resendVerification,
  resetPassword,
  verifyResetCode,
  forgotPassword,
  getCurrentUser,
};
