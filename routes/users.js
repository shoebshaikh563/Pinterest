const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");
mongoose.connect(
  "mongodb+srv://shoebshaikh0073:k4TGgmcUhxsUtiNV@cluster0.mtdidip.mongodb.net/?retryWrites=true&w=majority"
);
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
