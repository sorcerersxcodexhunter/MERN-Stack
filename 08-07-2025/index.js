import express from 'express';
import morgan from 'morgan';
import userRoutes from './routes/user.routes.js';
import postsRoutes from './routes/posts.routes.js';
import commentsRoutes from './routes/comments.routes.js';
import { db } from './utils/db.js';
import dotenv from 'dotenv';

const app = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get("/", (req, res) => {
  res.json({
    message: "Server is working!",
    status: "success",
    availableRoutes: {
      users: "/rahul/user",
      posts: "/rahul/posts", 
      comments: "/rahul/comments"
    }
  });
});


app.use("/rahul", userRoutes);
app.use("/rahul", postsRoutes);
app.use("/rahul", commentsRoutes);



app.listen( process.env.port , () => {
  db()
  console.log(`Server is running on port ${ process.env.port }`);
});