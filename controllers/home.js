const { default: mongoose } = require("mongoose");
const Player = require("../models/players");
const Nations = require("../models/nations");
const Users = require("../models/users");
const clubs = [
  'Barcelona', 'Real Madrid', 'Liverpool', 'Bayern Munich', 'Manchester City', 'Arsenal'
]
const playerPositions = [
  "Goalkeeper",
  "Right Back",
  "Left Back",
  "Center Back",
  "Sweeper",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Right Winger",
  "Left Winger",
  "Second Striker",
  "Center Forward"
];

const getAllInfo = async (req, res) => {
  try {
    let nations = await Nations.find({});
    let perPage = 3;
    let total = await Player.find().count();
    let pages = Math.ceil(total / perPage);
    let pageNumber = req.query.page == null ? 1 : req.query.page;
    let startFrom = (pageNumber - 1) * perPage;
    let players = await Player.find({ isCaptain: true }).populate("nation").skip(startFrom).limit(perPage);
    
    res.render("home", { list: players, 
      pages: pages, 
      clubs:clubs,
      positions:playerPositions,
      nations: nations, 
      title: "Home Page" });
  } catch (err) {
    res.status(500).json(err);
  }
};
const getAllInfoPagination = async (req, res) => {
  try {
    let nations = await Nations.find({});
    let perPage = 3;
    let total = await Player.find().count();
    let pages = Math.ceil(total / perPage);
    let pageNumber = req.query.page == null ? 1 : req.query.page;
    let startFrom = (pageNumber - 1) * perPage;
    let players = await Player.find({ isCaptain: true }).populate("nation").skip(startFrom).limit(perPage);
    
    res.render("partials/playerTable", { list: players, 
      pages: pages, 
      clubs:clubs,
      positions:playerPositions,
      nations: nations, 
      title: "Home Page" });
  } catch (err) {
    res.status(500).json(err);
  }
};

const login = (req, res) => {
  res.render("login", {
    title: "Login",
    errors: req.flash("errors"),
    success: req.flash("success"),
    email: req.flash("email"),
    password: req.flash("password"),
  });
};

const register = (req, res) => {
  res.render("register", {
    title: "Register",
    errors: req.flash("errors"),
    email: req.flash("email"),
    password: req.flash("password"),
    name: req.flash("name"),
    dob: req.flash("dob"),
  });
};

const forgotPassword = (req, res) => {
  res.render("forgotPassword", {
    title: "Forgot Password",
    errors: req.flash("errors"),
    email: req.flash("emailForgot"),
  });
};

const confirmOTP = async (req, res) => {
  const email = req.flash("emailConfirm")[0];

  res.render("confirmOTP", {
    title: "Confirm OTP",
    errors: req.flash("errors"),
    email: email,
    success: req.flash("success"),
  });
};

const resetPassword = (req, res) => {
  const email = req.flash("emailReset")[0];
  res.render("resetPassword", {
    title: "Reset Password",
    errors: req.flash("errors"),
    email: email,
    success: req.flash("success"),
  });
};

const searchPlayers = async (req, res) => {
  const searchQuery = new RegExp(req.query.search, "i"); // case-insensitive search
  const perPage = 3;
  let empty = false;
  const total = await Player.find({ name: searchQuery }).count();
  console.log(total);
  const pages = Math.ceil(total / perPage);
  const pageNumber = req.query.page == null ? 1 : req.query.page;
  const startFrom = (pageNumber - 1) * perPage;
  const listPlayer = await Player.find({ name: searchQuery })
    .populate("nation")
    .skip(startFrom)
    .limit(perPage);
    if(listPlayer.length<=0){
      empty = true
    }
  console.log(listPlayer);
  res.render("partials/playerTable", {
    list: listPlayer,
    title: "Search Page",
    isEmpty: empty,
    searchQuery: req.query.search,
    pages: pages,
    total: total,
  });
};
module.exports = {
  getAllInfo,
  login,
  register,
  searchPlayers,
  forgotPassword,
  confirmOTP,
  resetPassword,
  getAllInfoPagination
};
