const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");
const checkAuth = require("../middleware/checkAuth");
const addressController = require("../controllers/addressController");
const categoriesController = require("../controllers/categoriesController");
const productsController = require("../controllers/productsController");
const voucherController = require("../controllers/vouchersController");
const ordersController = require("../controllers/ordersController");
const categoriesClientController = require("../controllers/client/categoriesClientController");
const profileClientController = require("../controllers/client/profileController");
const productsClientController = require("../controllers/client/productsController");
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
// products
router.get(
  "/getListProductsAdmin",
  checkAuth,
  productsController.getListProductsAdmin
);
router.get(
  "/getListProductsAdminByKeyWord",
  checkAuth,
  productsController.getListProductsAdminByKeyWord
);
router.get(
  "/getListProductsRemoveAdmin",
  checkAuth,
  productsController.getListProductsRemoveAdmin
);
router.get("/getProductAdmin", checkAuth, productsController.getProductAdmin);
router.post(
  "/AddProductsAdmin",
  checkAuth,
  productsController.AddProductsAdmin
);
router.post(
  "/DeleteProductsAdminByIsDelete",
  checkAuth,
  productsController.DeleteProductsAdminByIsDelete
);
router.post(
  "/RevertDeleteProductsAdminByIsDelete",
  checkAuth,
  productsController.RevertDeleteProductsAdminByIsDelete
);
router.post(
  "/DeleteProductsAdmin",
  checkAuth,
  productsController.DeleteProductsAdmin
);
router.post(
  "/UpdateProductsAdmin",
  checkAuth,
  productsController.UpdateProductsAdmin
);
// Voucher
router.get(
  "/getListVouchersAdmin",
  checkAuth,
  voucherController.getListVouchersAdmin
);
router.get(
  "/getListVouchersAdminByKeyWord",
  checkAuth,
  voucherController.getListVouchersAdminByKeyWord
);
router.get("/getVouchersAdmin", checkAuth, voucherController.getVouchersAdmin);
router.post("/AddVouchersAdmin", checkAuth, voucherController.AddVouchersAdmin);
router.post(
  "/DeleteVouchersAdmin",
  checkAuth,
  voucherController.DeleteVouchersAdmin
);
router.post(
  "/UpdateVouchersAdmin",
  checkAuth,
  voucherController.UpdateVouchersAdmin
);
// orders
router.get(
  "/getListOrdersAdmin",
  checkAuth,
  ordersController.getListOrdersAdmin
);
router.get(
  "/getListOrdersAdminByKeyWord",
  checkAuth,
  ordersController.getListOrdersAdminByKeyWord
);
router.get("/getOrdersAdmin", checkAuth, ordersController.getOrdersAdmin);
router.post(
  "/UpdateOrdersAdmin",
  checkAuth,
  ordersController.UpdateOrdersAdmin
);

//  client
// categories
router.get("/getListCategories", categoriesClientController.getListCategories);
// Profile
router.post("/UpdateUser", profileClientController.UpdateUser);
router.post("/UpdatePassword", profileClientController.UpdatePassword);

router.get("/getListOrdersClient", profileClientController.getListOrdersClient);
router.get(
  "/getListOrdersDetailClient",
  profileClientController.getListOrdersDetailClient
);
// products
router.get(
  "/getListProductsByCategoriesClient",
  productsClientController.getListProductsByCategoriesClient
);
router.get(
  "/getListProductsBySlugClient",
  productsClientController.getListProductsBySlugClient
);

module.exports = router;
