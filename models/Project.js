const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  category: {
    type: String,
    required: true,
    enum: ['ongoing', 'rental', 'completed', 'sale', 'commercial', 'other'],
    default: 'ongoing'
  },
  status: { type: String, trim: true, maxlength: 80, default: 'Available' },
  shortDescription: { type: String, required: true, trim: true, maxlength: 320 },
  description: { type: String, required: true, trim: true, maxlength: 6000 },
  location: { type: String, required: true, trim: true, maxlength: 180 },
  propertyType: { type: String, trim: true, maxlength: 100 },
  bedrooms: { type: Number, min: 0, max: 100 },
  bathrooms: { type: Number, min: 0, max: 100 },
  area: { type: Number, min: 0 },
  areaUnit: { type: String, trim: true, maxlength: 30, default: 'sq ft' },
  featuredImage: { type: String, trim: true, default: '' },
  gallery: [{ type: String, trim: true }],
  features: [{ type: String, trim: true, maxlength: 160 }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

projectSchema.pre('validate', function createSlug() {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

module.exports = mongoose.model('Project', projectSchema);
