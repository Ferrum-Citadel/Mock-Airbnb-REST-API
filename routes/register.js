const router = require("express").Router();
const passport = require("passport");
const UserModel = require("../models/user.model");

router.post("/", (req, res) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) {
      res.status(401).send(err);
    }
    if (info) {
      console.log(info.message);
      res.status(400).json(info.message);
    } else {
      res.status(201).json("User Created");
    }
  })(req, res);
});

module.exports = router;
