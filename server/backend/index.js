
import express from 'express';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/user.routes.js';
import jobsRoutes from './routes/jobs.router.js';
import jobScraperRoutes from './routes/jobScraper.routes.js';
import adminRoutes from './routes/admin.router.js';
import applyRoutes from './routes/application.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { db } from './utils/db.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Message from './model/messages.model.js';


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});

dotenv.config();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/", userRoutes);
app.use("/jobs", jobsRoutes);
app.use("/external", jobScraperRoutes);
app.use("/admin", adminRoutes);

app.use("/apply", applyRoutes);
app.use("/messages", messagesRoutes);



// Map to keep track of userId <-> socket.id
const userSocketMap = new Map();

io.on('connection', (socket) => {
  // Listen for user identification
  socket.on('identify', (userId) => {
    userSocketMap.set(userId, socket.id);
    socket.userId = userId;
  });

  // Private message event
  socket.on('message', async (msg) => {
    try {
      // Save message to database
      const { senderId, receiverId, content } = msg;
      const savedMessage = await Message.create({ senderId, receiverId, content });
      
      // Send to receiver if online
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message', savedMessage);
      }
      // Also send to sender (for confirmation)
      socket.emit('message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  db();
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});