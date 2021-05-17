const express = require("express");
// TODO DECIDE IF WE NEED
const cors = require("cors"); //Cross-Origin resource sharing
const mongoose = require("mongoose");
const https = require("https");
const fs = require("fs");
const path = require("path");
const helmet = require("helmet");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const cookieEncrypter = require("cookie-encrypter");
const mongoSanitize = require("express-mongo-sanitize");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//When deployed behind reverse proxy
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

//app.use(cors());
app.use(express.json());
app.use(helmet()); //Sets HTTP headers to combat common well-known web vulnerabilities
app.use(passport.initialize());
app.use(cookieParser(process.env.cookieSecret));
app.use(cookieEncrypter(process.env.cookieAESsecret));
app.use(mongoSanitize()); //Stripts requests from characters that can be used maliciously with mongoDB

//Mongodb connection using ATLAS cloud services
const uri = process.env.ATLAS_URI;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false, //FindAndModify is deprecated
  })
  .catch((error) => console.error("Mongo Error:" + error));
const connection = mongoose.Connection;
console.log("Mongodb ready state:" + mongoose.connection.readyState);

//!For production deployment with react frontend set NODE_ENV = production, npm start build  and set port=5000 in the .env file
if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "../frontend/react-app/build"))); // Handle React routing, return all requests to React app
  app.get("*", function (req, res) {
    res.sendFile(
      path.join(__dirname, "../frontend/react-app/build", "Index.html")
    );
  });
}

//Importing Passport js strategies
require("./auth/passport");
//Importing endpoints
const registerRouter = require("./routes/register");
const loginRouter = require("./routes/login");
const logoutRouter = require("./routes/logout");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const searchRouter = require("./routes/search");
const hostRouter = require("./routes/host");

//Using endpoints("routes")
app.use("/register", registerRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/search", searchRouter);
app.use("/host", hostRouter);

//*Uncommend for ssl verification
// app.use(express.static(__dirname, { dotfiles: 'allow' } ));

//*HTTPS connection using let's encrypt signed certificate
//*Generated stronger Diffie-Hellman parameters
https
  .createServer(
    {
      key: fs.readFileSync(process.env.KEYPATH),
      cert: fs.readFileSync(process.env.FULLCHAIN),
      dhparam: fs.readFileSync(process.env.DHPARAM),
      honorCipherOrder: true,
      ecdhCurve: "auto",
    },
    app
  )
  .listen(port, (err) => {
    if (err) {
      throw err;
    }
    console.log("Server is running on port:" + port);
  });
