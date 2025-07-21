
import Message from '../model/messages.model.js';

export const saveMessage = async ({ senderId, receiverId, content }) => {
  return await Message.create({ senderId, receiverId, content });
};

export const getConversation = async (userId1, userId2) => {
  return await Message.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 }
    ]
  }).sort({ createdAt: 1 });
};
