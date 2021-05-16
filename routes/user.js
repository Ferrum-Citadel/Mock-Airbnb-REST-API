const router = require("express").Router();
const verifyToken = require("../auth/verifyToken");
const UserModel = require("../models/user.model");
const Listing = require("../models/listing.model");
const { nanoid } = require("nanoid");

//Endpoint that returns the info of the currently logged in user
router.get("/info", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(res.locals.token.id).lean().exec();
    if (user) {
      console.log("Token is valid and permission is granted for user");
      res.status(200).json({
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        user_photo_url: user.user_photo_url,
        role: user.role,
        pending: user.pending,
      });
    } else {
      res.status(403).json("Try logging in again");
    }
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

//Endpoint for updating a logged user's info
router.put("/info", verifyToken, async (req, res) => {
  const newInfo = req.body;
  try {
    await UserModel.findOneAndUpdate({ _id: res.locals.token.id }, newInfo, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    })

      .lean()

      .exec();
    res.status(200).send();
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

//Endpoint that provides info about any user id to admins and logged in users with the corresponding id
router.get("/:userID", verifyToken, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userID).lean().exec();
    if (user) {
      //Access is granted only for authenticated user with that id or an admin
      if (
        res.locals.token.id === user._id.toString() ||
        res.locals.token.role === 3
      ) {
        console.log("Token is valid and permission is granted for user");
        res.status(200).json({
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          username: user.username,
          phoneNumber: user.phoneNumber,
          user_photo_url: user.user_photo_url,
          role: user.role,
          pending: user.pending,
        });
      } else {
        res.status(403).json("No permission to access this resource");
      }
    } else {
      res.status(404).json("No user with such id found");
    }
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

/*Request body example: 

{
  "listing_id": 45345098045,
  "dates": ["2015-07-20","2015-07-21", "2015-07-22"]
}
*/
router.post("/booking", verifyToken, async (req, res) => {
  try {
    const listing_id = req.body.listing_id;
    const dates = req.body.dates;
    const nDates = dates.map((date) => {
      date = { date: date };
      return date;
    });

    const user = await UserModel.findOne({
      _id: res.locals.token.id,
      bookings: { listing_id: listing_id, dates: dates },
    })
      .lean()
      .exec();
    console.log(user);
    if (!user) {
      const listing = await Listing.findOne({
        listing_id: listing_id,
        available_dates: { $all: nDates },
      })
        .lean()
        .exec();

      //If the given listing exists and the dates are available proceed
      if (listing) {
        //Insert booking info to user's profile
        await UserModel.findOneAndUpdate(
          { _id: res.locals.token.id },
          {
            $addToSet: { bookings: { listing_id: listing_id, dates: dates } },
          }
        ).exec();
        //Remove the booked dates from the listing's available dates
        const nlisting = await Listing.findOneAndUpdate(
          { listing_id: listing_id },
          { $pullAll: { available_dates: nDates } },
          { new: true }
        )
          .lean()
          .exec();
        res.status(200).json("New booking created");
      } else {
        res.status(400).json("Invalid listing_id or unavailable dates");
      }
    } else {
      res.status(404).json("The given booking already exists");
    }
  } catch (err) {
    console.error(err);
    res.json(err.toString());
  }
});

//Endpoint for logged in users to add new Reviews using the lisitng's id
router.post("/review/:listingID", verifyToken, async (req, res) => {
  try {
    //Checking if the given listingID corresponds to an existing listing
    const givenListing = await Listing.findById(req.params.listingID)
      .lean()
      .exec();
    if (givenListing) {
      //Getting current date in YYYY-MM-DD format
      let curDate = new Date();
      curDate = curDate.toISOString().slice(0, 10);
      //Getting reviewer name
      const reviewer = await UserModel.findById(res.locals.token.id)
        .lean()
        .exec();
      //constructing the review to be added
      const newRev = {
        id: nanoid(10),
        date: curDate,
        reviewer_name: reviewer.firstName,
        comments: req.body.comments,
        rating: req.body.rating,
      };
      console.log(newRev);
      //Adding new review to the given listing by the logged in user
      const newListing = await Listing.findOneAndUpdate(
        { _id: req.params.listingID },
        { $inc: { number_of_reviews: 1 }, $addToSet: { reviews: newRev } },
        { new: true }
      )
        .lean()
        .exec();

      console.log(newListing);
      res
        .status(201)
        .json(
          "A new review waw created for the listing with id: " +
            req.params.listingID
        );
    } else {
      res.status(404).json("No listing corresponds to the given id");
    }
  } catch (err) {
    console.error(err);
    res.status(500).json(err.toString());
  }
});

module.exports = router;
