const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = Schema(
  {
    _id: Schema.Types.ObjectId,
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      validator: (v) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
    },
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
