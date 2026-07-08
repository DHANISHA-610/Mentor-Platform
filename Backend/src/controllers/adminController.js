const User = require('../models/User');

const getPendingMentorApplications = async (req, res, next) => {
  try {
    const applications = await User.find(
      {
        role: 'mentor',
        approved: false,
        profileCompleted: true,
      },
      { password: 0 }
    ).sort({ createdAt: -1 });

    const transformed = applications.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      title: user.title || '',
      company: user.company || '',
      experience: user.experience || '',
      skills: user.skills || [],
      bio: user.bio || '',
      profileImage: user.profileImage || '',
      linkedin: user.linkedin || '',
      portfolio: user.portfolio || '',
      resume: user.resume || '',
      certifications: user.certifications || [],
      location: user.location || '',
      specialization: user.specialization || '',
      availability: user.availability || 'Available',
      appliedDate: user.createdAt?.toISOString().split('T')[0] || '',
    }));

    res.json({ success: true, applications: transformed });
  } catch (error) {
    next(error);
  }
};

const reviewMentorApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    const user = await User.findById(id);
    if (!user || user.role !== 'mentor') {
      res.status(404);
      throw new Error('Mentor application not found');
    }

    if (action === 'approve') {
      user.approved = true;
      user.rejectionReason = '';
    } else if (action === 'reject') {
      user.approved = false;
      user.rejectionReason = rejectionReason || 'No reason provided';
    } else {
      res.status(400);
      throw new Error('Invalid action');
    }

    await user.save();

    res.json({ success: true, message: `Mentor application ${action}d successfully` });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });

    const transformed = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.role === 'mentor' ? (user.approved ? 'active' : 'inactive') : 'active',
      joinedDate: user.createdAt?.toISOString().split('T')[0] || '',
      avatar: user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
    }));

    res.json({ success: true, users: transformed });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingMentorApplications,
  reviewMentorApplication,
  getUsers,
};
