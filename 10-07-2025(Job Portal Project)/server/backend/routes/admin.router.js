import express from 'express';
import { adminLogin, adminLogout,  registerAdmin } from '../controller/admincontroller.js';
import { authenticateAdmin } from '../middlewares/admin.middleware.js';

const router = express.Router();

router.post('/login',authenticateAdmin, adminLogin);
router.post('/logout',authenticateAdmin, adminLogout);
router.post('/register', registerAdmin);

export default router;
