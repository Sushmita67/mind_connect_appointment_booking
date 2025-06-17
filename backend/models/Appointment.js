const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
    client: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false // Optional for guest bookings
    },
    therapist: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    session: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Session", 
        required: true 
    },
    date: { type: Date, required: true },
    time: { type: String, required: true }, // e.g., "10:00 AM"
    duration: { type: Number, required: true }, // e.g., 60 (minutes)
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "completed", "cancelled"], 
        default: "pending" 
    },
    price: { type: Number, required: true },
    location: { type: String, default: "Virtual Session" }, // Virtual or In-Person
    paymentMethod: { type: String },
    paymentStatus: { 
        type: String, 
        enum: ["pending", "paid", "refunded"], 
        default: "pending" 
    },
    // For guest bookings (when user is not logged in)
    guestInfo: {
        name: { type: String },
        email: { type: String },
        phone: { type: String }
    },
    notes: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", AppointmentSchema); 