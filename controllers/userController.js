const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res) => {
  res.render("login", { title: "LOGIN" });
};

exports.registerForm = (req, res) => {
  res.render("register", { title: "REGISTER" });
};

// Custom Middleware for registration data validation
exports.validateRegister = (req, res, next) => {
  // below methods came from here app.use(expressValidator()); in app.js
  req.sanitizeBody("name");
  req.checkBody("name", "You must supply a name!").notEmpty();
  req.checkBody("email", "That Email is not valid!").isEmail();
  req.sanitizeBody("email").normalizeEmail({
    gmail_remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false,
  });
  req.checkBody("password", "Password Field cannot be Blank!").notEmpty();
  req.checkBody("password-confirm", "Confirm Password Field cannot be Blank!").notEmpty();
  req.checkBody("password-confirm", "Oops! Your Passwords do not match").equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", { title: "REGISTER", body: req.body, flashes: req.flash() });
    return; // stop from running
  }
  next(); // there were no errors
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  // below User.register method is provided by password and uses callbacks; so using es6-promisify to make it return a promise
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next(); // pass to authController.login
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};

exports.updateAccount = async (req, res) => {
  // uodated data
  const updates = {
    name: req.body.name,
    email: req.body.email,
  };
  // find the right the user and update
  const user = await User.findOneAndUpdate(
    { _id: req.user._id }, // query
    { $set: updates }, // update
    { new: true, runValidators: true, context: "query" } // options
  );
  req.flash("success", "Updated the profile!");
  res.redirect("back");
};
