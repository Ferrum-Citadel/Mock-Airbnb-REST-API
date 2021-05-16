const router = require("express").Router();
const User = require("../models/user.model");
const Listing = require("../models/listing.model");
const Calendar = require("../models/calendar.model");
const listing = require("../models/listing.model");
const assert = require("assert");

//Returns all distinct neighbourhoods present in the lisitngs collection
router.get("/neighbourhoods", (req, res) => {
  Listing.distinct("neighbourhood_cleansed", (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).json(results);
    }
  });
});

//Returns all distinct property_types present in the lisitngs collection
router.get("/property-type", (req, res) => {
  Listing.distinct("property_type", (error, results) => {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).json(results);
    }
  });
});

/*Endpoint that returns a basic or complete search of listings.
Takes "pageNum" as parameter to return paginated results.
Example request body:
{
  "pageNum": 1,                   // Page number of results, each page contains PAGE_SIZE number of listings
    "neighbourhood": "ΚΟΛΩΝΑΚΙ",  // Optional          
    "type": "Apartment",          // Optional
    "maxcost": 160,               // Optional
    "guestNum": 3,                // Necessary
    "amenities": ["TV", "Wireless Internet", "Heating"],   // Optional
    "dates": ["2015-07-20","2015-07-21", "2015-07-22"]    // Necessary
}
*/
router.post("/", async (req, res) => {
  //Pagination params
  const PAGE_SIZE = 10;
  const pageNum = req.body.pageNum;
  assert(pageNum > 0);
  const skip = (pageNum - 1) * PAGE_SIZE;

  //Query params
  const neighbourhood = req.body.neighbourhood;
  const type = req.body.type;
  const maxcost = req.body.maxcost; //Ranges from 10-720
  var dates = req.body.dates; //Range from 2015-07-17 to 2016-07-16
  const guestNum = req.body.guestNum; //Available persons to acoommodate range form 1-20
  const amenities = req.body.amenities;

  try {
    dates = dates.map((date) => {
      date = { date: date };
      return date;
    });

    const query = {
      neighbourhood_cleansed: neighbourhood,
      property_type: type,
      price: { $lte: maxcost },
      accommodates: { $gte: guestNum },
      amenity_array: { $all: amenities },
      available_dates: { $all: dates },
    };

    //The fields of the found listings that will actually be returned to the user
    const projection = {
      thumbnail_url: 1,
      price: 1,
      property_type: 1,
      beds: 1,
      number_of_reviews: 1,
      review_scores_rating: 1,
      street: 1,
      name: 1,
      "reviews.date": 1,
      "reviews.comments": 1,
    };
    //Removing unspecified fields from query
    if (type === undefined) delete query.property_type;
    if (maxcost === undefined) delete query.price;
    if (neighbourhood === undefined) delete query.neighbourhood_cleansed;
    if (amenities === undefined) delete query.amenity_array;
    //Limits to 100 results or 10 pages of 10 listings each
    var searchRes = await Listing.find(query, projection)
      .lean()
      .skip(skip)
      .limit(PAGE_SIZE)
      .exec();
    res
      .status(200)
      .json({ Num_of_listings: searchRes.length, listings: searchRes });
  } catch (err) {
    console.error(err);
    res.status(400).json(err.toString());
  }
});
module.exports = router;
