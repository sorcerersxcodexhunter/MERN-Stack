import ApplicationService from '../services/applicationService.js';

export const applyToJob = async (req, res, next) => {
  try {
    const { jobId, userId, resume } = req.body;
    const application = await ApplicationService.apply({ jobId, userId, resume });
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
};

export const getStudentApplications = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const apps = await ApplicationService.findByStudent(studentId);
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

export const getJobApplicants = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const apps = await ApplicationService.findByJob(jobId);
    res.json(apps);
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const updated = await ApplicationService.updateStatus(applicationId, status);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};


export const deleteApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { userId } = req.body;
    await ApplicationService.withdraw(applicationId, userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
