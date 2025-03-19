var express = require("express");
var app = express();
const cors = require("cors");
const router = require("./routes/userRoutes");
app.use(
  cors({
    origin: "http://localhost:3001",
  })
);

app.use(express.json());
app.use(router);

module.exports = app;
