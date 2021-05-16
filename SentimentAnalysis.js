//One time operation that was used to extract an arithmetic value ranging from 1 to 10 from comment reviews written in English

const Sentiment = require("sentiment");
const LanguageDetect = require("languagedetect");
const Review = require("./models/review.model");

const sentimentAnalysis = async () => {
  try {
    const lngDetector = new LanguageDetect();
    const sentiment = new Sentiment();

    //Retrieving and iterating over the whole "reviews" collection using map
    const reviews = await Review.find({});
    reviews.map(async (review) => {
      let review_object = review.toObject();
      //Language detecitons
      const lan = lngDetector.detect(review_object.comments, 1);

      //We give ratings only to reviews written in english
      if (lan[0][0] === "english") {
        const result = sentiment.analyze(review_object.comments);

        //Calculating the ratio of the current score in relation to the cases of max or min score based on number of weighted words found
        const score_ratio = result.score / (result.words.length * 5);
        var rating = 5 + 10 * score_ratio;
        //Rating is in range 1-10
        if (rating < 1) rating = 1;
        else if (rating > 10) rating = 10;
        rating = Math.floor(rating);
      } else {
        rating = undefined;
      }
      const new_doc = await Review.findOneAndUpdate(
        { _id: review_object._id },
        { $set: { rating: rating } },
        { new: true }
      ).catch((err) => {
        console.error(err);
      });
      console.log(new_doc);
    });
  } catch (err) {
    console.error(err);
  }
  console.log("-------------------- All done! -----------------");
};

module.exports = sentimentAnalysis;
