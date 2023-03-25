class ExpressError extends Error {
  contructor(message, statusCode) {
    Super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
