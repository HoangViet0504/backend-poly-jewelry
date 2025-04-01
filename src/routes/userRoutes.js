// const express = require("express");
// const router = express.Router();
// const authController = require("../controllers/authController");

// //Router AUTH
// router.post("/auth/login", authController.login);
// router.post("/auth/register", authController.register);
// router.post("/auth/refreshToken", authController.refreshToken);
// router.get("/auth/alluser", authController.getAllUser);

// module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

//Router AUTH
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/me", authController.me);
router.post("/auth/refreshToken", authController.refreshToken);
router.get("/auth/alluser", authController.getAllUser);

module.exports = router;
