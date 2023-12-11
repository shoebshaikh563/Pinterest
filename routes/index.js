var express = require("express");
var router = express.Router();
const UserModel = require("./users");
const PostModel = require("./post");
const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(UserModel.authenticate()));
const upload = require("./multer");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { nav: false });
});

router.get("/profile", isLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");
  res.render("profile", { user, nav: true });
});

//show all posts of perticular person on perticular page
router.get("/show/posts", isLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user,
  }).populate("posts");
  res.render("show", { user, nav: true });
});

//for profile picture
router.post(
  "/fileupload",
  isLoggedIn,
  upload.single("image"),
  async function (req, res, next) {
    const user = await UserModel.findOne({
      username: req.session.passport.user,
    });

    user.profileImage = req.file.filename;
    await user.save();
    res.redirect("profile");
  }
);
router.get("/register", function (req, res, next) {
  res.render("register", { nav: false });
});

// delete post using id
router.get("/post/:id", isLoggedIn, async function (req, res, next) {
  try {
    const { id } = req.params;

    const user = await UserModel.findOne({
      username: req.session.passport.user,
    });

    // Find the post by id and remove it
    const deletedPost = await PostModel.findOneAndDelete({ _id: id });

    // Remove the post reference from the user's posts array
    user.posts.pull(id);
    await user.save();

    if (!deletedPost) {
      req.flash("error", "Post not found");
      return res.redirect("/show/posts");
    }

    req.flash("success", "Post deleted successfully");
    res.redirect("/show/posts");
  } catch (err) {
    next(err);
  }
});
//post update route
router.get("/update/:id", async (req, res, next) => {
  const user = await UserModel.findOne({
    username: req.session.passport.user,
  });
  const { id } = req.params;
  req.session.customId = id;

  res.render("update", { nav: true, id });
});
router.post(
  "/postupdate",
  upload.single("updateimage"),
  async (req, res, next) => {
    const customId = req.session.customId;
    const post = await PostModel.findOne({ _id: customId });
    post.image = req.file.filename;
    post.title = req.body.title;
    post.description = req.body.description;
    await post.save();
    res.redirect("/show/posts");
  }
);

//register form
router.post("/register", function (req, res, next) {
  const { username, email, contact, password } = req.body;
  const data = new UserModel({
    username,
    email,
    contact,
  });

  UserModel.register(data, password, function (err) {
    if (err) {
      req.flash(
        "error",
        "Registration failed. Please choose a different credntials."
      );
      return res.redirect("/register");
    }

    passport.authenticate("local")(req, res, async function () {
      const user = await UserModel.findOne({
        username: req.session.passport.user,
      });
      res.render("profile", { user, nav: true });
    });
  });
});

router.get("/add", isLoggedIn, async function (req, res, next) {
  res.render("add", { nav: true });
});

//feed
router.get("/feed", isLoggedIn, async function (req, res, next) {
  const user = await UserModel.findOne({
    username: req.session.passport.user,
  });

  const data = await PostModel.find().populate("user");
  console.log(data);

  res.render("feed", { data, user, nav: true });
});

router.post(
  "/createpost",
  isLoggedIn,
  upload.single("postimage"),
  async function (req, res, next) {
    const user = await UserModel.findOne({
      username: req.session.passport.user,
    });
    const post = await PostModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename,
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
  }
);
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: "Invalid username or password",
    failureRedirect: "/",
    successRedirect: "/profile",
  }),
  function (req, res, next) {}
);
router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}
module.exports = router;
