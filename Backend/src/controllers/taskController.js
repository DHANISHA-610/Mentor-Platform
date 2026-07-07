const Task = require('../models/Task');
const User = require('../models/User');

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

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, $or: [{ mentor: req.user._id }, { assignee: req.user._id }] });

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    task.status = status;
    await task.save();

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksForUser,
  updateTaskStatus,
};
