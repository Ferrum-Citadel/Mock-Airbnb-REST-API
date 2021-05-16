const mongoose = require("mongoose");
//Using pre-existing collection

const calendarSchema = new mongoose.Schema({}, { strict: false });
const calendar = mongoose.model("Dates", calendarSchema, "dates");
module.exports = calendar;
