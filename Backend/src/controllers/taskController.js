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

    const { title, description, dueDate, priority, status } = req.body;
    const updates = {};

    if (typeof title === 'string') {
      updates.title = title.trim();
    }

    if (typeof description === 'string') {
      updates.description = description;
    }

    if (dueDate) {
      updates.dueDate = dueDate;
    }

    if (priority) {
      updates.priority = priority;
    }

    if (status) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error('No valid updates provided');
    }

    const isMentor = req.user.role === 'mentor';
    const isAssignedUser = req.user._id.toString() === task.assignee.toString();

    if (!isMentor && Object.keys(updates).some((key) => key !== 'status')) {
      res.status(403);
      throw new Error('Only mentors can edit task details');
    }

    if (!isMentor && !isAssignedUser) {
      res.status(403);
      throw new Error('You are not allowed to update this task');
    }

    Object.assign(task, updates);
    await task.save();

    res.json({ success: true, task });
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
  createTask,
  getTasksForUser,
  updateTask,
  deleteTask,
};
