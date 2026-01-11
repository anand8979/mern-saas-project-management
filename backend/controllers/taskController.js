const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all tasks
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res) => {
  try {
    let query = {};

    // Members can only see tasks assigned to them
    if (req.user.role === 'member') {
      query = { assignedTo: req.user.id };
    }
    // Managers and Admins can see all tasks
    // (can be filtered by projectId query param)

    if (req.query.projectId) {
      query.project = req.query.projectId;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name description')
      .populate('assignedTo', 'name email role')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Check authorization: Members can only view tasks assigned to them
    if (
      req.user.role === 'member' &&
      task.assignedTo._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private/Admin,Manager
 */
const createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    const { title, description, status, project, assignedTo, priority, dueDate } =
      req.body;

    // Verify project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Only admin or project creator can create tasks
    if (
      req.user.role !== 'admin' &&
      projectDoc.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create tasks in this project',
      });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      project,
      assignedTo,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate,
    });

    // Populate fields for response
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array(),
      });
    }

    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Authorization logic:
    // - Members can update status and description of tasks assigned to them
    // - Managers and Admins can update all fields
    const isAssignedMember =
      req.user.role === 'member' &&
      task.assignedTo.toString() === req.user.id;
    const isAuthorized =
      req.user.role === 'admin' || req.user.role === 'manager';

    if (!isAssignedMember && !isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    const { title, description, status, assignedTo, priority, dueDate } = req.body;

    // Members can only update status and description
    if (isAssignedMember && !isAuthorized) {
      if (status !== undefined) task.status = status;
      if (description !== undefined) task.description = description;
    } else {
      // Managers and Admins can update all fields
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (assignedTo) task.assignedTo = assignedTo;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;
    }

    await task.save();

    // Populate fields for response
    await task.populate('project', 'name');
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private/Admin,Manager
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Only admin and manager can delete tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete tasks',
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};

