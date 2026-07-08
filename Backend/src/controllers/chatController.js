const Task = require('../models/Task');
const Request = require('../models/Request');
const User = require('../models/User');

const getConversations = async (req, res, next) => {
  try {
    const role = req.user.role;
    const currentUser = req.user;
    const buildConversation = (person, roleName, lastMessage, time, unread = 0, online = true) => ({
      id: person._id.toString(),
      name: person.name,
      avatar:
        person.profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name)}`,
      role: roleName,
      online,
      unread,
      lastMessage,
      lastMessageTime: time,
      messages: [
        {
          id: `${person._id}-1`,
          sender: role === 'mentor' ? 'You' : person.name,
          text: role === 'mentor'
            ? `Hi ${person.name}, I wanted to check in on your latest task.`
            : `Hi ${person.name}, thanks for agreeing to mentor me!`,
          time: '9:05 AM',
          isOwn: role === 'mentor',
        },
        {
          id: `${person._id}-2`,
          sender: role === 'mentor' ? person.name : 'You',
          text: lastMessage,
          time,
          isOwn: role !== 'mentor',
        },
      ],
    });

    let conversations = [];

    if (role === 'mentor') {
      const tasks = await Task.find({ mentor: currentUser._id })
        .populate('assignee', 'name profileImage specialization')
        .sort({ createdAt: -1 })
        .limit(5);

      const internMap = new Map();
      tasks.forEach((task) => {
        if (task.assignee) {
          const internId = task.assignee._id.toString();
          if (!internMap.has(internId)) {
            internMap.set(
              internId,
              buildConversation(
                task.assignee,
                task.assignee.specialization || 'Intern',
                `I reviewed your task "${task.title}" and left some notes.`,
                '10:30 AM',
                task.status !== 'completed' ? 1 : 0,
                true
              )
            );
          }
        }
      });

      if (internMap.size === 0) {
        const requests = await Request.find({ mentor: currentUser._id, status: 'approved' })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate('requester', 'name profileImage specialization');

        requests.forEach((request) => {
          if (request.requester) {
            const internId = request.requester._id.toString();
            if (!internMap.has(internId)) {
              internMap.set(
                internId,
                buildConversation(
                  request.requester,
                  request.requester.specialization || 'Intern',
                  'Looking forward to our next mentoring session.',
                  'Yesterday',
                  0,
                  true
                )
              );
            }
          }
        });
      }

      conversations = Array.from(internMap.values());
    } else if (role === 'intern') {
      const requests = await Request.find({ requester: currentUser._id, status: 'approved' })
        .populate('mentor', 'name profileImage title')
        .sort({ createdAt: -1 })
        .limit(5);

      const mentorMap = new Map();
      requests.forEach((request) => {
        if (request.mentor) {
          const mentorId = request.mentor._id.toString();
          if (!mentorMap.has(mentorId)) {
            mentorMap.set(
              mentorId,
              buildConversation(
                request.mentor,
                request.mentor.title || 'Mentor',
                'Thanks for your latest update — I will review it shortly.',
                '11:00 AM',
                0,
                true
              )
            );
          }
        }
      });

      if (mentorMap.size === 0) {
        const mentors = await User.find({ role: 'mentor', approved: true, profileCompleted: true })
          .sort({ createdAt: -1 })
          .limit(3);

        mentors.forEach((mentor, index) => {
          mentorMap.set(
            mentor._id.toString(),
            buildConversation(
              mentor,
              mentor.title || 'Mentor',
              'Welcome to the mentorship platform — let me know how I can help.',
              index === 0 ? 'Today' : 'Yesterday',
              index === 0 ? 2 : 0,
              true
            )
          );
        });
      }

      conversations = Array.from(mentorMap.values());
    } else {
      conversations = [];
    }

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
};
