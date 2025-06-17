const Session = require("../models/Session");

// Get all active sessions
const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ isActive: true });
        res.status(200).json({
            success: true,
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching sessions",
            error: error.message
        });
    }
};

// Get session by ID
const getSessionById = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }
        res.status(200).json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching session",
            error: error.message
        });
    }
};

// Create new session (admin only)
const createSession = async (req, res) => {
    try {
        const { name, description, duration, price, icon, image, features } = req.body;
        
        const session = new Session({
            name,
            description,
            duration,
            price,
            icon,
            image,
            features
        });
        
        await session.save();
        
        res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating session",
            error: error.message
        });
    }
};

// Update session (admin only)
const updateSession = async (req, res) => {
    try {
        const { name, description, duration, price, icon, image, features, isActive } = req.body;
        
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { name, description, duration, price, icon, image, features, isActive },
            { new: true, runValidators: true }
        );
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Session updated successfully",
            data: session
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating session",
            error: error.message
        });
    }
};

// Delete session (admin only)
const deleteSession = async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);
        
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Session deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting session",
            error: error.message
        });
    }
};

module.exports = {
    getAllSessions,
    getSessionById,
    createSession,
    updateSession,
    deleteSession
}; 