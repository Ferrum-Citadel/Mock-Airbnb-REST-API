const mongoose = require("mongoose");
const reviewSchema = require("./review.model").schema;
//Using pre-existing collection

//Code from user https://stackoverflow.com/users/9613733/enesn
//The range from 2015-07-17 to 2016-07-16 is the default range of available dates for every new listing
var getDaysArray = function (start, end) {
  for (
    var arr = [], dt = new Date(start);
    dt <= end;
    dt.setDate(dt.getDate() + 1)
  ) {
    arr.push(new Date(dt));
  }
  return arr;
};

var dayList = getDaysArray(new Date("2015-07-17"), new Date("2016-07-16"));
dayList = dayList.map((v) => v.toISOString().slice(0, 10));
//------------------

const newlistingSchema = new mongoose.Schema(
  {
    accommodates: {
      type: Number,
      required: true,
      min: 1,
    },
    amenity_array: {
      type: [String],
      required: true,
    },
    available_dates: {
      type: [String],
      default: dayList,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    bed_type: {
      type: String,
      required: true,
      enum: ["Couch", "Futon", "Pull-out Sofa", "Real Bed"],
    },
    bedrooms: {
      type: Number,
      required: true,
      min: 1,
    },
    beds: {
      type: Number,
      required: true,
      min: 1,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: "Athens",
    },
    country: {
      type: String,
      required: true,
      default: "Greece",
    },
    description: {
      type: String,
      required: true,
      minlength: 15,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    name: {
      type: String,
      required: true,
      minlength: 5,
    },
    neighbourhood: {
      type: String,
      required: true,
      enum: [
        "1Ο ΝΕΚΡΟΤΑΦΕΙΟ",
        "ΑΓΙΟΣ ΕΛΕΥΘΕΡΙΟΣ",
        "ΑΓΙΟΣ ΚΩΝΣΤΑΝΤΙΝΟΣ-ΠΛΑΤΕΙΑ ΒΑΘΗΣ",
        "ΑΓΙΟΣ ΝΙΚΟΛΑΟΣ",
        "ΑΚΑΔΗΜΙΑ ΠΛΑΤΩΝΟΣ",
        "ΑΚΡΟΠΟΛΗ",
        "ΑΜΠΕΛΟΚΗΠΟΙ",
        "ΑΝΩ ΚΥΨΕΛΗ",
        "ΑΝΩ ΠΑΤΗΣΙΑ",
        "ΒΟΤΑΝΙΚΟΣ",
        "ΓΚΑΖΙ",
        "ΓΚΥΖΗ",
        "ΓΟΥΒΑ",
        "ΓΟΥΔΙ",
        "ΕΛΛΗΝΟΡΩΣΩΝ",
        "ΕΜΠΟΡΙΚΟ ΤΡΙΓΩΝΟ-ΠΛΑΚΑ",
        "ΖΑΠΠΕΙΟ",
        "ΘΗΣΕΙΟ",
        "ΙΛΙΣΙΑ",
        "ΚΕΡΑΜΕΙΚΟΣ",
        "ΚΟΛΟΚΥΝΘΟΥ",
        "ΚΟΛΩΝΑΚΙ",
        "ΚΟΛΩΝΟΣ",
        "ΚΟΥΚΑΚΙ-ΜΑΚΡΥΓΙΑΝΝΗ",
        "ΚΥΨΕΛΗ",
        "ΛΥΚΑΒΗΤΤΟΣ",
        "ΜΟΥΣΕΙΟ-ΕΞΑΡΧΕΙΑ-ΝΕΑΠΟΛΗ",
        "ΝΕΑ ΚΥΨΕΛΗ",
        "ΝΕΟΣ ΚΟΣΜΟΣ",
        "ΝΙΡΒΑΝΑ",
        "ΠΑΓΚΡΑΤΙ",
        "ΠΑΤΗΣΙΑ",
        "ΠΕΔΙΟ ΑΡΕΩΣ",
        "ΠΕΝΤΑΓΩΝΟ",
        "ΠΕΤΡΑΛΩΝΑ",
        "ΠΛΑΤΕΙΑ ΑΜΕΡΙΚΗΣ",
        "ΠΛΑΤΕΙΑ ΑΤΤΙΚΗΣ",
        "ΠΟΛΥΓΩΝΟ",
        "ΠΡΟΜΠΟΝΑ",
        "ΡΙΖΟΥΠΟΛΗ",
        "ΣΕΠΟΛΙΑ",
        "ΣΤΑΔΙΟ",
        "ΣΤΑΘΜΟΣ ΛΑΡΙΣΗΣ",
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    property_type: {
      type: String,
      required: true,
      enum: [
        "Apartment",
        "Bed & Breakfast",
        "Boat",
        "Cave",
        "Chalet",
        "Condominium",
        "Dorm",
        "House",
        "Loft",
        "Other",
        "Townhouse",
        "Villa",
      ],
    },
    rating: {
      type: Number,
      min: 1,
      max: 100,
      default: undefined,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    square_meters: {
      type: Number,
      required: true,
      min: 10,
    },
    street: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
  },
  { strict: true }
);
const new_listing = mongoose.model("New_listing", newlistingSchema, "listings");
module.exports = new_listing;
