const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Session = require("../models/Session");
const { sendEmail } = require("../middleware/mailConfig");

// Create new appointment
const createAppointment = async (req, res) => {
    try {
        const { 
            sessionId, 
            therapistId, 
            date, 
            time, 
            duration, 
            price, 
            location, 
            paymentMethod,
            guestInfo 
        } = req.body;

        // Get user info from token or guest info
        let clientId = null;
        let guestInfoData = null;
        let clientEmail = null;

        if (req.user) {
            // User is logged in
            clientId = req.user.id;
            clientEmail = req.user.email;
        } else if (guestInfo && guestInfo.email) {
            // Guest booking
            guestInfoData = guestInfo;
            clientEmail = guestInfo.email;
        } else {
            return res.status(400).json({
                success: false,
                message: "User authentication or guest email required"
            });
        }

        // Validate session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // Validate therapist exists and is active
        const therapist = await User.findById(therapistId);
        if (!therapist || therapist.role !== 'therapist' || !therapist.isActive) {
            return res.status(404).json({
                success: false,
                message: "Therapist not found or inactive"
            });
        }

        // Check if date is today or in the past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate <= today) {
            return res.status(400).json({
                success: false,
                message: "Cannot book appointments for today or past dates"
            });
        }

        // Check if date is Saturday (day 6)
        if (appointmentDate.getDay() === 6) {
            return res.status(400).json({
                success: false,
                message: "Appointments are not available on Saturdays"
            });
        }

        // Check for scheduling conflicts
        const existingAppointment = await Appointment.findOne({
            therapist: therapistId,
            date: new Date(date),
            time: time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        const appointment = new Appointment({
            client: clientId,
            therapist: therapistId,
            session: sessionId,
            date: new Date(date),
            time,
            duration,
            price,
            location: location || "Virtual Session",
            paymentMethod,
            guestInfo: guestInfoData,
            status: 'confirmed', // Mark as confirmed since payment is complete
            paymentStatus: 'paid' // Mark as paid since payment is complete
        });

        await appointment.save();

        // Populate the appointment with session and therapist details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo');

        // Send confirmation email
        try {
            const emailSubject = 'Appointment Confirmation - MindConnect';
            const emailBody = `
                <h2>Appointment Confirmation</h2>
                <p>Dear ${req.user ? req.user.name : guestInfo.name},</p>
                <p>Your appointment has been successfully booked!</p>
                
                <h3>Appointment Details:</h3>
                <ul>
                    <li><strong>Session:</strong> ${session.name}</li>
                    <li><strong>Therapist:</strong> ${therapist.name}</li>
                    <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> ${time}</li>
                    <li><strong>Duration:</strong> ${duration} minutes</li>
                    <li><strong>Price:</strong> Rs.${price}</li>
                    <li><strong>Location:</strong> ${location || "Virtual Session"}</li>
                    <li><strong>Payment Method:</strong> ${paymentMethod}</li>
                    <li><strong>Status:</strong> Confirmed</li>
                </ul>
                
                <p>Please arrive 10 minutes before your scheduled time.</p>
                <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                
                <p>Thank you for choosing MindConnect!</p>
                <p>Best regards,<br>The MindConnect Team</p>
            `;

            await sendEmail(clientEmail, emailSubject, emailBody);
        } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
            // Don't fail the appointment creation if email fails
        }

        res.status(201).json({
            success: true,
            message: "Appointment created successfully",
            data: populatedAppointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(400).json({
            success: false,
            message: "Error creating appointment",
            error: error.message
        });
    }
};

// Get user's appointments
const getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let query = { client: userId, isActive: true };
        
        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo')
            .sort({ date: -1, time: -1 });

        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message
        });
    }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo')
            .populate('client', 'name email phone');

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check if user has permission to view this appointment
        if (req.user.role !== 'admin' && 
            appointment.client.toString() !== req.user.id && 
            appointment.therapist._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointment",
            error: error.message
        });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && 
            appointment.therapist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        appointment.status = status;
        await appointment.save();

        const updatedAppointment = await Appointment.findById(appointmentId)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo')
            .populate('client', 'name email phone');

        res.status(200).json({
            success: true,
            message: "Appointment status updated successfully",
            data: updatedAppointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error updating appointment status",
            error: error.message
        });
    }
};

