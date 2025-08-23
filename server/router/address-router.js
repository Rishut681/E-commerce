const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");
const addressController = require("../controllers/address-controller");

// All routes require login
router.get("/", authMiddleware, addressController.getAddresses);
router.post("/", authMiddleware, addressController.addAddress);
router.put("/:addressId", authMiddleware, addressController.updateAddress);
router.delete("/:addressId", authMiddleware, addressController.deleteAddress);

module.exports = router;
