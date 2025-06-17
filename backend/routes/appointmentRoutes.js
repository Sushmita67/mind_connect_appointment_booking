const express = require("express");
const router = express.Router();
const { 
    createAppointment,
    getUserAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    rescheduleAppointment,
    updateAppointmentDateTime,
    cancelAppointment,
    getTherapistAppointments,
    getAllAppointments
} = require("../controllers/appointmentController");
const { authenticateToken, authorizeRole, authenticateTokenOptional } = require("../security/Auth");

// Public/optional auth route (for guest and logged-in bookings)
router.post("/", authenticateTokenOptional, createAppointment);

// Protected routes
router.get("/user", authenticateToken, getUserAppointments);
router.get("/therapist", authenticateToken, authorizeRole(["therapist"]), getTherapistAppointments);
router.get("/:id", authenticateToken, getAppointmentById);
router.put("/:id/status", authenticateToken, updateAppointmentStatus);
router.put("/:id/reschedule", authenticateToken, rescheduleAppointment);
router.patch("/:id/datetime", authenticateToken, updateAppointmentDateTime);
router.put("/:id/cancel", authenticateToken, cancelAppointment);

// Admin only routes
router.get("/", authenticateToken, authorizeRole(["admin"]), getAllAppointments);

module.exports = router; 