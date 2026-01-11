const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/projects
 * @desc    Get all projects
 * @access  Private
 */
router.get('/', getProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
router.get('/:id', getProject);

/**
 * @route   POST /api/projects
 * @desc    Create new project
 * @access  Private/Admin,Manager
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('name').trim().notEmpty().withMessage('Project name is required'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('teamMembers')
      .optional()
      .isArray()
      .withMessage('Team members must be an array'),
  ],
  createProject
);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project
 * @access  Private/Admin,Manager
 */
router.put(
  '/:id',
  authorize('admin', 'manager'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Project name cannot be empty'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('teamMembers')
      .optional()
      .isArray()
      .withMessage('Team members must be an array'),
  ],
  updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private/Admin,Manager
 */
router.delete('/:id', authorize('admin', 'manager'), deleteProject);

module.exports = router;

