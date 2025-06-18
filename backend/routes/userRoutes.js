const express = require("express");
const router = express.Router();
const upload = require("../middleware/fileUploads"); // Import multer middleware

const {
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    getUserById,
    getUserByEmail,
    getUsersByRole,
    updateUserPut,
    updateUserPatch,
    deleteUser,
} = require("../controllers/userController");

const { authenticateToken, authorizeRole } = require("../security/Auth");
const {uploadImage} = require("../controllers/imageController");

router.post("/upload", upload, uploadImage);

// Profile routes (authenticated users)
router.get("/profile", authenticateToken, getUserProfile);
router.put("/profile", authenticateToken, upload, updateUserProfile);

// Get all users (Admin Only)
router.get("/", authenticateToken, authorizeRole(["admin"]), getAllUsers);

// Get user by ID
router.get("/:id", authenticateToken, getUserById);

// Get user by Email
router.get("/email/:email", authenticateToken, getUserByEmail);

// Get users by Role
router.get("/role/:role", authenticateToken, getUsersByRole);

// Update user by ID using PUT (Full Update)
router.put("/:id", authenticateToken, upload, updateUserPut);

// Partially update user by ID using PATCH
router.patch("/:id", authenticateToken, upload, updateUserPatch);

// Delete user by ID (Admin Only)
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), deleteUser);

module.exports = router;
