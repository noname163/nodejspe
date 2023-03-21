var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
const multer = require("multer");
var dotenv = require("dotenv");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var jwt = require("jsonwebtoken");
var flash = require("connect-flash");
// router
var indexRouter = require("./routes/index");
var nationRouter = require("./routes/nationRouter");
var playerRouter = require("./routes/playerRouter");
var authRouter = require("./routes/auth");
var accountRouter = require("./routes/accounts");
var app = express();
dotenv.config();

mongoose.set("strictQuery", false);
const url = "mongodb://127.0.0.1:27017/footballDB";
const connect = mongoose.connect(url);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
// const addUserDataToLocals = (req, res, next) => {
//   if (req.cookies.user) {
//     const user = JSON.parse(req.cookies.user);
//     res.locals.user = user;
//   }
//   next();
// };
const addUserDataToLocals = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT);
      res.locals.user = decoded;
    } catch (err) {
      console.log(err);
    }
  }
  next();
};

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(addUserDataToLocals);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/", indexRouter);
app.use("/nations", nationRouter);
app.use("/players", playerRouter);
app.use("/auth", authRouter);
app.use("/users", accountRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// const url = "mongodb://127.0.0.1:27017/footballDB";

connect.then((db) => {
  console.log("connect successfully");
});

module.exports = app;
