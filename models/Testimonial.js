const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, trim: true, maxlength: 2000 },
  image: { type: String, trim: true, default: '' },
  date: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