// Reschedule appointment (PUT - full update)
const rescheduleAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { 
            sessionId, 
            therapistId, 
            date, 
            time, 
            duration, 
            price, 
            location, 
            paymentMethod,
            guestInfo 
        } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permissions - only client, therapist, or admin can reschedule
        if (req.user.role !== 'admin' && 
            appointment.client.toString() !== req.user.id &&
            appointment.therapist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if appointment can be rescheduled
        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Appointment cannot be rescheduled"
            });
        }

        // Validate session exists
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // Validate therapist exists and is active
        const therapist = await User.findById(therapistId);
        if (!therapist || therapist.role !== 'therapist' || !therapist.isActive) {
            return res.status(404).json({
                success: false,
                message: "Therapist not found or inactive"
            });
        }

        // Check if date is today or in the past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate <= today) {
            return res.status(400).json({
                success: false,
                message: "Cannot reschedule appointments for today or past dates"
            });
        }

        // Check if date is Saturday (day 6)
        if (appointmentDate.getDay() === 6) {
            return res.status(400).json({
                success: false,
                message: "Appointments are not available on Saturdays"
            });
        }

        // Check for scheduling conflicts (excluding current appointment)
        const existingAppointment = await Appointment.findOne({
            _id: { $ne: appointmentId },
            therapist: therapistId,
            date: new Date(date),
            time: time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        // Update appointment with new details
        appointment.session = sessionId;
        appointment.therapist = therapistId;
        appointment.date = new Date(date);
        appointment.time = time;
        appointment.duration = duration;
        appointment.price = price;
        appointment.location = location || "Virtual Session";
        appointment.paymentMethod = paymentMethod;
        appointment.guestInfo = guestInfo;
        appointment.status = 'confirmed';
        appointment.paymentStatus = 'paid';

        await appointment.save();

        // Populate the appointment with session and therapist details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo')
            .populate('client', 'name email phone');

        // Send reschedule confirmation email
        try {
            const clientEmail = req.user ? req.user.email : (appointment.guestInfo ? appointment.guestInfo.email : null);
            if (clientEmail) {
                const emailSubject = 'Appointment Rescheduled - MindConnect';
                const emailBody = `
                    <h2>Appointment Rescheduled</h2>
                    <p>Dear ${req.user ? req.user.name : appointment.guestInfo.name},</p>
                    <p>Your appointment has been successfully rescheduled!</p>
                    
                    <h3>Updated Appointment Details:</h3>
                    <ul>
                        <li><strong>Session:</strong> ${session.name}</li>
                        <li><strong>Therapist:</strong> ${therapist.name}</li>
                        <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                        <li><strong>Time:</strong> ${time}</li>
                        <li><strong>Duration:</strong> ${duration} minutes</li>
                        <li><strong>Price:</strong> Rs.${price}</li>
                        <li><strong>Location:</strong> ${location || "Virtual Session"}</li>
                        <li><strong>Payment Method:</strong> ${paymentMethod}</li>
                        <li><strong>Status:</strong> Confirmed</li>
                    </ul>
                    
                    <p>Please arrive 10 minutes before your scheduled time.</p>
                    <p>If you need to make any further changes, please contact us at least 24 hours in advance.</p>
                    
                    <p>Thank you for choosing MindConnect!</p>
                    <p>Best regards,<br>The MindConnect Team</p>
                `;

                await sendEmail(clientEmail, emailSubject, emailBody);
            }
        } catch (emailError) {
            console.error('Error sending reschedule confirmation email:', emailError);
            // Don't fail the reschedule if email fails
        }

        res.status(200).json({
            success: true,
            message: "Appointment rescheduled successfully",
            data: populatedAppointment
        });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(400).json({
            success: false,
            message: "Error rescheduling appointment",
            error: error.message
        });
    }
};

