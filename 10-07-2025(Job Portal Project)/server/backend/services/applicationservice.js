
import Application from '../model/applications.js';
import Jobs from '../model/jobs.model.js';
import User from '../model/user.model.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../utils/errors.js';

class ApplicationService {
  async apply({ jobId, userId, resume }) {
    const job = await Jobs.findById(jobId);
    if (!job) throw new NotFoundError('Job not found');

    const user = await User.findById(userId);
    if (!user || user.role !== 'student') throw new UnauthorizedError('Only students can apply');

    const existingApplication = await Application.findOne({ jobID: jobId, userID: userId });
    if (existingApplication) throw new ConflictError('You have already applied to this job');

    const application = new Application({
      jobID: jobId,
      userID: userId,
      resume,
    });

    await application.save();
    return application;
  }

  async findByStudent(studentId) {
    const applications = await Application.find({ userID: studentId }).populate('jobID');
    return applications;
  }

  async findByJob(jobId) {
    const applications = await Application.find({ jobID: jobId }).populate('userID');
    return applications;
  }

  async updateStatus(applicationId, status) {
    const validStatuses = ['Applied', 'Interviewing', 'Offered', 'Rejected'];
    if (!validStatuses.includes(status)) throw new Error('Invalid status');

    const application = await Application.findById(applicationId);
    if (!application) throw new NotFoundError('Application not found');

    application.status = status;
    await application.save();
    return application;
  }

  async withdraw(applicationId, studentId) {
    const application = await Application.findById(applicationId);
    if (!application) throw new NotFoundError('Application not found');
    if (application.userID.toString() !== studentId) throw new UnauthorizedError('You can only withdraw your own applications');
    await application.deleteOne();
    return { message: 'Application withdrawn successfully' };
  }
}

export default new ApplicationService();
