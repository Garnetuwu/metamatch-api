const ExpressError = require("../utils/Errors");
const jwt = require("jsonwebtoken");

function checkAuthMiddleware(req, res, next) {
  if (!req.headers.authorization) {
    console.log("NOT AUTH. AUTH HEADER MISSING.");
    return next(new ExpressError("No AUTH. AUTH HEADER MISSING", 401));
  }
  const authFragments = req.headers.authorization.split(" ");

  if (authFragments.length !== 2) {
    console.log("NOT AUTH. AUTH HEADER INVALID.");
    return next(new ExpressError("NO AUTH. AUTH HEADER INVALID.", 401));
  }
  const authToken = authFragments[1];
  try {
    const validatedToken = jwt.verify(authToken, process.env.JWT_SECRET);
    req.token = { authToken, validatedToken };
  } catch (error) {
    console.log("NOT AUTH. TOKEN INVALID.");
    return next(new ExpressError("NOT AUTH. TOKEN INVALID", 401));
  }
  next();
}

module.exports = checkAuthMiddleware;
