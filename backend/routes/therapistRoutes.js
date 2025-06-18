const express = require("express");
const router = express.Router();
const { 
    getAllTherapists,
    getTherapistById,
    createTherapist,
    updateTherapist,
    deleteTherapist,
    getTherapistAvailability
} = require("../controllers/therapistController");
const { authenticateToken, authorizeRole } = require("../security/Auth");

// Public routes
router.get("/", getAllTherapists);
router.get("/:id", getTherapistById);
router.get("/:id/availability", getTherapistAvailability);

// Admin only routes
router.post("/", authenticateToken, authorizeRole(["admin"]), createTherapist);
router.put("/:id", authenticateToken, updateTherapist); // Admin or therapist themselves
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), deleteTherapist);

module.exports = router; 