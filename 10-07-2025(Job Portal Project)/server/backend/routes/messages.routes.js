import express from 'express';
import { sendMessage, getMessages } from '../controller/messages.controller.js';

const router = express.Router();

// Send a message
router.post('/', sendMessage);

// Get all messages between two users
router.get('/:userId1/:userId2', getMessages);

export default router;
