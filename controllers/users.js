const User = require("../models/users");

const getAllUser = async (req, res) => {
  var perPage = 3;
  // const nations = await Nations.find();
  var total = await User.find().count();
  var pages = Math.ceil(total / perPage);
  var pageNumber = req.query.page == null ? 1 : req.query.page;
  var startFrom = (pageNumber - 1) * perPage;
  var users = await User.find({ isAdmin: false }).skip(startFrom).limit(perPage);
  res.render("users", { users: users, pages: pages, title: "User Page" });
};

module.exports = {
  getAllUser,
};
