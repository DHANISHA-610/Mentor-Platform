const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifySocketToken = async (socket, next) => {
  const token =
    socket.handshake.auth?.token ||
    (socket.handshake.headers.authorization &&
      socket.handshake.headers.authorization.startsWith('Bearer')
      ? socket.handshake.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    const err = new Error('Not authorized, token missing');
    err.data = { content: 'A valid token is required to connect to socket.io' };
    return next(err);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new Error('User not found');
    }

    socket.user = user;
    socket.userId = user._id.toString();
    return next();
  } catch (error) {
    const err = new Error('Not authorized, token invalid');
    err.data = { content: error.message };
    return next(err);
  }
};

module.exports = { verifySocketToken };
