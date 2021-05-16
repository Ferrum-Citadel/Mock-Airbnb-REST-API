const mongoose = require("mongoose");
//Using pre-existing collection

const reviewSchema = new mongoose.Schema(
  {
    comments: {
      type: String,
      required: true,
      minlength: 15,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/],
    },
    id: {
      type: Number,
      unique: true,
    },
    listing_id: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
    },
    reviewer_id: {
      type: Number,
      required: true,
    },
    reviewer_name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 20,
      trim: true,
    },
  },
  { strict: false }
);
const review = mongoose.model("Review", reviewSchema, "reviews");
module.exports = { review, reviewSchema };