// Update appointment date and time only (PATCH - partial update)
const updateAppointmentDateTime = async (req, res) => {
    try {
        const appointmentId = req.params.id;
        const { date, time } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permissions - only client, therapist, or admin can update
        if (req.user.role !== 'admin' && 
            appointment.client.toString() !== req.user.id &&
            appointment.therapist.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if appointment can be updated
        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Appointment cannot be updated"
            });
        }

        // Check if date is today or in the past
        const appointmentDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);

        if (appointmentDate <= today) {
            return res.status(400).json({
                success: false,
                message: "Cannot reschedule appointments for today or past dates"
            });
        }

        // Check if date is Saturday (day 6)
        if (appointmentDate.getDay() === 6) {
            return res.status(400).json({
                success: false,
                message: "Appointments are not available on Saturdays"
            });
        }

        // Check for scheduling conflicts (excluding current appointment)
        const existingAppointment = await Appointment.findOne({
            _id: { $ne: appointmentId },
            therapist: appointment.therapist,
            date: new Date(date),
            time: time,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "This time slot is already booked"
            });
        }

        // Update only date and time
        appointment.date = new Date(date);
        appointment.time = time;

        await appointment.save();

        // Populate the appointment with session and therapist details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('session')
            .populate('therapist', 'name email phone specialization experience rating reviews bio photo')
            .populate('client', 'name email phone');

        // Send update confirmation email
        try {
            const clientEmail = req.user ? req.user.email : (appointment.guestInfo ? appointment.guestInfo.email : null);
            if (clientEmail) {
                const emailSubject = 'Appointment Time Updated - MindConnect';
                const emailBody = `
                    <h2>Appointment Time Updated</h2>
                    <p>Dear ${req.user ? req.user.name : appointment.guestInfo.name},</p>
                    <p>Your appointment time has been updated!</p>
                    
                    <h3>Updated Appointment Details:</h3>
                    <ul>
                        <li><strong>Session:</strong> ${populatedAppointment.session.name}</li>
                        <li><strong>Therapist:</strong> ${populatedAppointment.therapist.name}</li>
                        <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                        <li><strong>Time:</strong> ${time}</li>
                        <li><strong>Duration:</strong> ${appointment.duration} minutes</li>
                        <li><strong>Price:</strong> Rs.${appointment.price}</li>
                        <li><strong>Location:</strong> ${appointment.location}</li>
                        <li><strong>Status:</strong> Confirmed</li>
                    </ul>
                    
                    <p>Please arrive 10 minutes before your scheduled time.</p>
                    <p>If you need to make any further changes, please contact us at least 24 hours in advance.</p>
                    
                    <p>Thank you for choosing MindConnect!</p>
                    <p>Best regards,<br>The MindConnect Team</p>
                `;

                await sendEmail(clientEmail, emailSubject, emailBody);
            }
        } catch (emailError) {
            console.error('Error sending update confirmation email:', emailError);
            // Don't fail the update if email fails
        }

        res.status(200).json({
            success: true,
            message: "Appointment date and time updated successfully",
            data: populatedAppointment
        });
    } catch (error) {
        console.error('Error updating appointment date and time:', error);
        res.status(400).json({
            success: false,
            message: "Error updating appointment date and time",
            error: error.message
        });
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const appointmentId = req.params.id;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && 
            appointment.client.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        // Check if appointment can be cancelled
        if (appointment.status === 'completed' || appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: "Appointment cannot be cancelled"
            });
        }

        appointment.status = 'cancelled';
        await appointment.save();

        res.status(200).json({
            success: true,
            message: "Appointment cancelled successfully"
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error cancelling appointment",
            error: error.message
        });
    }
};

// Get therapist's appointments
const getTherapistAppointments = async (req, res) => {
    try {
        const therapistId = req.user.id;
        const { status, date } = req.query;

        let query = { therapist: therapistId, isActive: true };
        
        if (status) {
            query.status = status;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('session')
            .populate('client', 'name email phone')
            .sort({ date: 1, time: 1 });

        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message
        });
    }
};

// Get all appointments (admin only)
const getAllAppointments = async (req, res) => {
    try {
        const { status, therapist, client, date } = req.query;

        let query = { isActive: true };
        
        if (status) query.status = status;
        if (therapist) query.therapist = therapist;
        if (client) query.client = client;
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        const appointments = await Appointment.find(query)
            .populate('session')
            .populate('therapist', 'name email phone')
            .populate('client', 'name email phone')
            .sort({ date: -1, time: -1 });

        res.status(200).json({
            success: true,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching appointments",
            error: error.message
        });
    }
};

module.exports = {
    createAppointment,
    getUserAppointments,
    getAppointmentById,
    updateAppointmentStatus,
    rescheduleAppointment,
    updateAppointmentDateTime,
    cancelAppointment,
    getTherapistAppointments,
    getAllAppointments
}; 