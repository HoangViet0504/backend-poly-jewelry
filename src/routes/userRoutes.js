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
const cartsClientController = require("../controllers/client/cartsClientController");
const commentClientController = require("../controllers/client/commentClientController");
const checkOut = require("../controllers/client/checkoutClientController");
//Router AUTH
router.post("/auth/login", authController.login);
router.post("/auth/register", authController.register);
router.get("/auth/me", authController.me);
router.post("/checkEmailRequest", authController.checkEmailRequest);
router.post("/updatePasswordRequest", authController.updatePasswordRequest);
// dashboard
// User
router.get("/getListUserAdmin", userController.getListUserAdmin);
router.get(
  "/getListUserRemoveAdmin",

  userController.getListUserRemoveAdmin
);
router.get(
  "/getListUserAdminByKeyWord",

  userController.getListUserAdminByKeyWord
);
router.get("/getUserAdmin", userController.getUserAdmin);
router.post("/AddUserAdmin", userController.AddUserAdmin);
router.post(
  "/DeleteUserAdminByIsDelete",

  userController.DeleteUserAdminByIsDelete
);
router.post(
  "/RevertDeleteUserAdminByIsDelete",

  userController.RevertDeleteUserAdminByIsDelete
);
router.post("/DeleteUserAdmin", userController.DeleteUserAdmin);
router.post("/UpdateUserAdmin", userController.UpdateUserAdmin);
// address
router.get("/getAllProvince", addressController.getAllProvince);
router.get("/getAllDistrictById", addressController.getAllDistrictById);
router.get("/getAllWardById", addressController.getAllWardById);

//  categories

router.get(
  "/getListCategoriesAdmin",

  categoriesController.getListCategoriesAdmin
);
router.get(
  "/getListCategoriesAdminByKeyWord",

  categoriesController.getListCategoriesAdminByKeyWord
);
router.get(
  "/getListCategoriesRemoveAdmin",

  categoriesController.getListCategoriesRemoveAdmin
);
router.get("/getCategoriesAdminById", categoriesController.getCategoriesAdmin);
router.post(
  "/DeleteCategoriesAdminByIsDelete",

  categoriesController.DeleteCategoriesAdminByIsDelete
);
router.post(
  "/AddCategoriesAdmin",

  categoriesController.AddCategoriesAdmin
);
router.post(
  "/RevertDeleteCategoriesAdminByIsDelete",

  categoriesController.RevertDeleteCategoriesAdminByIsDelete
);
router.post(
  "/DeleteCategoriesAdmin",

  categoriesController.DeleteCategoriesAdmin
);
router.post(
  "/UpdateCategoriesAdmin",

  categoriesController.UpdateCategoriesAdmin
);
// products
router.get(
  "/getListProductsAdmin",

  productsController.getListProductsAdmin
);
router.get(
  "/getListProductsAdminByKeyWord",

  productsController.getListProductsAdminByKeyWord
);
router.get(
  "/getListProductsRemoveAdmin",

  productsController.getListProductsRemoveAdmin
);
router.get("/getProductAdmin", productsController.getProductAdmin);
router.post(
  "/AddProductsAdmin",

  productsController.AddProductsAdmin
);
router.post(
  "/DeleteProductsAdminByIsDelete",

  productsController.DeleteProductsAdminByIsDelete
);
router.post(
  "/RevertDeleteProductsAdminByIsDelete",

  productsController.RevertDeleteProductsAdminByIsDelete
);
router.post(
  "/DeleteProductsAdmin",

  productsController.DeleteProductsAdmin
);
router.post(
  "/UpdateProductsAdmin",

  productsController.UpdateProductsAdmin
);
// Voucher
router.get(
  "/getListVouchersAdmin",

  voucherController.getListVouchersAdmin
);
router.get(
  "/getListVouchersAdminByKeyWord",

  voucherController.getListVouchersAdminByKeyWord
);
router.get("/getVouchersAdmin", voucherController.getVouchersAdmin);
router.post("/AddVouchersAdmin", voucherController.AddVouchersAdmin);
router.post(
  "/DeleteVouchersAdmin",

  voucherController.DeleteVouchersAdmin
);
router.post(
  "/UpdateVouchersAdmin",

  voucherController.UpdateVouchersAdmin
);
// orders
router.get(
  "/getListOrdersAdmin",

  ordersController.getListOrdersAdmin
);
router.get(
  "/getListOrdersAdminByKeyWord",

  ordersController.getListOrdersAdminByKeyWord
);
router.get("/getOrdersAdmin", ordersController.getOrdersAdmin);
router.post(
  "/UpdateOrdersAdmin",

  ordersController.UpdateOrdersAdmin
);

//  client
// categories
router.get("/getListCategories", categoriesClientController.getListCategories);
// Profile
router.post("/UpdateUser", profileClientController.UpdateUser);
router.post("/UpdatePassword", profileClientController.UpdatePassword);

router.get("/getListOrdersClient", profileClientController.getListOrdersClient);
router.get("/getAddressById", profileClientController.getAddressById);
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
router.get(
  "/getListProductsSaleDescClient",
  productsClientController.getListProductsSaleDescClient
);
router.get(
  "/getListProductsCreateDescClient",
  productsClientController.getListProductsCreateDescClient
);
router.get(
  "/getListProductsSaleClient",
  productsClientController.getListProductsSaleClient
);
router.get("/getProductDetail", productsClientController.getProductDetail);
router.get(
  "/getProductSameIdCategories",
  productsClientController.getProductSameIdCategories
);
router.get("/getProductFavorite", productsClientController.getProductFavorite);
router.post("/addProductFavorite", productsClientController.addProductFavorite);

router.get(
  "/getListProductFavoriteByUser",
  productsClientController.getListProductFavoriteByUser
);

router.get("/getListCartByUser", cartsClientController.getListCartByUser);
router.post("/addProductToCart", cartsClientController.addProductToCart);
router.post("/deleteCartById", cartsClientController.deleteCartById);
router.post("/updateQuantityCart", cartsClientController.updateQuantityCart);
router.post("/getVoucherByCode", cartsClientController.getVoucherByCode);

router.post("/deleteAllCart", cartsClientController.deleteAllCart);
router.get(
  "/getProductDetailInCart",
  cartsClientController.getProductDetailInCart
);

router.post("/mergeCart", cartsClientController.mergeCart);
// comment
router.get(
  "/getCommentByIdProduct",
  commentClientController.getCommentByIdProduct
);
router.post(
  "/postCommentByIdProduct",
  commentClientController.postCommentByIdProduct
);
router.post("/checkOut", checkOut.checkOut);
router.post("/zaloPayCallback", checkOut.zaloPayCallback);
router.post("/createOrder", checkOut.createOrder);
router.post("/createOrderDetail", checkOut.createOrderDetail);
router.get("/getHistoryCart", checkOut.getHistoryCart);
router.post("/cancelOrder", checkOut.cancelOrder);

module.exports = router;
