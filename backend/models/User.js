const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    photo: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    dateOfBirth: { type: Date },
    address: { type: String },
    role: { 
        type: String, 
        enum: ["client", "therapist", "admin"], 
        default: "client",
        required: true 
    },
    // For therapists
    specialization: { type: String },
    experience: { type: String },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    bio: { type: String },
    availability: [{ type: String }], // Days of the week
    isActive: { type: Boolean, default: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "School" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
