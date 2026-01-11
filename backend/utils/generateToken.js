const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * 
 * Creates a JWT token with the user ID as payload.
 * Token expires in the time specified in JWT_EXPIRE environment variable.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;

