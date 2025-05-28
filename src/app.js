// var express = require("express");
// var app = express();
// const cors = require("cors");
// const router = require("./routes/userRoutes");

// const allowedOrigins = ["http://localhost:5173", "https://vshopsy.com"];

// app.use(
//     cors({
//         origin: function (origin, callback) {
//             if (!origin || allowedOrigins.includes(origin)) {
//                 callback(null, true);
//             } else {
//                 callback(new Error("Not allowed by CORS"));
//             }
//         },
//         credentials: true,
//     })
// );

// app.use(express.json());
// app.use(router);

// module.exports = app;

var express = require("express");
var app = express();
const router = require("./routes/userRoutes");
var cors = require("cors"); // <--- Thêm dòng này

app.use(cors({
    origin: "*", // hoặc dùng "*" nếu chấp nhận từ mọi nơi
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true // nếu bạn có dùng cookie
}));

app.use(express.json());
app.use(router);

module.exports = app;