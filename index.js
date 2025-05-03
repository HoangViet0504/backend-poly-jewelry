// const dotenv = require("dotenv");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const userRoutes = require("./src/routes/userRoutes");

// dotenv.config();

// const app = express();
// const PORT = 3001;

// // import db connect
// var db = require("./src/config/connectDb");
// db.getConnection;

// // // Middleware
// // app.use(cors());
// // app.use(bodyParser.json());

// // Routes
// app.use("/api/users", userRoutes);

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require("express");
const app = require("./src/app.js");
var port = 3000;

app.use(express.json()); // Middleware để đọc JSON từ request body

// import db connect
var db = require("./src/config/connectDb.js");
db.getConnection;
app.listen(port, () => {
  console.log("Ứng dụng đang chạy với port 3000");
});
module.exports = app;
