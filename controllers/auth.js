let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
const User = require("../models/users");
const Otp = require("../models/otp");
const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { log } = require("console");

const register = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    const dob = req.body.dob;
    console.log(req.body);
    req.flash("email", email);
    req.flash("password", password);
    req.flash("name", name);
    req.flash("dob", dob);

    const file = req.file;

    if (!email || !password) {
      req.flash("errors", "Please Enter all fields");
    }

    if (password.length < 6) {
      req.flash("errors", "Password must be at least 6 characters");
      if (file) cloudinary.uploader.destroy(file.filename);
      res.redirect("/register");
    }

    let userExist = await User.findOne({ email: email });
    if (userExist) {
      req.flash("errors", "Email already exists");
      res.redirect("/register");
    } else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);
      if (file != undefined) {
        req.body.image = file?.path;
      }
      const newUser = new User({ ...req.body, password: hash });
      const saveUser = newUser.save();
      console.log("save success");
      res.redirect("/login");
    }
  } catch (err) {
    console.log("error: " + err);
    next(err);
  }
};
const login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    req.flash("email", email);
    req.flash("password", password);

    if (!email || !password) {
      req.flash("errors", "Please Enter all fields");
      res.redirect("/login");
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("errors", "User Name or Password incorrect please try again");
      // res.render("login", { title: "Login", errors, email, password: password });
      res.redirect("/login");
    } else {
      const isPasswordCorrect = await bcrypt.compareSync(req.body.password, user.password);
      console.log(isPasswordCorrect);
      if (!isPasswordCorrect) {
        req.flash("errors", "User Name or Password incorrect please try again");
        res.redirect("/login");
      } else {
        const token = jwt.sign(
          { email: user.email, image: user.image, id: user._id, isAdmin: user.isAdmin },
          process.env.JWT
        );
        // req.session.user = user;
        // res.cookie("user", JSON.stringify(user), { httpOnly: true });
        res
          .cookie("access_token", token, {
            httpOnly: true,
          })
          .redirect("/");
      }
    }
  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  // req.session.destroy();
  res.clearCookie("access_token");
  res.clearCookie("user");
  res.redirect("/");
};

const profile = async (req, res) => {
  const id = req.params.id;
  const userProfile = await User.findById({ _id: id });
  const isCurrentUser = req.user && req.user.id === id;
  let errors = [];
  if (isCurrentUser) {
    res.render("profile", { title: "Profile Page", user: userProfile });
  } else {
    errors.push({ msg: "Link Profile is not corrected please try again" });
    res.render("login", { title: "Login", errors });
  }

  // console.log(userProfile);
  // res.render("profile", { title: "Profile Page", user: userProfile });
};

const updateProfile = async (req, res) => {
  console.log("body");
  console.log(req.body);
  let errors = [];
  const file = req.file;
  const user = await User.findById({ _id: req.body._id });

  if (req.file !== undefined) {
    req.body.image = req.file?.path;
    const publicId = req.body.originImg.split("/").slice(-1)[0].split(".")[0];
    cloudinary.uploader.destroy("images/" + publicId, function (error, result) {
      if (error) {
        console.log("Error deleting image from Cloudinary:", error.message);
      } else {
        console.log("Image deleted from Cloudinary:", result);
      }
    });
  } else {
    req.body.image = req.body.originImg;
  }

  if (req.body.newPassword.length > 1 && !(req.body.confirmPassword.length > 1)) {
    errors.push({ msg: "Enter old Password before update new Password" });
    res.render("partials/userProfile", { title: "Profile Page", user: user, errors });
  }

  if (req.body.confirmPassword.length > 1) {
    const isPasswordCorrect = await bcrypt.compareSync(req.body.confirmPassword, req.body.password);
    let goto = false;
    if (!isPasswordCorrect) {
      errors.push({ msg: "Password not correct Please try again" });
      res.render("partials/userProfile", { title: "Profile Page", user: user, errors });
    } else {
      if (req.body.newPassword.length < 6) {
        errors.push({ msg: "New Password Length is too short please try again" });
        res.render("partials/userProfile", { title: "Profile Page", user: user, errors });
      } else if (req.body.newPassword !== req.body.confirmNewPassword) {
        errors.push({ msg: "New Password and Confirm Password is not correct please try again" });
        res.render("partials/userProfile", { title: "Profile Page", user: user, errors });
      } else if (req.body.confirmPassword === req.body.newPassword) {
        errors.push({ msg: "New Password need to be different with the Old Password" });
        res.render("partials/userProfile", { title: "Profile Page", user: user, errors });
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.newPassword, salt);
        req.body.password = hash;

        console.log(req.user);
        goto =  true;
        const userUpdate = await User.findByIdAndUpdate(req.body._id, req.body);
        res.clearCookie("access_token");
        req.flash("success", "Update Password Success");
        res.render(`partials/loginForm`,{title:"login"});
      }
    }
  } else {
    let user = await User.findByIdAndUpdate(req.body._id, req.body);
    let userUpdate = await User.findById(req.body._id);
    console.log("User after update ",userUpdate);

    res.render('partials/userProfile',{user:userUpdate})
  }
};

function handleSendEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "akai792001@gmail.com",
      pass: "sintqxlaiegckqdk",
    },
  });

  const mailOptions = {
    from: "akai792001@gmail.com",
    to: email,
    subject: "Reset Password - OTP",
    html: `<p>Your OTP is ${otp}. Use this to reset your password.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

const verifyEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    req.flash("emailForgot", email);
    if (!user) {
      console.log("Email not found");
      req.flash("errors", "Email not found");
      return res.redirect("/forgotPassword");
    }

    const existingOtp = await Otp.findOne({ email });
    console.log(existingOtp);
    console.log("error herre");
    if (existingOtp) {
      // If OTP exists and is not expired, update the OTP and expiry time
      const now = new Date();
      const otp = crypto.randomInt(100000, 999999);
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(String(otp), salt);
      console.log(otp);
      existingOtp.otp = hash;
      existingOtp.time = new Date(now.getTime() + 1 * 60 * 1000);
      await existingOtp.save();
      console.log("update success");
      handleSendEmail(email, otp);
      res.render("confirmOTP", { title: "Confirm OTP", email: email });
    } else {
      const now = new Date();
      const expiryTime = new Date(now.getTime() + 5 * 60 * 1000);
      const otp = crypto.randomInt(100000, 999999);

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(String(otp), salt);

      const newOtp = new Otp({ email, otp: hash });
      await newOtp.save();
      console.log(otp);
      handleSendEmail(email, otp);
      console.log("success");
      res.render("confirmOTP", { title: "Confirm OTP", email: email });
    }
  } catch (error) {
    console.log(error);
  }
};

const confirmOtp = async (req, res) => {
  // xác thực OTP
  try {
    console.log(req.body);
    const confirmOTP = req.body.otp;
    const email = req.body.email;
    const user = await User.findOne({ email });
    const verifyOtp = await Otp.findOne({ email });
    req.flash("emailConfirm", email);
    if (!user) {
      console.log("Email not found");
      req.flash("errors", "Email not found");
      return res.redirect("/forgotPassword");
    }
    if (!verifyOtp) {
      req.flash("errors", "OTP invalid or expired");
      return res.redirect("/confirmOTP");
    }
    const isOtpCorrect = await bcrypt.compareSync(confirmOTP, verifyOtp.otp);
    if (!isOtpCorrect) {
      req.flash("errors", "OTP invalid or expired");
      return res.redirect("/confirmOTP");
    } else {
      res.render("resetPassword", { title: "Reset Password", email: email });
    }
  } catch (error) {
    console.log(error);
  }
};

const resendOTP = async (req, res) => {
  try {
    const email = req.body.email;
    // const emailResend = req.body.emailResend;
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Email not found");
      return res.redirect("/login");
    }

    const now = new Date();
    const existingOtp = await Otp.findOne({ email });
    console.log(existingOtp);
    if (existingOtp) {
      // If OTP exists and is not expired, update the OTP and expiry time
      console.log("Existing OTP still valid");
      const otp = crypto.randomInt(100000, 999999);
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(String(otp), salt);
      console.log(otp);
      existingOtp.otp = hash;
      existingOtp.time = new Date(now.getTime() + 1 * 60 * 1000);
      await existingOtp.save();
      console.log("update success");
      handleSendEmail(email, otp);
      req.flash("success", "Re-send OTP Success please wait felt minute");
      req.flash("emailConfirm", email);
      res.redirect("/confirmOTP");
    } else {
      const otp = crypto.randomInt(100000, 999999);
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(String(otp), salt);
      const newOtp = new Otp({ email, otp: hash });
      await newOtp.save();
      handleSendEmail(email, otp);

      console.log("success");
      req.flash("success", "Re-send OTP Success please wait felt minute");
      req.flash("emailConfirm", email);
      res.render("confirmOTP", { title: "Confirm OTP", email: email });
    }
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const newPassword = req.body.password;
    console.log(req.body);
    const confirmPassword = req.body.password_confirm;
    const email = req.body.email;
    req.flash("emailReset", email);
    const user = await User.findOne({ email });
    if (newPassword.length < 6) {
      req.flash("errors", "new password is too short please try again");
      return res.redirect("/resetPassword");
    }
    if (newPassword !== confirmPassword) {
      req.flash("errors", "new password and confirm password is not same please try again");
      return res.redirect("/resetPassword");
    }

    if (newPassword === confirmPassword) {
      const isPasswordCorrect = await bcrypt.compareSync(newPassword, user.password);
      if (isPasswordCorrect) {
        req.flash("errors", "new password is your current password, input new password");
        return res.redirect("/resetPassword");
      } else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(newPassword, salt);
        console.log(hash);
        user.password = hash;
        await user.save();

        const checkOtpExist = await Otp.findOne({ email });
        if (checkOtpExist) {
          await Otp.deleteOne({ email });
        }

        console.log("save success");
        req.flash("success", "Reset Password Successes");
        return res.redirect("/login");
      }
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  register,
  login,
  logout,
  profile,
  updateProfile,
  verifyEmail,
  confirmOtp,
  resendOTP,
  resetPassword,
};
