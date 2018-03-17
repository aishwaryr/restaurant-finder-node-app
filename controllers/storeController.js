const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

// Multer only reads the img and puts it in the temp memory - for resizing and actually storing it we'll use jimp
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, res, next) {
    const isPhoto = file.mimeType.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!" }, false);
    }
  }
};

exports.homepage = (req, res) => {
  res.render("index");
};

exports.addStore = (req, res) => {
  res.render("editStore", {
    title: "Add Store"
  });
};

exports.upload = multer(multerOptions).single("photo");
exports.resize = async (req, res, next) => {
  // check if there is no new file to resize
  if (!req.file) {
    next(); //skip to nxt middleware
    return;
  }
  console.log(req.file);
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  // await store.save();
  // console.log("It saved");
  req.flash("success", `Successfully Created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
  // 1. Query the database for a list of all stores
  const stores = await Store.find();
  // console.log(Store);
  res.render("stores", {
    title: "Stores",
    stores
  });
};

exports.editStore = async (req, res) => {
  // 1. Find the store given the ID
  const store = await Store.findOne({ _id: req.params.id });
  // res.json(store);
  // 2. confirm they are the owner of the store
  // TODO
  // 3. Render out the edit form so user can update their store
  res.render("editStore", { title: `Edit ${store.name}`, store });
};

exports.updateStore = async (req, res) => {
  // set the location data to be a point
  // W/o this if we update loc it won't have type - Point
  req.body.location.type = "Point";
  // find and update the store
  // findOneAndUpdate takes in query, data & some options
  const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true, // return the new updated store instead of old one
    runValidators: true // forces the validations defined in Schema to run again on new data (by default they run only once in the begining)
  }).exec();
  // Redirect them to the store and tell them it worked
  req.flash(
    "success",
    `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store >-</a>`
  );
  res.redirect(`/stores/${store._id}/edit`);
};
