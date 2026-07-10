const Task = require('../models/Task');
const Request = require('../models/Request');
const User = require('../models/User');
const Conversation = require('../models/Conversation');

const formatTimestamp = (date) => {
  if (!date) return '';
  const timestamp = new Date(date);
  const today = new Date();
  if (timestamp.toDateString() === today.toDateString()) {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const buildConversationResponse = (conversation, currentUser) => {
  const otherParticipant = conversation.participants.find(
    (participant) => participant._id.toString() !== currentUser._id.toString()
  );

  const unreadInfo = (conversation.unreadCounts || []).find(
    (entry) => entry.user.toString() === currentUser._id.toString()
  );

  return {
    id: conversation._id.toString(),
    partnerId: otherParticipant?._id.toString(),
    name: otherParticipant?.name || 'Mentor',
    avatar:
      otherParticipant?.profileImage ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        otherParticipant?.name || 'chat'
      )}`,
    role:
      otherParticipant?.title ||
      otherParticipant?.specialization ||
      (otherParticipant?.role === 'mentor' ? 'Mentor' : 'Intern'),
    online: true,
    unread: unreadInfo?.count || 0,
    lastMessage: conversation.lastMessage || 'Start the conversation',
    lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
  };
};

const normalizeMessages = (conversation, currentUser) =>
  conversation.messages.map((message) => ({
    id: message._id.toString(),
    senderId: message.sender.toString(),
    text: message.text,
    time: formatTimestamp(message.updatedAt || message.createdAt),
    isOwn: message.sender.toString() === currentUser._id.toString(),
    edited: message.updatedAt && message.updatedAt > message.createdAt,
  }));

const createConversationIfMissing = async (participantIds) => {
  let conversation = await Conversation.findOne({ participants: { $all: participantIds } });
  if (conversation) {
    return conversation;
  }

  return Conversation.create({
    participants: participantIds,
    unreadCounts: participantIds.map((participantId) => ({ user: participantId, count: 0 })),
  });
};

const getConversations = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const existingConversations = await Conversation.find({ participants: currentUser._id })
      .populate('participants', 'name profileImage title specialization role')
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    const conversations = existingConversations.map((conversation) =>
      buildConversationResponse(conversation, currentUser)
    );
    const seenParticipantIds = new Set(conversations.map((item) => item.partnerId));

    if (currentUser.role === 'mentor') {
      const tasks = await Task.find({ mentor: currentUser._id })
        .populate('assignee', 'name profileImage specialization')
        .sort({ createdAt: -1 })
        .limit(5);

      for (const task of tasks) {
        if (!task.assignee) continue;

        const internId = task.assignee._id.toString();
        if (seenParticipantIds.has(internId)) continue;

        const conversation = await createConversationIfMissing([currentUser._id, task.assignee._id]);
        await conversation.populate('participants', 'name profileImage title specialization role');
        conversations.push(buildConversationResponse(conversation, currentUser));
        seenParticipantIds.add(internId);
      }

      if (conversations.length === 0) {
        const requests = await Request.find({ mentor: currentUser._id, status: 'approved' })
          .sort({ createdAt: -1 })
          .limit(3)
          .populate('requester', 'name profileImage specialization');

        for (const request of requests) {
          if (!request.requester) continue;

          const internId = request.requester._id.toString();
          if (seenParticipantIds.has(internId)) continue;

          const conversation = await createConversationIfMissing([currentUser._id, request.requester._id]);
          await conversation.populate('participants', 'name profileImage title specialization role');
          conversations.push(buildConversationResponse(conversation, currentUser));
          seenParticipantIds.add(internId);
        }
      }
    } else if (currentUser.role === 'intern') {
      const requests = await Request.find({ requester: currentUser._id, status: 'approved' })
        .populate('mentor', 'name profileImage title specialization')
        .sort({ createdAt: -1 })
        .limit(5);

      for (const request of requests) {
        if (!request.mentor) continue;

        const mentorId = request.mentor._id.toString();
        if (seenParticipantIds.has(mentorId)) continue;

        const conversation = await createConversationIfMissing([currentUser._id, request.mentor._id]);
        await conversation.populate('participants', 'name profileImage title specialization role');
        conversations.push(buildConversationResponse(conversation, currentUser));
        seenParticipantIds.add(mentorId);
      }

      if (conversations.length === 0) {
        const mentors = await User.find({ role: 'mentor', approved: true, profileCompleted: true })
          .sort({ createdAt: -1 })
          .limit(3);

        for (const mentor of mentors) {
          const mentorId = mentor._id.toString();
          if (seenParticipantIds.has(mentorId)) continue;

          const conversation = await createConversationIfMissing([currentUser._id, mentor._id]);
          await conversation.populate('participants', 'name profileImage title specialization role');
          conversations.push(buildConversationResponse(conversation, currentUser));
          seenParticipantIds.add(mentorId);
        }
      }
    }

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const conversation = await Conversation.findById(id).populate(
      'participants',
      'name profileImage title specialization role'
    );

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant._id.toString() === currentUser._id.toString()
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error('Not authorized to access this conversation');
    }

    const unreadIndex = (conversation.unreadCounts || []).findIndex(
      (entry) => entry.user.toString() === currentUser._id.toString()
    );

    if (unreadIndex !== -1 && conversation.unreadCounts[unreadIndex].count > 0) {
      conversation.unreadCounts[unreadIndex].count = 0;
      await conversation.save();
    }

    const otherParticipant = conversation.participants.find(
      (participant) => participant._id.toString() !== currentUser._id.toString()
    );

    const responseConversation = {
      id: conversation._id.toString(),
      name: otherParticipant?.name || 'Mentor',
      avatar:
        otherParticipant?.profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          otherParticipant?.name || 'chat'
        )}`,
      role:
        otherParticipant?.title ||
        otherParticipant?.specialization ||
        (otherParticipant?.role === 'mentor' ? 'Mentor' : 'Intern'),
      unread: 0,
      lastMessage: conversation.lastMessage || 'Start the conversation',
      lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
      messages: normalizeMessages(conversation, currentUser),
    };

    res.json({ success: true, conversation: responseConversation });
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const currentUser = req.user;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Message text is required');
    }

    const conversation = await Conversation.findById(id).populate(
      'participants',
      'name profileImage title specialization role'
    );

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant._id.toString() === currentUser._id.toString()
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error('Not authorized to send messages in this conversation');
    }

    const message = {
      sender: currentUser._id,
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
        count: userId === currentUser._id.toString() ? 0 : (existing?.count || 0) + 1,
      };
    });

    await conversation.save();

    const savedMessage = conversation.messages[conversation.messages.length - 1];
    const responseMessage = {
      id: savedMessage._id.toString(),
      senderId: currentUser._id.toString(),
      text: savedMessage.text,
      time: formatTimestamp(savedMessage.createdAt),
      isOwn: true,
    };

    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== currentUser._id.toString()
    );

    const io = req.app.get('io');
    if (io && recipient) {
      io.to(recipient._id.toString()).emit('receive_message', {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: responseMessage.text,
        lastMessageTime: responseMessage.time,
      });
      io.to(currentUser._id.toString()).emit('message_sent', {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: responseMessage.text,
        lastMessageTime: responseMessage.time,
      });
    }

    res.status(201).json({
      success: true,
      message: responseMessage,
      conversationId: conversation._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const { id, messageId } = req.params;
    const { text } = req.body;
    const currentUser = req.user;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error('Message text is required');
    }

    const conversation = await Conversation.findById(id).populate(
      'participants',
      'name profileImage title specialization role'
    );

    if (!conversation) {
      res.status(404);
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant._id.toString() === currentUser._id.toString()
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error('Not authorized to edit messages in this conversation');
    }

    const message = conversation.messages.id(messageId);
    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== currentUser._id.toString()) {
      res.status(403);
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
      time: formatTimestamp(message.updatedAt),
      isOwn: true,
      edited: true,
    };

    const io = req.app.get('io');
    const recipient = conversation.participants.find(
      (participant) => participant._id.toString() !== currentUser._id.toString()
    );

    if (io && recipient) {
      io.to(recipient._id.toString()).emit('message_updated', {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: conversation.lastMessage,
        lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
      });
      io.to(currentUser._id.toString()).emit('message_updated', {
        conversationId: conversation._id.toString(),
        message: responseMessage,
        lastMessage: conversation.lastMessage,
        lastMessageTime: formatTimestamp(conversation.lastMessageAt || conversation.updatedAt),
      });
    }

    res.json({ success: true, message: responseMessage, conversationId: conversation._id.toString() });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversationById,
  sendMessage,
  editMessage,
};
