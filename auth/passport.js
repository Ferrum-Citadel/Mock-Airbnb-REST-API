const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

const BCRYPT_SALT_ROUNDS = 12;

passport.use(
  "register",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
      session: false,
    },
    async (req, username, password, done) => {
      try {
        //Pulling user data from request body
        var email = req.body.email;
        var phoneNumber = req.body.phoneNumber;
        var user_photo_url = req.body.user_photo_url;
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var role = req.body.role;
        var pendingState;
        //If the new user is a host, they have to wait for admin validation
        if (role === 2) {
          pendingState = true;
        } else {
          pendingState = undefined;
        }
        //Parallel calls to find already existing user data
        const responses = ([
          usernameMatch,
          emailMatch,
          phoneMatch,
        ] = await Promise.all([
          UserModel.findOne({
            username: username,
          }).exec(),
          UserModel.findOne({
            email: email,
          }).exec(),
          UserModel.findOne({
            phoneNumber: phoneNumber,
          }).exec(),
        ]));
        //Checking for already existing user data
        if (usernameMatch) {
          return done(null, false, {
            message: "Username already in use",
          });
        } else if (emailMatch) {
          return done(null, false, {
            message: "Email address already in use",
          });
        } else if (phoneMatch) {
          return done(null, false, {
            message: "Phone number already in use",
          });
        } else {
          //Hash salt the password and then save everything into the database
          const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
          const user = await UserModel.create({
            username: username,
            hashedPassword: hash,
            email: email,
            phoneNumber: phoneNumber,
            user_photo_url: user_photo_url,
            firstName: firstName,
            lastName: lastName,
            role: role,
            pending: pendingState,
          });
          console.log("user created");
          return done(null, user);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);

passport.use(
  "Login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      try {
        //Searching for existing registered user
        const user = await UserModel.findOne({
          username: username,
        }).exec();
        if (!user) {
          return done(null, false, {
            message: "Wrong username",
          });
        } else {
          //Checking if the given password is correct
          const compare = await bcrypt.compare(password, user.hashedPassword);
          if (!compare) {
            return done(null, false, {
              message: "Wrong password",
            });
          }
          //Signing JWT token to be sent to the user
          const token = jwt.sign(
            {
              id: user._id,
              username: username,
              role: user.role,
            },
            process.env.jwtSecret,
            {
              expiresIn: "3h",
            }
          );
          console.log("User found and authenticated");
          return done(null, token);
        }
      } catch (err) {
        done(err);
      }
    }
  )
);
