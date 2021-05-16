const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

//Middleware sub-stack for checking if a user is already logged in"
router.use("/", async (req, res, next) => {
  const token = req.signedCookies.jwtCookie;
  try {
    if (token !== undefined && token !== false) {
      await jwt.verify(token, process.env.jwtSecret);
      //In case the user is already logged in
      return res.status(200).json("user already logged in");
    } else if (token === false) {
      res.clearCookie("jwtCookie", "", { expires: Date.now() });
      console.log("cleared corrupt cookie");
      return res.status(400).json({
        message: "Corrupt cookie, try logging in again",
      });
    } else {
      next();
    }
  } catch (err) {
    return res.status(400).json(err.toString());
  }
});

//Handler for "domain/login/"
router.post("/", (req, res) => {
  passport.authenticate("Login", (err, token, info) => {
    if (err) {
      console.log(err);
      res.status(401).json(err);
    }
    if (info != undefined) {
      console.log(info.message);
      res.status(403).json(info.message);
    } else {
      //Returns jwt token inside secure cookie that expires after 1 hour
      res
        .status(200)
        .cookie("jwtCookie", token, {
          sameSite: "strict",
          signed: true,
          maxAge: 10800000,
          secure: true,
          httpOnly: true,
        })
        .json("User athenticated and logged in");
    }
  })(req, res);
});

module.exports = router;
