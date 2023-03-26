const mongoose = require("mongoose");
const { Schema } = mongoose;

const heroSchema = Schema({
  name: {
    type: String,
    required: [true, "you must provide the hero name"],
  },
  role: {
    type: String,
    enum: ["tank", "dps", "support"],
    required: [true, "you must pick the hero role"],
  },
  image: {
    type: String,
    required: [true, "you must provide the hero image url"],
  },
  type: {
    type: String,
    enum: ["dive", "brawl", "spam", "flex"],
    required: [true, "you must provide the hero type"],
  },
  strength: {
    type: String,
    enum: [
      "high mobility",
      "high damage",
      "high sustain",
      "long range",
      "high accuracy",
      "high burst damage",
    ],
  },
  weakness: {
    type: String,
    enum: [
      "low mobility",
      "low damage",
      "low sustain",
      "short range",
      "low accuracy",
      "easy to get bursted",
    ],
  },
  relationships: [
    {
      hero: { type: Schema.Types.ObjectId, ref: "Hero" },
      score: {
        type: Number,
        min: -100,
        max: 100,
        validator: (v) => /^\s*-?[0-9]{1,10}\s*$/.text(v),
      },
      combo: { type: Number, enum: [0, 1, 2, 3, 4] },
      special: Boolean,
      counterComment: String,
      comboComment: String,
    },
  ],
});

module.exports = mongoose.model("Hero", heroSchema);
