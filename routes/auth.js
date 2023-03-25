const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/CatchAsync");
const checkAuthMiddleware = require("../middleware/checkAuthMiddleware");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendMagicLinkEmail } = require("../mailer");

router.get("/register", async (req, res) => {
  const newUser = {
    username: "Garnet",
    email: "garnet2333@hotmail.com",
  };

  const foundUser = await User.find({
    username: newUser.username,
  });

  if (!foundUser) {
    const result = await User.insertOne(newUser);
    res.json(result);
  } else {
    res.send("user already existed");
  }
});

router.post("/login", async (req, res, next) => {
  if (!req.body.email) {
    return res.status(400).send("no request body found");
  }
  const { email } = req.body;

  //found in database
  const foundUser = await User.findOne({ email });

  //generate voucher and send verification email
  if (foundUser) {
    const token = jwt.sign({ userId: foundUser.id }, process.env.JWT_SECRET, {
      expiresIn: "10h",
    });
    console.log(token);
    try {
      await sendMagicLinkEmail({ email: email, name: foundUser.name, token });
      return res.send("email sent");
    } catch (e) {
      next(e);
    }
  }
  res.send("Please check your email to complete logging in");
});

router.post(
  "/authenticate",
  checkAuthMiddleware,
  catchAsync(async (req, res) => {
    console.log(req.token);
    const foundUser = await User.findOne({
      _id: req.token.validatedToken.userId,
    });
    if (foundUser)
      return res.send({ token: req.token.authToken, user: foundUser });
    else {
      throw new ExpressError("Invalid user", 401);
    }
  })
);

module.exports = router;
