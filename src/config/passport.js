import passport from "passport";

import { Strategy as googleStrategy } from "passport-google-oauth20";

import { Strategy as facebookStrategy } from "passport-facebook";

import AppleStrategy from "passport-apple";

import models from "../models/Associations.js";

import jwt from "jsonwebtoken";

import Club from "../models/Club.js";
import { Error } from "sequelize";

const { Role, User, UserRole } = models;

//helper function for accessing player for signup
const canPlayersSignUp = async () => {
  const club = await Club.findOne();
  return !!club;
};

//helper function for calculating age
const calculateAge = (birthday) => {
  if (!birthday) return null;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const handleSignUpAndLogin = async ({ provider, role, profile }) => {
  const roleBased = await Role.findOne({
    where: {
      name: role,
    },
  });

  let user = await User.findOne({
    where: { provider: provider, providerId: profile.id },
  });

  /*if user doesnt exists means checking role
  if role player means checking access
  if have access means creating new user not means sending error
  if role not player means creating Host user
  Then checking role exists or not if exists means assigning new role
  not means creating new role
  */

  //if not user means

  if (!user) {
    //checking role
    //player means
    if (role === "player") {
      //checking access
      const allowed = await canPlayersSignUp();
      if (!allowed) {
        //not access means sending error
        throw new Error("sorry!clubs not availble");
      }
    }
    // have access means or host means creating new user
    user = await User.create({
      firstname:
        profile.name?.givenName ||
        profile.name?.firstName ||
        profile.name?.first_name ||
        "",
      lastname:
        profile.name?.familyName ||
        profile.name?.lastName ||
        profile.name?.last_name ||
        "",
      email: profile.emails?.[0]?.value || profile.email || null,
      provider,
      providerId: profile.id,
      profilePicture: profile.photos?.[0]?.value || profile.picture || null,
      gender: profile.gender || null,
      age: profile.birthday ? calculateAge(profile.birthday) : null,
    });
  }

  //if user exists means  or after creating user
  const existingRole = await UserRole.findOne({
    // checking exisiting role or not
    where: {
      userId: user.id,
      roleId: roleBased.id,
    },
  });

  //if not existing role means assiging new role
  if (!existingRole) {
    await UserRole.create({
      userId: user.id,
      roleId: roleBased.id,
    });
  }

  const roles = await user.getRoles();

  const roleNames = roles.map((role) => role.name);

  const token = jwt.sign(
    { id: user.id, roles: roleNames },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, roles: roleNames, user };
};

// passport.use(
//   new googleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback",
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         // frontend MUST send ?state=role=host or ?state=role=player
//         const role = req.query.state?.split("=")[1];
//         if (!role) throw new Error("Role is required in state");

//         const googleProfile = {
//           id: profile.id,
//           email: profile.emails?.[0]?.value,
//           name: profile.name,
//           photos: profile.photos,
//         };

//         const { user, roles, token } = await handleSignUpAndLogin({
//           profile: googleProfile,
//           provider: "google",
//           role,
//         });

//         done(null, { user, roles, token });
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

// passport.use(
//   new facebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//       callbackURL: "/auth/facebook/callback",
//       profileFields: ["id", "emails", "name", "photos", "gender", "birthday"],
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, profile, done) => {
//       try {
//         const role = req.query.state?.split("=")[1];
//         if (!role) throw new Error("Role is required in state");

//         const fbProfile = {
//           id: profile.id,
//           email: profile.emails?.[0]?.value,
//           name: profile.name,
//           gender: profile.gender,
//           birthday: profile.birthday,
//           photos: profile.photos,
//         };

//         const { user, roles, token } = await handleSignUpAndLogin({
//           profile: fbProfile,
//           provider: "facebook",
//           role,
//         });

//         done(null, { user, roles, token });
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

// passport.use(
//   new AppleStrategy(
//     {
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_TEAM_ID,
//       keyID: process.env.APPLE_KEY_ID,
//       privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
//       callbackURL: "/auth/apple/callback",
//       scope: ["name", "email"],
//       passReqToCallback: true,
//     },
//     async (req, accessToken, refreshToken, decodedIdToken, profile, done) => {
//       try {
//         const role = req.query.state?.split("=")[1];
//         if (!role) throw new Error("Role is required in state");

//         const appleProfile = {
//           id: decodedIdToken.sub,
//           email: decodedIdToken.email,
//           name: profile?.name || {},
//         };

//         const { user, roles, token } = await handleSignUpAndLogin({
//           profile: appleProfile,
//           provider: "apple",
//           role,
//         });

//         done(null, { user, roles, token });
//       } catch (err) {
//         done(err, null);
//       }
//     }
//   )
// );

export default passport;
