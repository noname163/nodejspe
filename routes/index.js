let express = require("express");
const Nations = require("../models/nations");
let router = express.Router();
let {
  getAllInfo,
  login,
  register,
  searchPlayers,
  forgotPassword,
  confirmOTP,
  resetPassword,
  getAllInfoPagination
} = require("../controllers/home.js");
let player = require("../controllers/players");
router.get("/", getAllInfo);
router.get("/pagination",getAllInfoPagination);
router.get("/login", login);
router.get("/register", register);
router.get("/forgotPassword", forgotPassword);
router.get("/confirmOTP", confirmOTP);
router.get("/resetPassword", resetPassword);
router.get("/search", searchPlayers);
router.get("/filter",player.filterPlayer);
module.exports = router;
