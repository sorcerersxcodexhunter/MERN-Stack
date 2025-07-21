
import express from 'express';
import * as appController from '../controller/applicationcontroller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/',authenticateUser, appController.applyToJob);
router.get('/student/:studentId',authenticateUser, appController.getStudentApplications);
router.get('/job/:jobId',authenticateUser, appController.getJobApplicants);
router.patch('/:applicationId/status',authenticateUser, appController.updateApplicationStatus);
router.delete('/:applicationId',authenticateUser, appController.deleteApplication);

export default router;