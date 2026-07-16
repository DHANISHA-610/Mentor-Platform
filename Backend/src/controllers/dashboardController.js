const User = require('../models/User');
const Request = require('../models/Request');
const Task = require('../models/Task');
const Conversation = require('../models/Conversation');

const formatTimestamp = (date) => {
  if (!date) return '';
  const timestamp = new Date(date);
  const today = new Date();
  if (timestamp.toDateString() === today.toDateString()) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getDashboardData = async (req, res, next) => {
  try {
    const role = req.user.role;

    if (role === 'intern') {
      const requests = await Request.find({ requester: req.user._id })
        .sort({ createdAt: -1 })
        .populate('mentor', 'name title profileImage');
      const tasks = await Task.find({ assignee: req.user._id }).populate('mentor', 'name').sort({ createdAt: -1 });

      const activeMentors = new Set(
        requests.filter((request) => request.status === 'approved').map((request) => request.mentor.toString())
      ).size;
      const pendingRequests = requests.filter((request) => request.status === 'pending').length;
      const completedTasks = tasks.filter((task) => task.status === 'completed').length;

      const recentTasks = tasks.slice(0, 3).map((task) => ({
        ...task.toObject(),
        assignedBy: task.mentor?.name || 'Mentor',
        dueDate: task.dueDate,
        expectedDeliverables: task.expectedDeliverables || '',
        submission: task.submission || {},
        feedback: task.feedback || [],
      }));

      const recentRequests = requests.slice(0, 3);

      const conversations = await Conversation.find({ participants: req.user._id })
        .populate('participants', 'name profileImage title specialization role')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .limit(5);

      const unreadMessages = conversations.reduce((sum, conversation) => {
        const unreadInfo = (conversation.unreadCounts || []).find(
          (entry) => entry.user.toString() === req.user._id.toString()
        );
        return sum + (unreadInfo?.count || 0);
      }, 0);

      const recentConversations = conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== req.user._id.toString()
        );

        return {
          id: conversation._id.toString(),
          name: otherParticipant?.name || 'Intern',
          avatar:
            otherParticipant?.profileImage ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              otherParticipant?.name || 'chat'
            )}`,
          lastMessage: conversation.lastMessage || 'Start the conversation',
          lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
          unread: (conversation.unreadCounts || []).find(
            (entry) => entry.user.toString() === req.user._id.toString()
          )?.count || 0,
        };
      });

      return res.json({
        success: true,
        dashboard: {
          activeMentors,
          pendingRequests,
          completedTasks,
          unreadMessages,
          recentTasks,
          recentRequests,
          recentConversations,
        },
      });
    }

    if (role === 'mentor') {
      const requests = await Request.find({ mentor: req.user._id }).sort({ createdAt: -1 });
      const tasks = await Task.find({ mentor: req.user._id }).sort({ createdAt: -1 });

      const pendingRequests = requests.filter((request) => request.status === 'pending').length;
      const activeTasks = tasks.filter((task) => task.status === 'pending' || task.status === 'in_progress').length;

      const formatTaskSubmission = (task) => ({
        taskId: task._id,
        title: task.title,
        status: task.status,
        dueDate: task.dueDate,
        priority: task.priority,
        submission: task.submission?.submittedAt
          ? {
              githubLink: task.submission.githubLink,
              notes: task.submission.notes,
              attachments: task.submission.attachments || [],
              submittedAt: task.submission.submittedAt,
            }
          : null,
        feedback: task.feedback || [],
      });

      const internTaskMap = tasks.reduce((map, task) => {
        const internId = task.assignee.toString();
        if (!map[internId]) {
          map[internId] = {
            tasks: [],
            completed: 0,
            total: 0,
            submissionCount: 0,
            pendingReviewCount: 0,
            latestSubmissionDate: null,
            submissions: [],
            pendingReviewTasks: [],
          };
        }
        map[internId].tasks.push(task);
        map[internId].total += 1;
        
        if (task.status === 'completed') {
          map[internId].completed += 1;
        }

        if (task.submission?.submittedAt) {
          map[internId].submissionCount += 1;
          const submittedAt = new Date(task.submission.submittedAt);
          if (!map[internId].latestSubmissionDate || submittedAt > map[internId].latestSubmissionDate) {
            map[internId].latestSubmissionDate = submittedAt;
          }
          map[internId].submissions.push(formatTaskSubmission(task));
        }

        if (task.status === 'under_review' && task.submission?.submittedAt) {
          map[internId].pendingReviewCount += 1;
          map[internId].pendingReviewTasks.push(formatTaskSubmission(task));
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
          submissionCount: stats.submissionCount,
          pendingReviewCount: stats.pendingReviewCount,
          latestSubmissionDate: stats.latestSubmissionDate,
          submissions: stats.submissions,
          pendingReviews: stats.pendingReviewTasks,
        };
      }).slice(0, 3);

      const recentRequests = requests.slice(0, 3);
      const recentTasks = tasks.slice(0, 3);

      const conversations = await Conversation.find({ participants: req.user._id })
        .populate('participants', 'name profileImage title specialization role')
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .limit(5);

      const unreadMessages = conversations.reduce((sum, conversation) => {
        const unreadInfo = (conversation.unreadCounts || []).find(
          (entry) => entry.user.toString() === req.user._id.toString()
        );
        return sum + (unreadInfo?.count || 0);
      }, 0);

      const recentConversations = conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (participant) => participant._id.toString() !== req.user._id.toString()
        );

        return {
          id: conversation._id.toString(),
          name: otherParticipant?.name || 'Mentor',
          avatar:
            otherParticipant?.profileImage ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              otherParticipant?.name || 'chat'
            )}`,
          lastMessage: conversation.lastMessage || 'Start the conversation',
          lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
          unread: (conversation.unreadCounts || []).find(
            (entry) => entry.user.toString() === req.user._id.toString()
          )?.count || 0,
        };
      });

      return res.json({
        success: true,
        dashboard: {
          assignedInterns,
          pendingRequests,
          activeTasks,
          unreadMessages,
          recentRequests,
          recentTasks,
          recentConversations,
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

      // compute analytics dynamically from DB for admin dashboard
      const computeRangeStart = (key) => {
        const now = new Date();
        if (key === '7days') {
          return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        }
        if (key === '30days') {
          return new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        }
        if (key === '12months') {
          return new Date(now.getFullYear(), now.getMonth() - 11, 1);
        }
        return new Date(0);
      };

      const computePreviousRange = (key) => {
        const now = new Date();
        if (key === '7days') {
          const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
          return { start, end };
        }
        if (key === '30days') {
          const end = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
          return { start, end };
        }
        const end = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        const start = new Date(now.getFullYear(), now.getMonth() - 23, 1);
        return { start, end };
      };

      const buildSummaryFor = async (key) => {
        const now = new Date();
        const start = computeRangeStart(key);
        const prev = computePreviousRange(key);

        const [currentSignups, prevSignups, currentPairings, prevPairings, currentTasks, prevTasks, currentMessagesAgg, prevMessagesAgg, currentCompletedTasks, prevCompletedTasks] = await Promise.all([
          User.countDocuments({ createdAt: { $gte: start, $lte: now } }),
          User.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),
          Request.countDocuments({ createdAt: { $gte: start, $lte: now }, status: 'approved' }),
          Request.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end }, status: 'approved' }),
          Task.countDocuments({ createdAt: { $gte: start, $lte: now } }),
          Task.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end } }),
          Conversation.aggregate([
            { $unwind: '$messages' },
            { $match: { 'messages.createdAt': { $gte: start, $lte: now } } },
            { $count: 'count' },
          ]),
          Conversation.aggregate([
            { $unwind: '$messages' },
            { $match: { 'messages.createdAt': { $gte: prev.start, $lt: prev.end } } },
            { $count: 'count' },
          ]),
          Task.countDocuments({ createdAt: { $gte: start, $lte: now }, status: 'completed' }),
          Task.countDocuments({ createdAt: { $gte: prev.start, $lt: prev.end }, status: 'completed' }),
        ]);

        const currentMessagesCount = currentMessagesAgg && currentMessagesAgg[0] ? currentMessagesAgg[0].count : 0;
        const previousMessagesCount = prevMessagesAgg && prevMessagesAgg[0] ? prevMessagesAgg[0].count : 0;

        const computeTrend = (current, previous) => {
          if (previous === 0) return current === 0 ? 0 : 100;
          return Math.round(((current - previous) / previous) * 100);
        };

        const completionRate = currentTasks === 0 ? 0 : Math.round((currentCompletedTasks / currentTasks) * 100);
        const previousCompletionRate = prevTasks === 0 ? 0 : Math.round((prevCompletedTasks / prevTasks) * 100);

        return {
          signups: currentSignups,
          signupsTrend: computeTrend(currentSignups, prevSignups),
          pairings: currentPairings,
          pairingsTrend: computeTrend(currentPairings, prevPairings),
          tasks: currentTasks,
          tasksTrend: computeTrend(currentTasks, prevTasks),
          messages: currentMessagesCount,
          messagesTrend: computeTrend(currentMessagesCount, previousMessagesCount),
          completionRate,
          completionRateTrend: computeTrend(completionRate, previousCompletionRate),
        };
      };

      const buildMonthlyGrowth = async () => {
        const now = new Date();
        const results = [];
        for (let m = 5; m >= 0; m--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
          const [newUsers, newMentors, newInterns] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: monthStart, $lt: monthEnd } }),
            User.countDocuments({ role: 'mentor', createdAt: { $gte: monthStart, $lt: monthEnd } }),
            User.countDocuments({ role: 'intern', createdAt: { $gte: monthStart, $lt: monthEnd } }),
          ]);
          results.push({
            month: monthStart.toLocaleString([], { month: 'short' }),
            newUsers,
            newMentors,
            newInterns,
          });
        }
        return results;
      };

      const buildTimeline = async (key) => {
        const now = new Date();
        const start = computeRangeStart(key);
        const timeline = [];
        const bucketDates = [];

        if (key === '7days') {
          for (let i = 0; i < 7; i++) {
            const bucketStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            const bucketEnd = new Date(bucketStart.getFullYear(), bucketStart.getMonth(), bucketStart.getDate() + 1);
            bucketDates.push({ label: bucketStart.toLocaleDateString([], { weekday: 'short' }), start: bucketStart, end: bucketEnd });
          }
        } else if (key === '30days') {
          for (let w = 0; w < 4; w++) {
            const bucketStart = new Date(start.getTime() + w * 7 * 24 * 60 * 60 * 1000);
            const bucketEnd = new Date(bucketStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            bucketDates.push({ label: `Week ${w + 1}`, start: bucketStart, end: bucketEnd });
          }
        } else {
          for (let m = 5; m >= 0; m--) {
            const bucketStart = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const bucketEnd = new Date(bucketStart.getFullYear(), bucketStart.getMonth() + 1, 1);
            bucketDates.push({ label: bucketStart.toLocaleString([], { month: 'short' }), start: bucketStart, end: bucketEnd });
          }
        }

        for (const bucket of bucketDates) {
          const [newUsers, tasksCreated, tasksCompleted] = await Promise.all([
            User.countDocuments({ createdAt: { $gte: bucket.start, $lt: bucket.end } }),
            Task.countDocuments({ createdAt: { $gte: bucket.start, $lt: bucket.end } }),
            Task.countDocuments({ updatedAt: { $gte: bucket.start, $lt: bucket.end }, status: 'completed' }),
          ]);
          timeline.push({ day: bucket.label, newUsers, tasksCreated, tasksCompleted });
        }

        return timeline;
      };

      const buildPathways = async () => {
        const pathwayAgg = await User.aggregate([
          { $match: { specialization: { $ne: '' } } },
          { $group: { _id: '$specialization', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);
        const total = pathwayAgg.reduce((sum, item) => sum + item.count, 0) || 1;
        return pathwayAgg.slice(0, 4).map((item) => ({ name: item._id, count: item.count, percentage: Math.round((item.count / total) * 100) }));
      };

      const buildTaskStatusDistribution = async () => {
        const tasks = await Task.find({}).lean();
        const statusCounts = {
          pending: 0,
          in_progress: 0,
          under_review: 0,
          changes_requested: 0,
          completed: 0,
          overdue: 0,
        };

        for (const task of tasks) {
          const latestFeedback = task.feedback?.[task.feedback.length - 1];
          if (latestFeedback?.status === 'changes_requested') {
            statusCounts.changes_requested += 1;
            continue;
          }
          statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        }

        return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
      };

      const buildRecentActivities = async () => {
        const [recentRequests, recentTasks, recentUsers] = await Promise.all([
          Request.find().sort({ updatedAt: -1 }).limit(5).lean(),
          Task.find().sort({ updatedAt: -1 }).populate('mentor', 'name').populate('assignee', 'name').lean(),
          User.find().sort({ createdAt: -1 }).limit(5).lean(),
        ]);

        const activities = [];

        recentTasks.forEach((task) => {
          if (task.submission?.submittedAt) {
            activities.push({
              label: `${task.assignee?.name || 'Intern'} submitted ${task.title}`,
              date: task.submission.submittedAt,
            });
          }
          const latestFeedback = task.feedback?.[task.feedback.length - 1];
          if (latestFeedback) {
            activities.push({
              label: `Mentor ${task.mentor?.name || 'Mentor'} updated ${task.title}`,
              date: task.updatedAt || task.createdAt,
            });
          }
        });

        recentRequests.forEach((request) => {
          if (request.status === 'approved') {
            activities.push({ label: `Mentorship request accepted by ${request.mentorName || 'mentor'}`, date: request.responseDate || request.updatedAt || request.createdAt });
          } else if (request.status === 'rejected') {
            activities.push({ label: `Mentorship request rejected by ${request.mentorName || 'mentor'}`, date: request.responseDate || request.updatedAt || request.createdAt });
          }
        });

        recentUsers.forEach((user) => {
          activities.push({ label: `New ${user.role} registered: ${user.name}`, date: user.createdAt });
        });

        return activities
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 6);
      };

      const buildTopMentors = async () => {
        const tasks = await Task.find({}).populate('mentor', 'name').populate('assignee', 'name').lean();
        const mentorMap = {};

        tasks.forEach((task) => {
          const mentorId = task.mentor?._id?.toString();
          if (!mentorId) return;
          mentorMap[mentorId] = mentorMap[mentorId] || { name: task.mentor.name, assignedInterns: new Set(), completedTasks: 0, totalTasks: 0, successCount: 0 };
          mentorMap[mentorId].totalTasks += 1;
          if (task.status === 'completed') {
            mentorMap[mentorId].completedTasks += 1;
          }
          if (task.assignee?.name) {
            mentorMap[mentorId].assignedInterns.add(task.assignee.name);
          }
          const latestFeedback = task.feedback?.[task.feedback.length - 1];
          if (latestFeedback?.status === 'approved') {
            mentorMap[mentorId].successCount += 1;
          }
        });

        return Object.values(mentorMap)
          .map((mentor) => ({
            name: mentor.name,
            assignedInterns: mentor.assignedInterns.size,
            completedTasks: mentor.completedTasks,
            averageRating: Number((mentor.successCount ? 4 + (mentor.successCount / mentor.totalTasks) * 0.5 : 3.5).toFixed(1)),
            successRate: mentor.totalTasks === 0 ? 0 : Math.round((mentor.completedTasks / mentor.totalTasks) * 100),
          }))
          .sort((a, b) => b.completedTasks - a.completedTasks)
          .slice(0, 5);
      };

      const buildTopInterns = async () => {
        const tasks = await Task.find({}).populate('mentor', 'name').populate('assignee', 'name').lean();
        const internMap = {};

        tasks.forEach((task) => {
          const internId = task.assignee?._id?.toString();
          if (!internId) return;
          internMap[internId] = internMap[internId] || { name: task.assignee.name, completedTasks: 0, activeTasks: 0, totalTasks: 0, lastSubmission: null };
          internMap[internId].totalTasks += 1;
          if (task.status === 'completed') internMap[internId].completedTasks += 1;
          if (['pending', 'in_progress', 'under_review'].includes(task.status)) internMap[internId].activeTasks += 1;
          if (task.submission?.submittedAt && (!internMap[internId].lastSubmission || new Date(task.submission.submittedAt) > new Date(internMap[internId].lastSubmission))) {
            internMap[internId].lastSubmission = task.submission.submittedAt;
          }
        });

        return Object.values(internMap)
          .map((intern) => ({
            name: intern.name,
            completedTasks: intern.completedTasks,
            activeTasks: intern.activeTasks,
            successRate: intern.totalTasks === 0 ? 0 : Math.round((intern.completedTasks / intern.totalTasks) * 100),
            lastSubmission: intern.lastSubmission,
          }))
          .sort((a, b) => b.completedTasks - a.completedTasks)
          .slice(0, 5);
      };

      const buildCareerInsights = async () => {
        const skillAgg = await User.aggregate([
          { $unwind: '$skills' },
          { $group: { _id: '$skills', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const pathwayAgg = await User.aggregate([
          { $match: { specialization: { $ne: '' } } },
          { $group: { _id: '$specialization', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const totalPathways = pathwayAgg.length;
        const totalInterns = await User.countDocuments({ role: 'intern', specialization: { $ne: '' } });

        return {
          mostPopularSkill: skillAgg[0]?._id || 'N/A',
          fastestGrowingPathway: pathwayAgg[0]?._id || 'N/A',
          leastSelectedPathway: pathwayAgg[pathwayAgg.length - 1]?._id || 'N/A',
          averageInternsPerPathway: totalPathways === 0 ? 0 : Math.round(totalInterns / totalPathways),
        };
      };

      const [analytics, monthlyGrowth, taskStatusDistribution, recentActivities, topMentors, topInterns, careerInsights] = await Promise.all([
        (async () => ({
          '7days': await buildSummaryFor('7days'),
          '30days': await buildSummaryFor('30days'),
          '12months': await buildSummaryFor('12months'),
        }))(),
        buildMonthlyGrowth(),
        buildTaskStatusDistribution(),
        buildRecentActivities(),
        buildTopMentors(),
        buildTopInterns(),
        buildCareerInsights(),
      ]);

      const timeline = {
        '7days': await buildTimeline('7days'),
        '30days': await buildTimeline('30days'),
        '12months': await buildTimeline('12months'),
      };

      const pathways = await buildPathways();

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
          timeline,
          pathways,
          monthlyGrowth,
          taskStatusDistribution,
          recentActivities,
          topMentors,
          topInterns,
          careerInsights,
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