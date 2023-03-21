var express = require("express");
const bodyParser = require("body-parser");
var uploadCloud = require("../utils/uploader.js");

var {
  getAllNations,
  deleteNationById,
  addNation,
  formAddNation,
  updateNationById,
} = require("../controllers/nations.js");
var { verifyUser, verifyAdmin } = require("../utils/verifyToken");

let router = express.Router();

router.get("/", verifyAdmin, getAllNations);
router.get("/", verifyAdmin, addNation);
router.post("/add", verifyAdmin, uploadCloud.single("image"), addNation);
router.post("/update/", verifyAdmin, uploadCloud.single("image"), updateNationById);
router.get("/delete/:id", verifyAdmin, deleteNationById);

module.exports = router;
