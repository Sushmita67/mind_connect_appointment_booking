const User = require("../models/User");

// Get all active therapists
const getAllTherapists = async (req, res) => {
    try {
        const therapists = await User.find({ 
            role: 'therapist', 
            isActive: true 
        }).select('-password');

        res.status(200).json({
            success: true,
            data: therapists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching therapists",
            error: error.message
        });
    }
};

// Get therapist by ID
const getTherapistById = async (req, res) => {
    try {
        const therapist = await User.findById(req.params.id)
            .select('-password');

        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        res.status(200).json({
            success: true,
            data: therapist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching therapist",
            error: error.message
        });
    }
};

// Create new therapist (admin only)
const createTherapist = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            phone, 
            specialization, 
            experience, 
            bio, 
            availability 
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const therapist = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'therapist',
            specialization,
            experience,
            bio,
            availability,
            rating: 0,
            reviews: 0,
            isActive: true
        });

        await therapist.save();

        const therapistData = therapist.toObject();
        delete therapistData.password;

        res.status(201).json({
            success: true,
            message: "Therapist created successfully",
            data: therapistData
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating therapist",
            error: error.message
        });
    }
};

// Update therapist (admin or therapist themselves)
const updateTherapist = async (req, res) => {
    try {
        const therapistId = req.params.id;
        const { 
            name, 
            phone, 
            specialization, 
            experience, 
            bio, 
            availability,
            isActive 
        } = req.body;

        // Check permissions
        if (req.user.role !== 'admin' && req.user.id !== therapistId) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const updateData = {
            name,
            phone,
            specialization,
            experience,
            bio,
            availability
        };

        // Only admin can update isActive status
        if (req.user.role === 'admin' && isActive !== undefined) {
            updateData.isActive = isActive;
        }

        const therapist = await User.findByIdAndUpdate(
            therapistId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Therapist updated successfully",
            data: therapist
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating therapist",
            error: error.message
        });
    }
};

// Delete therapist (admin only)
const deleteTherapist = async (req, res) => {
    try {
        const therapist = await User.findByIdAndDelete(req.params.id);
        
        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Therapist deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting therapist",
            error: error.message
        });
    }
};

// Get therapist availability
const getTherapistAvailability = async (req, res) => {
    try {
        const therapistId = req.params.id;
        const { date } = req.query;

        const therapist = await User.findById(therapistId)
            .select('availability name');

        if (!therapist || therapist.role !== 'therapist') {
            return res.status(404).json({
                success: false,
                message: "Therapist not found"
            });
        }

        // Get booked appointments for the date
        const Appointment = require("../models/Appointment");
        const bookedAppointments = await Appointment.find({
            therapist: therapistId,
            date: new Date(date),
            status: { $in: ['pending', 'confirmed'] }
        }).select('time');

        const bookedTimes = bookedAppointments.map(apt => apt.time);

        // Available times (you can customize this based on your business hours)
        const availableTimes = [
            '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
            '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
        ];

        const availableSlots = availableTimes.filter(time => !bookedTimes.includes(time));

        res.status(200).json({
            success: true,
            data: {
                therapist: {
                    name: therapist.name,
                    availability: therapist.availability
                },
                availableSlots,
                bookedSlots: bookedTimes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching therapist availability",
            error: error.message
        });
    }
};

module.exports = {
    getAllTherapists,
    getTherapistById,
    createTherapist,
    updateTherapist,
    deleteTherapist,
    getTherapistAvailability
}; 