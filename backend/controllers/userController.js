const User = require("../models/User");
const bcrypt = require("bcryptjs");
const transporter = require("../middleware/mailConfig");

// Get All Users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ 
            success: true,
            data: users 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching users",
            error: err.message 
        });
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        res.json({ 
            success: true,
            data: user 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching profile",
            error: err.message 
        });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    try {
        const { name, phone, dateOfBirth, address } = req.body;
        
        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;
        if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
        if (address) updateFields.address = address;

        // Handle photo upload if present
        if (req.file) {
            updateFields.photo = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updateFields,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.json({ 
            success: true,
            message: "Profile updated successfully",
            data: updatedUser 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            message: "Error updating profile",
            error: err.message 
        });
    }
};

// Get User by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        res.json({ 
            success: true,
            data: user 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching user",
            error: err.message 
        });
    }
};

// Get User by Email
const getUserByEmail = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email }).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }
        res.json({ 
            success: true,
            data: user 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching user",
            error: err.message 
        });
    }
};

// Get Users by Role
const getUsersByRole = async (req, res) => {
    try {
        const users = await User.find({ role: req.params.role }).select('-password');
        res.json({ 
            success: true,
            data: users 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching users",
            error: err.message 
        });
    }
};

// Update User using PUT (Full Update)
const updateUserPut = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Hash password if provided
        let hashedPassword;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Check if file is uploaded
        const photo = req.file ? req.file.filename : undefined;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                password: hashedPassword || undefined, // Only update if provided
                role,
                photo: photo || undefined // Only update if provided
            },
            { new: true, overwrite: true } // Overwrites existing user data
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.json({ 
            success: true,
            message: "User updated successfully",
            data: updatedUser 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            message: "Error updating user",
            error: err.message 
        });
    }
};

// Update User using PATCH (Partial Update)
const updateUserPatch = async (req, res) => {
    try {
        const updateFields = { ...req.body };

        // Hash password if provided
        if (updateFields.password) {
            const salt = await bcrypt.genSalt(10);
            updateFields.password = await bcrypt.hash(updateFields.password, salt);
        }

        // Check if file is uploaded
        if (req.file) {
            updateFields.photo = req.file.filename;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true } // Returns the updated user
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.json({ 
            success: true,
            message: "User updated successfully",
            data: updatedUser 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            message: "Error updating user",
            error: err.message 
        });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ 
                success: false,
                message: "User not found" 
            });
        }

        res.json({ 
            success: true,
            message: "User deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Error deleting user",
            error: err.message 
        });
    }
};

module.exports = {
    getAllUsers,
    getUserProfile,
    updateUserProfile,
    getUsersByRole,
    getUserByEmail,
    getUserById,
    deleteUser,
    updateUserPatch,
    updateUserPut,
};