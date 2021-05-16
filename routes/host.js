const router = require("express").Router();
const verifyToken = require("../auth/verifyToken");
const UserModel = require("../models/user.model");
const Listing = require("../models/new_listings.model");
const multer = require("multer");
var path = require("path");
const { nanoid } = require("nanoid");

//Setting multer to save on disk
const storage = multer.diskStorage({
  destination: ".public/listings",
  filename: function (req, file, cb) {
    cb(null, nanoid() + path.extname(file.originalname));
  },
});

//Filter only image mimetypes
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const acceptedMimeTypes = [
      "image/bmp",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (acceptedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

//Middleware that accepts request made only from validated hosts
router.all("*", verifyToken, async (req, res, next) => {
  const host = await UserModel.findOne({ _id: res.locals.token.id });
  if (res.locals.token.role === 2 && host.pending === false) {
    next();
  } else {
    res.status(403).json("Current user is not a validated host");
  }
});

//Endpoint that enables validated hosts to make a new listing
router.put("/newlisting", upload.array("images", 5), async (req, res) => {
  try {
    //Store listing image paths to be stored in the database
    const pathArray = req.files.map((elem) => elem.path);
    const location = { type: "Point", coordinates: req.body.coordinates };
    await Listing.create({
      accommodates: req.body.accommodates,
      amenity_array: req.body.amenity_array,
      available_dates: req.body.available_dates,
      bathrooms: req.body.bathrooms,
      bed_type: req.body.bed_type,
      bedrooms: req.body.bedrooms,
      beds: req.body.beds,
      city: req.body.city,
      country: req.body.country,
      description: req.body.description,
      location: location,
      name: req.body.name,
      neighbourhood: req.body.neighbourhood,
      price: req.body.price,
      property_type: req.body.property_type,
      square_meters: req.body.square_meters,
      street: req.body.street,
      images: pathArray,
    });

    return res.status(201).json({
      message: "New Listing Created",
    });
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

module.exports = router;
