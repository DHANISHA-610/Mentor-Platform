const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterName: {
      type: String,
      default: '',
    },
    requesterAvatar: {
      type: String,
      default: '',
    },
    requesterField: {
      type: String,
      default: '',
    },
    requesterSkills: {
      type: [String],
      default: [],
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentorName: {
      type: String,
      default: '',
    },
    mentorTitle: {
      type: String,
      default: '',
    },
    mentorAvatar: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    sentDate: {
      type: Date,
      default: Date.now,
    },
    responseDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Request', requestSchema);
