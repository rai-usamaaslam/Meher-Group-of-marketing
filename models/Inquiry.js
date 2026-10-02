const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 60 },
  subject: {
    type: String,
    required: true,
    enum: ['Buying a Property', 'Renting a Property', 'Selling a Property', 'Project Information', 'Investment Inquiry', 'General Question']
  },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['New', 'Contacted', 'Closed'], default: 'New' }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
