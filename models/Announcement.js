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

    type: {
        type: String,
        enum: ["deal", "announcement", "project-launch"],
        default: "announcement",
    },

    startDate: {
        type: Date,
        default: Date.now,
    },

    endDate: {
        type: Date,
        default: null,
    },

    active: {
        type: Boolean,
        default: true,
    },

    featured: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Announcement", announcementSchema);