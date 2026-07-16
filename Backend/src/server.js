require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { verifySocketToken } = require('./middleware/socketAuth');
const Conversation = require('./models/Conversation');

const PORT = process.env.PORT || 5000;
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:5175').split(',').map((url) => url.trim());
const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/:\d+$/, '');
    const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)$/.test(normalizedOrigin);
    if (isLocalhost || CLIENT_URLS.includes(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/:\d+$/, '');
      const isLocalhost = /^(https?:\/\/)?(localhost|127\.0\.0\.1)$/.test(normalizedOrigin);

      if (isLocalhost || CLIENT_URLS.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);
io.use(verifySocketToken);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} user=${socket.userId}`);
  socket.join(socket.userId);

  socket.on('send_message', async ({ conversationId, text }, callback) => {
    if (!conversationId || !text?.trim()) {
      return callback?.({ success: false, message: 'Conversation ID and text are required' });
    }

    try {
      const conversation = await Conversation.findById(conversationId).populate(
        'participants',
        'name profileImage title specialization'
      );

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant._id.toString() === socket.userId
      );

      if (!isParticipant) {
        throw new Error('Not authorized to send message in this conversation');
      }

      const message = {
        sender: socket.user._id,
        text: text.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      conversation.messages.push(message);
      conversation.lastMessage = message.text;
      conversation.lastMessageAt = new Date();

      conversation.unreadCounts = conversation.participants.map((participant) => {
        const userId = participant._id.toString();
        const existing = (conversation.unreadCounts || []).find(
          (entry) => entry.user.toString() === userId
        );

        return {
          user: participant._id,
          count: userId === socket.userId ? 0 : (existing?.count || 0) + 1,
        };
      });

      await conversation.save();

      const savedMessage = conversation.messages[conversation.messages.length - 1];
      const responseMessage = {
        id: savedMessage._id.toString(),
        senderId: socket.userId,
        text: savedMessage.text,
        time: savedMessage.createdAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
        edited: false,
      };

      const recipient = conversation.participants.find(
        (participant) => participant._id.toString() !== socket.userId
      );

      if (recipient) {
        io.to(recipient._id.toString()).emit('receive_message', {
          conversationId: conversation._id.toString(),
          message: responseMessage,
          lastMessage: responseMessage.text,
          lastMessageTime: responseMessage.time,
        });
      }

      socket.emit('message_sent', {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: responseMessage.text,
        lastMessageTime: responseMessage.time,
      });

      callback?.({ success: true, message: responseMessage });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('edit_message', async ({ conversationId, messageId, text }, callback) => {
    if (!conversationId || !messageId || !text?.trim()) {
      return callback?.({ success: false, message: 'Conversation ID, message ID, and text are required' });
    }

    try {
      const conversation = await Conversation.findById(conversationId).populate(
        'participants',
        'name profileImage title specialization'
      );

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isParticipant = conversation.participants.some(
        (participant) => participant._id.toString() === socket.userId
      );

      if (!isParticipant) {
        throw new Error('Not authorized to edit messages in this conversation');
      }

      const message = conversation.messages.id(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.sender.toString() !== socket.userId) {
        throw new Error('You can only edit your own messages');
      }

      message.text = text.trim();
      message.updatedAt = new Date();

      const lastMessage = conversation.messages[conversation.messages.length - 1];
      if (lastMessage && lastMessage._id.toString() === messageId) {
        conversation.lastMessage = message.text;
        conversation.lastMessageAt = new Date();
      }

      await conversation.save();

      const responseMessage = {
        id: message._id.toString(),
        senderId: message.sender.toString(),
        text: message.text,
        time: message.updatedAt.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isOwn: true,
        edited: true,
      };

      const recipient = conversation.participants.find(
        (participant) => participant._id.toString() !== socket.userId
      );

      const payload = {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: conversation.lastMessage,
        lastMessageTime: responseMessage.time,
      };

      if (recipient) {
        io.to(recipient._id.toString()).emit('message_updated', payload);
      }

      socket.emit('message_updated', payload);
      callback?.({ success: true, message: responseMessage });
    } catch (error) {
      callback?.({ success: false, message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id} user=${socket.userId}`);
  });
});

const startServer = async () => {
  try {
    await connectDB();

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Make sure no other server is running on port ${PORT}.`);
      } else {
        console.error('Server error:', error.message);
      }
      process.exit(1);
    });

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
