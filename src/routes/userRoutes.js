const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const checkAuth = require("../middleware/checkAuth");
const addressController = require("../controllers/addressController");
const categoriesController = require("../controllers/categoriesController");
//Router AUTH
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/me", authController.me);

// dashboard
// User
router.get("/getListUserAdmin", checkAuth, userController.getListUserAdmin);
router.get(
  "/getListUserRemoveAdmin",
  checkAuth,
  userController.getListUserRemoveAdmin
);
router.get(
  "/getListUserAdminByKeyWord",
  checkAuth,
  userController.getListUserAdminByKeyWord
);
router.get("/getUserAdmin", checkAuth, userController.getUserAdmin);
router.post("/AddUserAdmin", checkAuth, userController.AddUserAdmin);
router.post(
  "/DeleteUserAdminByIsDelete",
  checkAuth,
  userController.DeleteUserAdminByIsDelete
);
router.post(
  "/RevertDeleteUserAdminByIsDelete",
  checkAuth,
  userController.RevertDeleteUserAdminByIsDelete
);
router.post("/DeleteUserAdmin", checkAuth, userController.DeleteUserAdmin);
router.post("/UpdateUserAdmin", checkAuth, userController.UpdateUserAdmin);
// address
router.get("/getAllProvince", addressController.getAllProvince);
router.get("/getAllDistrictById", addressController.getAllDistrictById);
router.get("/getAllWardById", addressController.getAllWardById);

//  categories

router.get(
  "/getListCategoriesAdmin",
  checkAuth,
  categoriesController.getListCategoriesAdmin
);
router.get(
  "/getListCategoriesAdminByKeyWord",
  checkAuth,
  categoriesController.getListCategoriesAdminByKeyWord
);
router.get(
  "/getListCategoriesRemoveAdmin",
  checkAuth,
  categoriesController.getListCategoriesRemoveAdmin
);
router.get(
  "/getCategoriesAdminById",
  checkAuth,
  categoriesController.getCategoriesAdmin
);
router.post(
  "/DeleteCategoriesAdminByIsDelete",
  checkAuth,
  categoriesController.DeleteCategoriesAdminByIsDelete
);
router.post(
  "/AddCategoriesAdmin",
  checkAuth,
  categoriesController.AddCategoriesAdmin
);
router.post(
  "/RevertDeleteCategoriesAdminByIsDelete",
  checkAuth,
  categoriesController.RevertDeleteCategoriesAdminByIsDelete
);
router.post(
  "/DeleteCategoriesAdmin",
  checkAuth,
  categoriesController.DeleteCategoriesAdmin
);
router.post(
  "/UpdateCategoriesAdmin",
  checkAuth,
  categoriesController.UpdateCategoriesAdmin
);
module.exports = router;
