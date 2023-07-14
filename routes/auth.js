const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/CatchAsync");
const checkAuthMiddleware = require("../middleware/checkAuthMiddleware");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { sendMagicLinkEmail } = require("../mailer");
const ExpressError = require("../utils/Errors");

const createToken = (user) => {
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "10h",
    }
  );

  return token;
};

const createAndSendToken = async (user) => {
  const token = createToken(user);
  await sendMagicLinkEmail({ email: user.email, name: user.username, token });
};

router.post("/register", async (req, res, next) => {
  if (!req.body.username || !req.body.email) {
    next(new ExpressError("you have to complete both areas to register."));
  }

  const { username, email } = req.body;

  const foundUser = await User.find({
    email,
  });

  if (foundUser.length === 0) {
    try {
      await User.collection.insertOne({
        username,
        email,
        role: "visitor",
      });
      // await createAndSendToken(newUser);
    } catch (e) {
      console.log(e);
      next(e);
    }
    res.send("success");
  } else {
    next(new ExpressError("user already existed, please login", 401));
  }
});

router.post(
  "/login",
  catchAsync(async (req, res) => {
    if (!req.body.email) {
      return res.status(400).send("no request body found");
    }
    const { email } = req.body;

    //found in database
    const foundUser = await User.findOne({ email });

    if (foundUser) {
      if (foundUser.email === "niruoyi@gmail.com") {
        const token = createToken(foundUser);
        return res.send({ token, user: foundUser });
      } else {
        //generate voucher and send verification email
        try {
          await createAndSendToken(foundUser);
          res.send("Please check your email to complete logging in");
        } catch (e) {
          next(e);
        }
      }
    } else {
      throw new ExpressError("no user found, please register first", 401);
    }
  })
);

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
