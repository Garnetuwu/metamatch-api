const express = require("express");
const env = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ExpressError = require("./utils/Errors");

const authAPI = require("./routes/auth");
const heroAPI = require("./routes/hero");

const app = express();

//env
env.config();

//cors
const corsOptions = {
  origin: process.env.CLIENT_SERVER_URL,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

//handle incoming request
app.use(bodyParser.json()); // handle json data
app.use(bodyParser.urlencoded({ extended: true })); //handle URL-encoded data

//mongoDB initialization
const mongoURI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.gxntsax.mongodb.net/metamatch?retryWrites=true&w=majority`;

try {
  mongoose.connect(mongoURI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("db connected");
} catch (error) {
  console.log(error);
  throw new Error("DB connection failed");
}

app.use("/", authAPI);
app.use("/heroes", heroAPI);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on PORT ${process.env.PORT}`);
});
