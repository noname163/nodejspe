var express = require("express");
var uploadCloud = require("../utils/uploader.js");
var {
  getAllPlayers,
  postPlayer,
  getPlayerById,
  deletePlayerById,
  formPlayer,
  createPlayer,
  updatePlayer,
  formUpdatePlayer,
} = require("../controllers/players.js");
var { verifyUser, verifyAdmin } = require("../utils/verifyToken");
let router = express.Router();

router.get("/", verifyAdmin, getAllPlayers);
router.post("/", verifyAdmin, postPlayer);
router.post("/add", verifyAdmin, uploadCloud.single("image"), createPlayer);
router.get("/form-add", formPlayer);
router.get("/:id", getPlayerById);
router.get("/form-update/:id", verifyAdmin, formUpdatePlayer);
router.post("/update", verifyAdmin, uploadCloud.single("image"), updatePlayer);
router.get("/delete/:id", verifyAdmin, deletePlayerById);
module.exports = router;
