var express = require("express");
var app = express();
const cors = require("cors");
const router = require("./routes/userRoutes");
app.use(
  cors({
    origin: "*", // Frontend của bạn
    credentials: true, // Cho phép cookie/token
  })
);

app.use(express.json());
app.use(router);

module.exports = app;
