const express = require("express");
const router = express.Router();
const { login, register, registerMobile, resetPasswordRequest, resetPassword, validateSession} = require("../controllers/authController");
const { authenticateToken, authorizeRole} = require("../security/Auth");
const upload = require("../middleware/fileUploads");
const {uploadImage} = require("../controllers/imageController");

router.post("/login", login);
router.post("/register", upload, register);

router.post("/upload", upload, uploadImage);


router.get("/validate-session", authenticateToken, validateSession);


router.post("/reset-password-request", resetPasswordRequest);

router.post("/reset-password", resetPassword);


module.exports = router;
