const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    image: {
        type: String,
        default: null,
    },

    startDate: {
        type: Date,
        default: Date.now,
    },


}, {
    timestamps: true,
});

module.exports = mongoose.model("Announcement", announcementSchema);
