const mongoose = require("mongoose");

const connectDB = async() => {
    if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be configured before the application can start.');
    }

    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully");
};

module.exports = connectDB;
