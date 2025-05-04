var express = require("express");
var app = express();
const cors = require("cors");
const router = require("./routes/userRoutes");

const allowedOrigins = ["http://localhost:5173", "https://vshopsy.com"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(router);

module.exports = app;