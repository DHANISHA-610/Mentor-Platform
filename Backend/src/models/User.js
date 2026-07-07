const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'mentor', 'intern'],
      default: 'intern',
    },
    profileImage: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    experience: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    specialization: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    linkedin: {
      type: String,
      default: '',
    },
    portfolio: {
      type: String,
      default: '',
    },
    resume: {
      type: String,
      default: '',
    },
    certifications: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      default: 'Available',
    },
    approved: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
