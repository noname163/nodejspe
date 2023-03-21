const { default: mongoose } = require("mongoose");
const Nations = require("../models/nations");
const Players = require("../models/players");
const cloudinary = require("cloudinary").v2;
const getAllNations = async (req, res) => {
  try {
    var perPage = 3;
    var total = await Nations.find().count();
    var pages = Math.ceil(total / perPage);
    var pageNumber = req.query.page == null ? 1 : req.query.page;
    var startFrom = (pageNumber - 1) * perPage;
    var nations = await Nations.find({}).skip(startFrom).limit(perPage);

    res.render("nations", { nations: nations, pages: pages, title: "Nation Page" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const addNation = (req, res) => {
  try {
    const file = req.file;
    req.body.image = file?.path;
    Nations.create(req.body);

    res.redirect("/nations");
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteNationById = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("id: " + id);
    const player = await Players.findOne({ nation: id });
    if (player) {
      // var perPage = 3;
      // var total = await Nations.find().count();
      // var pages = Math.ceil(total / perPage);
      // var pageNumber = req.query.page == null ? 1 : req.query.page;
      // var startFrom = (pageNumber - 1) * perPage;
      // var nations = await Nations.find({}).skip(startFrom).limit(perPage);
      // const error = "This Nation Id Have Constraint With Players";
      // res.render("nations", { nations: nations, title: "Nation Page", error: error });
      res.redirect("/nations");
    } else {
      const nationDel = await Nations.findById({ _id: id });
      console.log(nationDel);
      const publicId = nationDel.image.split("/").slice(-1)[0].split(".")[0];
      console.log(publicId);
      cloudinary.uploader.destroy("images/" + publicId, function (error, result) {
        if (error) {
          console.log("Error deleting image from Cloudinary:", error.message);
        } else {
          console.log("Image deleted from Cloudinary:", result);
        }
      });
      await Nations.deleteOne({ _id: id });

      res.redirect("/nations");
    }

    // res.status(200).json(deletePlayer);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateNationById = async (req, res) => {
  console.log(req.body.originImg);
  if (req.body.image == "") {
    req.body.image = req.body.originImg;
  } else {
    if (req.file !== undefined) {
      req.body.image = req.file?.path;
      const publicId = req.body.originImg.split("/").slice(-1)[0].split(".")[0];
      console.log("publicId check");
      console.log(publicId);
      cloudinary.uploader.destroy("images/" + publicId, function (error, result) {
        if (error) {
          console.log("Error deleting image from Cloudinary:", error.message);
        } else {
          console.log("Image deleted from Cloudinary:", result);
        }
      });
    }
  }
  await Nations.findByIdAndUpdate(req.body._id, req.body);
  res.redirect("/nations");
};

module.exports = {
  getAllNations,
  deleteNationById,
  addNation,
  updateNationById,
};
