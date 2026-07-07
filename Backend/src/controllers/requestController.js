const Request = require('../models/Request');
const User = require('../models/User');

const createRequest = async (req, res, next) => {
  try {
    const { mentorId, message } = req.body;

    if (!mentorId) {
      res.status(400);
      throw new Error('Mentor is required');
    }

    const mentor = await User.findOne({ _id: mentorId, role: 'mentor', approved: true });
    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    const request = await Request.create({
      requester: req.user._id,
      requesterName: req.user.name,
      requesterAvatar: req.user.profileImage || '',
      requesterField: req.user.specialization || '',
      requesterSkills: req.user.skills || [],
      mentor: mentor._id,
      mentorName: mentor.name,
      mentorTitle: mentor.title || 'Mentor',
      mentorAvatar: mentor.profileImage || '',
      message: message || 'I would love to learn from you.',
      status: 'pending',
      sentDate: new Date(),
    });

    res.status(201).json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

const getRequestsForUser = async (req, res, next) => {
  try {
    const query = req.user.role === 'mentor'
      ? { mentor: req.user._id }
      : { requester: req.user._id };

    const requests = await Request.find(query).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
};

const updateRequestStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const request = await Request.findOne({ _id: req.params.id, mentor: req.user._id });

    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }

    request.status = status;
    request.responseDate = new Date();
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getRequestsForUser,
  updateRequestStatus,
};
