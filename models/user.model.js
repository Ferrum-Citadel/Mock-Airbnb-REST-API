const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 5,
      maxlength: 12,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    phoneNumber: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      match: [/^[0-9]{10}$/, "Plese fill in a 10 digit number"],
    },
    user_photo_url: {
      type: String,
      match: [
        /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/,
        "Invalid URL",
      ],
    },
    firstName: {
      type: String,
      required: true,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true,
    },
    role: {
      //Permission levels: 1 for renter 2 for host-renter- and 3 for admin
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    pending: {
      //Used only for host registrations until they are validated by an admin
      type: Boolean,
    },
    hosted_listings: {
      //Used only by hosts
      type: [Number],
      unique: true,
    },
    bookings: [{ listing_id: String, dates: [String] }],
    hostedListing: {
      type: [Number],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("User", userSchema);
module.exports = user;
