const jwt = require("jsonwebtoken");

//Middleware for spotting unlogged users, corrupt cookies and decoding jwt tokens inside the valid ones
const verifyToken = (req, res, next) => {
  const token = req.signedCookies.jwtCookie;
  try {
    if (token === undefined) {
      return res.status(401).json("Login required for this action");
    } else if (token === false) {
      res.clearCookie("jwtCookie", token, {
        sameSite: "strict",
        signed: true,
        maxAge: 0,
        secure: true,
        httpOnly: true,
      });
      console.log("Corrupt cookie spotted and cleared");
      return res.status(400).json("Corrupt cookie");
    }
    jwt.verify(token, process.env.jwtSecret, (err, decoded) => {
      if (err) return res.status(400).json(err.toString());
      res.locals.token = decoded;
      res.locals.cookie = next();
    });
  } catch (err) {
    return res.status(400).json(err.toString());
  }
};

module.exports = verifyToken;
