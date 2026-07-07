const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, ...mentorFields } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      throw new Error('Name is required');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    user.name = name.trim();

    if (user.role === 'mentor') {
      const mentorFieldsToUpdate = {
        profileImage: mentorFields.profileImage || '',
        title: mentorFields.title || '',
        company: mentorFields.company || '',
        bio: mentorFields.bio || '',
        experience: mentorFields.experience || '',
        skills: mentorFields.skills || [],
        specialization: mentorFields.specialization || '',
        location: mentorFields.location || '',
        linkedin: mentorFields.linkedin || '',
        portfolio: mentorFields.portfolio || '',
        resume: mentorFields.resume || '',
        certifications: mentorFields.certifications || [],
        availability: mentorFields.availability || 'Available',
        profileCompleted: mentorFields.profileCompleted ?? user.profileCompleted,
        approved: mentorFields.approved ?? user.approved,
        rejectionReason: mentorFields.rejectionReason || '',
      };

      Object.assign(user, mentorFieldsToUpdate);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        approved: updatedUser.approved,
        profileCompleted: updatedUser.profileCompleted,
        profileImage: updatedUser.profileImage,
        title: updatedUser.title,
        company: updatedUser.company,
        bio: updatedUser.bio,
        experience: updatedUser.experience,
        skills: updatedUser.skills,
        specialization: updatedUser.specialization,
        location: updatedUser.location,
        linkedin: updatedUser.linkedin,
        portfolio: updatedUser.portfolio,
        resume: updatedUser.resume,
        certifications: updatedUser.certifications,
        availability: updatedUser.availability,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change current user password
// @route   PUT /api/profile/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error('Current and new password are required');
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const passwordMatches = await user.matchPassword(currentPassword);
    if (!passwordMatches) {
      res.status(401);
      throw new Error('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
