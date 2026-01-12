const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTasks,
  getTask,
  getMyTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks (role-based filtering)
 * @access  Private
 */
router.get('/', getTasks);

/**
 * @route   GET /api/tasks/my-tasks
 * @desc    Get my tasks (for Members)
 * @access  Private
 */
router.get('/my-tasks', getMyTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get('/:id', getTask);

/**
 * @route   POST /api/tasks
 * @desc    Create new task
 * @access  Private/Admin,Manager
 */
router.post(
  '/',
  authorize('admin', 'manager'),
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Status must be todo, in-progress, or done'),
    body('project').notEmpty().withMessage('Project ID is required'),
    body('assignedTo').notEmpty().withMessage('Assigned user ID is required'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
  ],
  createTask
);

/**
 * @route   PUT /api/tasks/:id/status
 * @desc    Update task status (Members can update their own tasks)
 * @access  Private
 */
router.put(
  '/:id/status',
  [
    body('status')
      .notEmpty()
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Status must be todo, in-progress, or done'),
  ],
  updateTaskStatus
);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Task title cannot be empty'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'done'])
      .withMessage('Status must be todo, in-progress, or done'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priority must be low, medium, or high'),
  ],
  updateTask
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private/Admin,Manager
 */
router.delete('/:id', authorize('admin', 'manager'), deleteTask);

module.exports = router;

