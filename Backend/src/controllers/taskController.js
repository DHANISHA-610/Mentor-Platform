const Task = require('../models/Task');
const User = require('../models/User');

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

const normalizeTaskResponse = (task) => ({
  ...task.toObject(),
  mentorName: task.mentor?.name || task.assigneeName || 'Mentor',
});

const getInternSubmissionsForMentor = async (req, res, next) => {
  try {
    if (req.user.role !== 'mentor') {
      res.status(403);
      throw new Error('Only mentors can access intern submissions');
    }

    const tasks = await Task.find({ mentor: req.user._id })
      .populate('assignee', 'name profileImage specialization skills')
      .sort({ updatedAt: -1 });

    const internMap = {};

    tasks.forEach((task) => {
      const intern = task.assignee;
      if (!intern) return;

      const internId = intern._id.toString();
      if (!internMap[internId]) {
        internMap[internId] = {
          id: intern._id,
          name: intern.name,
          avatar:
            intern.profileImage ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(intern.name)}`,
          field: intern.specialization || 'Intern',
          skills: intern.skills || [],
          tasks: [],
        };
      }

      internMap[internId].tasks.push(task);
    });

    const interns = Object.values(internMap).map((entry) => {
      const stats = entry.tasks.reduce(
        (acc, task) => {
          acc.total += 1;
          if (task.status === 'completed') acc.completed += 1;
          if (task.submission?.submittedAt) {
            acc.submissionCount += 1;
            const submittedAt = new Date(task.submission.submittedAt);
            if (!acc.latestSubmissionDate || submittedAt > acc.latestSubmissionDate) {
              acc.latestSubmissionDate = submittedAt;
            }
          }
          if (task.status === 'under_review') acc.pendingReviewCount += 1;
          return acc;
        },
        {
          total: 0,
          completed: 0,
          submissionCount: 0,
          pendingReviewCount: 0,
          latestSubmissionDate: null,
        }
      );

      const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);
      const submittedTasks = entry.tasks
        .filter((task) => task.submission?.submittedAt)
        .map(formatTaskSubmission);
      const pendingReviewTasks = entry.tasks
        .filter((task) => task.status === 'under_review' && task.submission?.submittedAt)
        .map(formatTaskSubmission);

      return {
        id: entry.id,
        name: entry.name,
        avatar: entry.avatar,
        field: entry.field,
        skills: entry.skills,
        status: stats.completed < stats.total ? 'active' : 'inactive',
        progress,
        tasksCompleted: stats.completed,
        totalTasks: stats.total,
        submissionCount: stats.submissionCount,
        pendingReviewCount: stats.pendingReviewCount,
        latestSubmissionDate: stats.latestSubmissionDate,
        submissions: submittedTasks,
        pendingReviews: pendingReviewTasks,
      };
    });

    res.json({ success: true, interns });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, assigneeId, dueDate, priority } = req.body;

    if (!title || !assigneeId || !dueDate) {
      res.status(400);
      throw new Error('Title, assignee, and due date are required');
    }

    const assignee = await User.findById(assigneeId);
    if (!assignee) {
      res.status(404);
      throw new Error('Intern not found');
    }

    const task = await Task.create({
      mentor: req.user._id,
      title,
      description: description || '',
      assignee: assignee._id,
      assigneeName: assignee.name,
      dueDate,
      priority: priority || 'medium',
      status: 'pending',
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

const getTasksForUser = async (req, res, next) => {
  try {
    const query = req.user.role === 'mentor'
      ? { mentor: req.user._id }
      : { assignee: req.user._id };

    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .populate('mentor', 'name')
      .populate('statusUpdatedBy', 'name role');

    const normalizedTasks = tasks.map(normalizeTaskResponse);

    res.json({ success: true, tasks: normalizedTasks });
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ mentor: req.user._id }, { assignee: req.user._id }],
    })
      .populate('mentor', 'name')
      .populate('assignee', 'name')
      .populate('statusUpdatedBy', 'name role');

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    res.json({ success: true, task: normalizeTaskResponse(task) });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [{ mentor: req.user._id }, { assignee: req.user._id }],
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const {
      title,
      description,
      dueDate,
      priority,
      status,
      expectedDeliverables,
      submission,
      feedback,
    } = req.body;
    const updates = {};
    const isMentor = req.user.role === 'mentor';
    const isAssignedUser = req.user._id.toString() === task.assignee.toString();

    if (typeof title === 'string') {
      updates.title = title.trim();
    }

    if (typeof description === 'string') {
      updates.description = description;
    }

    if (typeof expectedDeliverables === 'string') {
      updates.expectedDeliverables = expectedDeliverables;
    }

    if (dueDate) {
      updates.dueDate = dueDate;
    }

    if (priority) {
      updates.priority = priority;
    }

    if (submission) {
      updates.submission = {
        githubLink: submission.githubLink || '',
        notes: submission.notes || '',
        attachments: submission.attachments || [],
        submittedAt: new Date(),
      };
      if (!isMentor && !status) {
        updates.status = 'under_review';
      }
    }

    if (feedback) {
      updates.feedback = [
        ...(task.feedback || []),
        {
          reviewer: req.user._id,
          reviewerName: req.user.name,
          comment: feedback.comment || '',
          status: feedback.status || 'changes_requested',
        },
      ];

      if (isMentor) {
        if (feedback.status === 'approved') {
          updates.status = 'completed';
        } else if (feedback.status === 'changes_requested') {
          updates.status = 'in_progress';
        }
      }
    }

    if (status && !(feedback && isMentor && ['approved', 'changes_requested'].includes(feedback.status))) {
      updates.status = status;
    }

    if (updates.status) {
      updates.statusUpdatedBy = req.user._id;
      updates.statusUpdatedRole = req.user.role;
      updates.statusUpdatedAt = new Date();
    }

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid updates provided');
    }

    if (!isMentor && Object.keys(updates).some((key) => !['status', 'submission', 'statusUpdatedBy', 'statusUpdatedRole', 'statusUpdatedAt'].includes(key))) {
      res.status(403);
      throw new Error('Only mentors can edit task details');
    }

    if (!isMentor && !isAssignedUser) {
      res.status(403);
      throw new Error('You are not allowed to update this task');
    }

    Object.assign(task, updates);
    await task.save();

    res.json({ success: true, task: normalizeTaskResponse(task) });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    const isMentor = req.user.role === 'mentor';
    const isTaskMentor = req.user._id.toString() === task.mentor.toString();

    if (!isMentor && !isTaskMentor) {
      res.status(403);
      throw new Error('Only mentors can delete tasks');
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInternSubmissionsForMentor,
  createTask,
  getTasksForUser,
  getTaskById,
  updateTask,
  deleteTask,
};
