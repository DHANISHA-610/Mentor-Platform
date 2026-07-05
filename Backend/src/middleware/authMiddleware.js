const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract the token from the header (Format: "Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      // Find the user by ID from the decoded token, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');

      // Move to the next middleware or route handler
      return next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401 Unauthorized
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token provided'));
  }
};

module.exports = { protect };
