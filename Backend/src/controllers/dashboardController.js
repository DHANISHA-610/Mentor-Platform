const User = require('../models/User');
const Request = require('../models/Request');
const Task = require('../models/Task');

const getDashboardData = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'intern') {
      const requests = await Request.find({ requester: req.user._id }).sort({ createdAt: -1 });
      const tasks = await Task.find({ assignee: req.user._id }).populate('mentor', 'name').sort({ createdAt: -1 });

      const activeMentors = new Set(
        requests.filter((request) => request.status === 'approved').map((request) => request.mentor.toString())
      ).size;
      const pendingRequests = requests.filter((request) => request.status === 'pending').length;
      const completedTasks = tasks.filter((task) => task.status === 'completed').length;

      const recentTasks = tasks.slice(0, 3).map((task) => ({
        ...task.toObject(),
        assignedBy: task.mentor?.name || 'Mentor',
      }));

      const recentRequests = requests.slice(0, 3);

      return res.json({
        success: true,
        dashboard: {
          activeMentors,
          pendingRequests,
          completedTasks,
          unreadMessages: 0,
          recentTasks,
          recentRequests,
          recentConversations: [],
        },
      });
    }

    if (role === 'mentor') {
      const requests = await Request.find({ mentor: req.user._id }).sort({ createdAt: -1 });
      const tasks = await Task.find({ mentor: req.user._id }).sort({ createdAt: -1 });

      const pendingRequests = requests.filter((request) => request.status === 'pending').length;
      const activeTasks = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length;

      const internTaskMap = tasks.reduce((map, task) => {
        const internId = task.assignee.toString();
        if (!map[internId]) {
          map[internId] = { tasks: [], completed: 0, total: 0 };
        }
        map[internId].tasks.push(task);
        map[internId].total += 1;
        if (task.status === 'completed') {
          map[internId].completed += 1;
        }
        return map;
      }, {});

      const internIds = Object.keys(internTaskMap);
      const internUsers = internIds.length > 0
        ? await User.find({ _id: { $in: internIds } }, { password: 0 })
        : [];

      const assignedInterns = internUsers.map((intern) => {
        const stats = internTaskMap[intern._id.toString()];
        const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

        return {
          id: intern._id,
          name: intern.name,
          avatar: intern.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=intern',
          field: intern.specialization || 'Intern',
          skills: intern.skills || [],
          status: stats.completed < stats.total ? 'active' : 'inactive',
          progress,
          tasksCompleted: stats.completed,
          totalTasks: stats.total,
        };
      }).slice(0, 3);

      const recentRequests = requests.slice(0, 3);
      const recentTasks = tasks.slice(0, 3);

      return res.json({
        success: true,
        dashboard: {
          assignedInterns,
          pendingRequests,
          activeTasks,
          unreadMessages: 0,
          recentRequests,
          recentTasks,
          recentConversations: [],
        },
      });
    }

    if (role === 'admin') {
      const totalUsers = await User.countDocuments();
      const adminCount = await User.countDocuments({ role: 'admin' });
      const mentorCount = await User.countDocuments({ role: 'mentor' });
      const internCount = await User.countDocuments({ role: 'intern' });
      const activePairings = await Request.countDocuments({ status: 'approved' });
      const pendingApprovals = await User.countDocuments({ role: 'mentor', approved: false, profileCompleted: true });

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const tasksThisMonth = await Task.countDocuments({ createdAt: { $gte: monthStart, $lte: now } });

      const roleCounts = {
        admin: adminCount,
        mentor: mentorCount,
        intern: internCount,
      };

      const recentUsers = await User.find({}, { password: 0 }).sort({ createdAt: -1 }).limit(5);
      const mentorApplications = await User.find(
        { role: 'mentor', approved: false, profileCompleted: true },
        { password: 0 }
      ).sort({ createdAt: -1 }).limit(3);

      const transformedRecentUsers = recentUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        role: user.role,
        status: user.approved ? 'active' : 'pending',
      }));

      const transformedApplications = mentorApplications.map((user) => ({
        id: user._id,
        name: user.name,
        avatar: user.profileImage || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentorapp',
        title: user.title || 'Mentor',
        company: user.company || '',
        status: 'pending',
      }));

      const analytics = {
        '7days': {
          signups: 18,
          pairings: 11,
          tasks: 29,
          messages: 76,
          completionRate: 72,
          weeklyActivity: [
            { day: 'Mon', value: 8 },
            { day: 'Tue', value: 12 },
            { day: 'Wed', value: 10 },
            { day: 'Thu', value: 14 },
            { day: 'Fri', value: 11 },
            { day: 'Sat', value: 9 },
            { day: 'Sun', value: 7 },
          ],
          pathways: [
            { name: 'Frontend', count: 14, percentage: 34 },
            { name: 'Backend', count: 10, percentage: 24 },
            { name: 'Product', count: 8, percentage: 19 },
            { name: 'Design', count: 7, percentage: 17 },
          ],
        },
        '30days': {
          signups: 64,
          pairings: 32,
          tasks: 112,
          messages: 312,
          completionRate: 79,
          weeklyActivity: [
            { day: 'Week 1', value: 50 },
            { day: 'Week 2', value: 62 },
            { day: 'Week 3', value: 53 },
            { day: 'Week 4', value: 48 },
          ],
          pathways: [
            { name: 'Frontend', count: 26, percentage: 35 },
            { name: 'Backend', count: 20, percentage: 27 },
            { name: 'Design', count: 16, percentage: 21 },
            { name: 'Product', count: 12, percentage: 17 },
          ],
        },
        '12months': {
          signups: 720,
          pairings: 380,
          tasks: 1340,
          messages: 3820,
          completionRate: 84,
          weeklyActivity: [
            { day: 'Jan', value: 80 },
            { day: 'Feb', value: 95 },
            { day: 'Mar', value: 88 },
            { day: 'Apr', value: 92 },
            { day: 'May', value: 104 },
            { day: 'Jun', value: 110 },
          ],
          pathways: [
            { name: 'Frontend', count: 180, percentage: 32 },
            { name: 'Backend', count: 145, percentage: 26 },
            { name: 'Product', count: 110, percentage: 20 },
            { name: 'Design', count: 90, percentage: 16 },
          ],
        },
      };

      return res.json({
        success: true,
        dashboard: {
          metrics: {
            totalUsers,
            activePairings,
            pendingApprovals,
            tasksThisMonth,
            roleCounts,
          },
          recentUsers: transformedRecentUsers,
          mentorApplications: transformedApplications,
          analytics,
        },
      });
    }

    res.status(403);
    throw new Error('Dashboard data not available for this role');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardData,
};