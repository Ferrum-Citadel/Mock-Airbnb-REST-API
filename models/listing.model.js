const mongoose = require("mongoose");
//Using pre-existing collection

const listingSchema = new mongoose.Schema({}, { strict: false });
const listing = mongoose.model("Listing", listingSchema, "listings");
module.exports = listing;
