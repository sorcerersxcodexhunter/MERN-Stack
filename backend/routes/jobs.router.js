
import express from 'express';
import Jobs from '../model/jobs.model.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { postJobs, getJobsByRecruiter, getAllJobs, searchJobs, delJob, getMyJobs, appliedJobs } from '../controller/jobscontroller.js';

const router = express.Router();

router.get('/all-jobs', getAllJobs);
router.get('/my-jobs', authenticateUser, getMyJobs);
router.get('/recruiter-jobs', authenticateUser, getJobsByRecruiter);
router.post('/postjob', authenticateUser, postJobs);
router.put('/update-job/:id', authenticateUser, postJobs);
router.delete('/delete-job/:id', authenticateUser, delJob);

router.get('/', getAllJobs);
router.get('/search', searchJobs);
router.get('/my', authenticateUser, getMyJobs);
router.get('/recruiter', authenticateUser, getJobsByRecruiter);
router.get('/applied/:studentId', authenticateUser, appliedJobs);

router.post('/batch', async (req, res) => {
  try {
    const ids = req.body.ids || [];
    if (!Array.isArray(ids) || !ids.length) return res.json([]);
    const jobs = await Jobs.find({ _id: { $in: ids } });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
});

router.post('/', authenticateUser, postJobs);
router.put('/:id', authenticateUser, postJobs);
router.delete('/:id', authenticateUser, delJob);

export default router;
