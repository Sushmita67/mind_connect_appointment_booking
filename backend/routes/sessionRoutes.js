const express = require("express");
const router = express.Router();
const { 
    getAllSessions, 
    getSessionById, 
    createSession, 
    updateSession, 
    deleteSession 
} = require("../controllers/sessionController");
const { authenticateToken, authorizeRole } = require("../security/Auth");

// Public routes
router.get("/", getAllSessions);
router.get("/:id", getSessionById);

// Admin only routes
router.post("/", authenticateToken, authorizeRole(["admin"]), createSession);
router.put("/:id", authenticateToken, authorizeRole(["admin"]), updateSession);
router.delete("/:id", authenticateToken, authorizeRole(["admin"]), deleteSession);

module.exports = router; 