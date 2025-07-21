import express from 'express';
import { posts, postsid } from '../controller/usercontroller.js';

const router = express.Router();


router.route("/posts").get(posts);           
router.route("/posts/:id").get(postsid);  

export default router;
