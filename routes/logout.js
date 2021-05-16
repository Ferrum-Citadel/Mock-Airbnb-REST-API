const router = require("express").Router();
const jwt = require("jsonwebtoken");
const verifyToken = require("../auth/verifyToken");

//TODO * Use fetch('logout'), {method: 'POST', credentials: 'same-origin' }) in frontend
//TODO * Redirect the user with react-router to the home page

router.post("/", verifyToken, async (req, res) => {
  try {
    res.clearCookie("jwtCookie", "", {
      sameSite: "strict",
      signed: true,
      maxAge: 0,
      secure: true,
      httpOnly: true,
    });
    console.log("Cookie cleared and user logged out");
    res.status(303).json("User successfully logged out");
  } catch (err) {
    res.status(500).json(err.toString());
  }
});

module.exports = router;
