const Project = require('../models/Project');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

/**
 * @desc    Get all projects
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    let query = {};

    // Members can only see projects they are part of
    if (req.user.role === 'member') {
      query = { teamMembers: req.user.id };
    }
    // Managers and Admins can see projects they created or are members of
    else if (req.user.role === 'manager') {
      query = {
        $or: [{ createdBy: req.user.id }, { teamMembers: req.user.id }],
      };
    }
    // Admins can see all projects

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('teamMembers', 'name email role');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Members can only view projects they are part of
    if (
      req.user.role === 'member' &&
      !project.teamMembers.some((member) => member._id.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    // Get tasks for this project
    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        project,
        tasks,
      },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private/Admin,Manager
 */
const createProject = async (req, res) => {
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

    const { name, description, teamMembers } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      teamMembers: teamMembers || [],
    });

    // Populate fields for response
    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role');

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private/Admin,Manager
 */
const updateProject = async (req, res) => {
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

    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Only admin or creator can update
    if (
      req.user.role !== 'admin' &&
      project.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this project',
      });
    }

    const { name, description, teamMembers } = req.body;

    // Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (teamMembers !== undefined) project.teamMembers = teamMembers;

    await project.save();

    // Populate fields for response
    await project.populate('createdBy', 'name email');
    await project.populate('teamMembers', 'name email role');

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private/Admin,Manager
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check authorization: Only admin or creator can delete
    if (
      req.user.role !== 'admin' &&
      project.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this project',
      });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    // Delete project
    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};

