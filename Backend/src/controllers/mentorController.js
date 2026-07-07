const User = require('../models/User');

const seedMentorProfiles = [
  {
    name: 'Sarah Chen',
    email: 'sarah.mentor@example.com',
    password: 'password123',
    role: 'mentor',
    approved: true,
    profileCompleted: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    title: 'Senior Software Engineer',
    company: 'Google',
    skills: ['React', 'TypeScript', 'System Design', 'Node.js'],
    bio: '10+ years building scalable web applications. Passionate about mentoring junior developers.',
    experience: '10+ years',
    location: 'San Francisco, CA',
    availability: 'Available',
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus.mentor@example.com',
    password: 'password123',
    role: 'mentor',
    approved: true,
    profileCompleted: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    title: 'Product Manager',
    company: 'Microsoft',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Roadmapping'],
    bio: 'Led product teams at Fortune 500 companies. Love helping aspiring PMs break into tech.',
    experience: '8+ years',
    location: 'Seattle, WA',
    availability: 'Available',
  },
  {
    name: 'Elena Rodriguez',
    email: 'elena.mentor@example.com',
    password: 'password123',
    role: 'mentor',
    approved: true,
    profileCompleted: true,
    profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
    title: 'UX Design Lead',
    company: 'Airbnb',
    skills: ['UI/UX', 'Figma', 'Design Systems', 'User Testing'],
    bio: 'Award-winning designer focused on creating delightful user experiences.',
    experience: '7+ years',
    location: 'Remote',
    availability: 'Available',
  },
];

const ensureSeedData = async () => {
  const count = await User.countDocuments({ role: 'mentor', approved: true, profileCompleted: true });
  if (count === 0) {
    await User.insertMany(seedMentorProfiles);
  }
};

const getMentors = async (req, res, next) => {
  try {
    await ensureSeedData();

    const { search, skills, available } = req.query;
    const filter = {
      role: 'mentor',
      approved: true,
      profileCompleted: true,
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { company: searchRegex },
        { bio: searchRegex },
        { skills: { $in: [searchRegex] } },
      ];
    }

    if (skills) {
      const skillList = skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      if (skillList.length > 0) {
        filter.skills = { $all: skillList };
      }
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    const mentors = await User.find(filter, { password: 0 }).sort({ createdAt: -1 });
    const transformedMentors = mentors.map((mentor) => ({
      _id: mentor._id,
      name: mentor.name,
      title: mentor.title || 'Mentor',
      company: mentor.company || 'Unknown',
      avatar: mentor.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor',
      skills: mentor.skills || [],
      rating: 4.8,
      reviews: 24,
      available: mentor.availability !== 'Busy',
      bio: mentor.bio || '',
      location: mentor.location || 'Remote',
      experience: mentor.experience || '',
      linkedin: mentor.linkedin || '',
      portfolio: mentor.portfolio || '',
      resume: mentor.resume || '',
      certifications: mentor.certifications || [],
      specialization: mentor.specialization || '',
    }));

    res.json({ success: true, mentors: transformedMentors });
  } catch (error) {
    next(error);
  }
};

const getMentorById = async (req, res, next) => {
  try {
    await ensureSeedData();

    const mentor = await User.findOne({ _id: req.params.id, role: 'mentor', approved: true, profileCompleted: true }, { password: 0 });
    if (!mentor) {
      res.status(404);
      throw new Error('Mentor not found');
    }

    const transformedMentor = {
      _id: mentor._id,
      name: mentor.name,
      title: mentor.title || 'Mentor',
      company: mentor.company || 'Unknown',
      avatar: mentor.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor',
      skills: mentor.skills || [],
      rating: 4.8,
      reviews: 24,
      available: mentor.availability !== 'Busy',
      bio: mentor.bio || '',
      location: mentor.location || 'Remote',
      experience: mentor.experience || '',
      linkedin: mentor.linkedin || '',
      portfolio: mentor.portfolio || '',
      resume: mentor.resume || '',
      certifications: mentor.certifications || [],
      specialization: mentor.specialization || '',
    };

    res.json({ success: true, mentor: transformedMentor });
  } catch (error) {
    next(error);
  }
};

const getAllSkills = async (req, res, next) => {
  try {
    await ensureSeedData();

    const mentors = await User.find({ role: 'mentor', approved: true, profileCompleted: true }, { skills: 1, _id: 0 });
    const skills = [...new Set(mentors.flatMap((mentor) => mentor.skills || []))].sort();

    res.json({ success: true, skills });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMentors,
  getMentorById,
  getAllSkills,
};
