const User = require('../models/User');

const getInterns = async (req, res, next) => {
  try {
    const interns = await User.find({ role: 'intern' }, { password: 0 }).sort({ createdAt: -1 });

    const transformedInterns = interns.map((intern) => ({
      _id: intern._id,
      name: intern.name,
      email: intern.email,
      avatar: intern.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=intern',
      title: intern.title || 'Intern',
      profileCompleted: intern.profileCompleted || false,
    }));

    res.json({ success: true, interns: transformedInterns });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterns,
};
