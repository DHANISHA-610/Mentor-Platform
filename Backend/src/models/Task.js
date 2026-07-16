const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  fileType: { type: String, default: '' },
});

const submissionSchema = new mongoose.Schema({
  githubLink: { type: String, default: '' },
  notes: { type: String, default: '' },
  attachments: [attachmentSchema],
  submittedAt: Date,
});

const feedbackSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewerName: { type: String, default: '' },
  comment: { type: String, default: '' },
  status: {
    type: String,
    enum: ['approved', 'changes_requested', 'rejected'],
    default: 'changes_requested',
  },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    expectedDeliverables: {
      type: String,
      default: '',
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigneeName: {
      type: String,
      default: '',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'under_review', 'completed', 'overdue'],
      default: 'pending',
    },
    submission: submissionSchema,
    feedback: [feedbackSchema],
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusUpdatedRole: {
      type: String,
    },
    statusUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);
