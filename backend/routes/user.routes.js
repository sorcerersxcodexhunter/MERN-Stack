// Get recruiter details by ID

import express from 'express';
import {
  registerUser, getAllUsers, home, login, logout, updateUser
} from '../controller/usercontroller.js';
import { uploadMiddleware } from '../middlewares/multer.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { authenticateAdmin } from '../middlewares/admin.middleware.js';
import * as adminController from '../controller/admincontroller.js';
import Jobs from '../model/jobs.model.js';
import Application from '../model/applications.js';
import User from '../model/user.model.js';

const router = express.Router();

router.get("/", home);
router.post("/register", uploadMiddleware, registerUser);
router.post("/login", login);
router.post("/logout", logout);
router.get("/users", getAllUsers);
router.put("/update-profile", authenticateUser, uploadMiddleware, updateUser);

router.get('/recruiter/applicants', authenticateUser, async (req, res) => {
  try {
    console.log('DEBUG /recruiter/applicants req.user:', req.user);
    const recruiterId = req.user?.id || req.user?._id;
    if (!recruiterId) {
      console.error('No recruiterId found in req.user');
      return res.status(401).json({ message: 'Unauthorized: recruiterId missing' });
    }
    const jobs = await Jobs.find({ recruiter: recruiterId });
    console.log('DEBUG /recruiter/applicants jobs:', jobs);
    if (!jobs.length) {
      return res.status(200).json({ message: 'No jobs posted by this recruiter', applicants: [] });
    }

    const jobApplicants = await Promise.all(jobs.map(async (job) => {
      const applications = await Application.find({ jobID: job._id });
      const applicants = await Promise.all(applications.map(async (app) => {
        const user = await User.findById(app.userID).select('-password');
        return {
          applicant: user,
          status: app.status,
          appliedAt: app.appliedAt,
          applicationId: app._id
        };
      }));
      return {
        job: job,
        applicants: applicants
      };
    }));

    res.status(200).json({
      message: 'Applicants grouped by job',
      applicants: jobApplicants
    });
  } catch (error) {
    console.error('ERROR in /recruiter/applicants:', error);
    res.status(500).json({ message: 'Failed to fetch applicants', error: error.message });
  }
});

router.get('/recruiter/:id', async (req, res) => {
  try {
    const recruiter = await User.findById(req.params.id).select('-password');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.status(200).json({ recruiter });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter', error: error.message });
  }
});

router.post("/admin/register", adminController.registerAdmin);
router.post("/admin/login", adminController.adminLogin);
router.post("/admin/logout", adminController.adminLogout);
router.get("/admin/list", authenticateAdmin, adminController.getAllAdmins);
router.get("/admin/users", authenticateAdmin, adminController.getAllUsersByAdmin);
router.delete("/admin/users/:userId", authenticateAdmin, adminController.deleteUserByAdmin);
router.get("/admin/jobs", authenticateAdmin, adminController.getAllJobsByAdmin);
router.delete("/admin/jobs/:jobId", authenticateAdmin, adminController.deleteJobByAdmin);
router.get("/admin/dashboard-stats", authenticateAdmin, adminController.getAdminDashboardStats);

export default router;