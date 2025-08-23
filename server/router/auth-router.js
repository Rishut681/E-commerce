const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const { signupSchema } = require("../validatore/auth-validator");
const { loginSchema } = require("../validatore/user-validator");
const validate = require("../middlewares/validate-middleware");
const authMiddleware = require("../middlewares/auth-middleware");


router.route("/").get(authControllers.home);
router.route("/register").post(validate(signupSchema), authControllers.register);
router.route("/login").post(validate(loginSchema), authControllers.login);
router.route("/user").get(authMiddleware, authControllers.user);
router.route("/update").put(authMiddleware, authControllers.updateUser);
router.route("/change-password").put(authMiddleware, authControllers.changePassword);

module.exports = router;