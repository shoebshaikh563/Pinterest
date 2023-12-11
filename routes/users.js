const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect("mongodb://localhost:27017/pintrest");
const useSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: [],
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post",
    },
  ],
});
useSchema.plugin(plm);
module.exports = mongoose.model("user", useSchema);
