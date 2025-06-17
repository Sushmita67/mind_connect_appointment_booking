const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true }, // e.g., "60 min"
    price: { type: Number, required: true },
    icon: { type: String }, // emoji or icon
    image: { type: String }, // path to session image
    features: [{ type: String }], // array of features
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Session", SessionSchema); 