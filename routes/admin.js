const router = require("express").Router();
const verifyToken = require("../auth/verifyToken");
const UserModel = require("../models/user.model");
const Listing = require("../models/listing.model");
const jsonxml = require("jsontoxml");

//Handler that returns all user data in JSON or XML format
router.get("/allusers/:format", verifyToken, async (req, res) => {
  try {
    //Check for admin privillages
    if (res.locals.token.role === 3) {
      //Returns all  users
      var users = await UserModel.find({}).exec();
      //Check for the requested format and handle accordingly
      if (req.params.format === "json") return res.status(200).json(users);
      else if (req.params.format === "xml") {
        res.set("Content-Type", "application/xml");
        //Converting each document to an object and removing the _id field
        var n_users = users.map((user) => {
          return user.toObject({
            transform: (doc, ret, options) => {
              delete ret._id;
              ret = { user: ret };
              return ret;
            },
          });
        });
        //Parent field that will become the xml root element
        n_users = { users: n_users };
        const xml = jsonxml(n_users, { indent: " ", xmlHeader: true });
        return res.status(200).send(xml);
      } else {
        res.status(400).json("The format can be either JSON or XML");
      }
    } else {
      res.status(403).json("No permission to access this resource");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.toString());
  }
});

//Returns all listing in JSON or XML format
router.get("/listings/:format", verifyToken, async (req, res) => {
  try {
    //Check for admin privillages
    if (res.locals.token.role === 3) {
      const projection = {
        _id: 0,
        available_dates: 0,
        reviews: 0,
      };
      //Returns all  users
      var listings = await Listing.find({}, projection).exec();
      //Check for the requested format and handle accordingly
      if (req.params.format === "json") return res.status(200).json(listings);
      else if (req.params.format === "xml") {
        res.set("Content-Type", "application/xml");
        //Converting each document to an object and removing the _id field
        var n_listings = listings.map((listing) => {
          listing = listing.toObject();
          return (listing = { listing: listing });
        });
        //Parent field that will become the xml root element
        n_listings = { listings: n_listings };
        const xml = jsonxml(n_listings, { indent: " ", xmlHeader: true });
        return res.status(200).send(xml);
      }
    } else {
      res.status(403).json("No permission to access this resource");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.toString());
  }
});

//Handler that returns host that require admin validation
router.get("/pendinghosts", verifyToken, async (req, res) => {
  try {
    //Check for admin privillages
    if (res.locals.token.role === 3) {
      const pending_hosts = await UserModel.find({ pending: true }).exec();

      //If we find pending host we return them or else we handle errors
      if (pending_hosts) {
        res.status(200).json(pending_hosts);
      } else {
        res.status(404).json("No pending hosts found");
      }
    } else {
      res.status(403).json("No permission to access this resource");
    }
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

//Validates pending hosts
router.patch("/validatehost/:userID", verifyToken, async (req, res) => {
  try {
    const host = await UserModel.findById(req.params.userID).exec();
    if (host && host.role === 2 && res.locals.token.role === 3) {
      if (host.pending === true) {
        await UserModel.findByIdAndUpdate(req.params.userID, {
          pending: false,
        }).exec();
        res.status(200).send("Host is validated");
      } else {
        res.status(400).json("The given host is already validated");
      }
    } else {
      res
        .status(400)
        .json(
          "The given id does not correspond to a host or you have no access rights on this resource"
        );
    }
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

router.get("/");

module.exports = router;
