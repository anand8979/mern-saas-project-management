const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 */
router.get('/', getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get('/:id', getUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please provide a valid email'),
    body('role')
      .optional()
      .isIn(['admin', 'manager', 'member'])
      .withMessage('Role must be admin, manager, or member'),
  ],
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private/Admin
 */
router.delete('/:id', deleteUser);

module.exports = router;

