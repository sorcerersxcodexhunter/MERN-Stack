import express from 'express';
import { user, userid, home } from '../controller/usercontroller.js';

const router = express.Router();


router.route("/").get(home);           


router.route("/user").get(user);           
router.route("/user/:id").get(userid);  

export default router;