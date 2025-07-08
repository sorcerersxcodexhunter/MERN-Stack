import express from 'express';
import { comments, commentsid } from '../controller/usercontroller.js';

const router = express.Router();


router.route("/comments").get(comments);           
router.route("/comments/:id").get(commentsid);  

export default router;
