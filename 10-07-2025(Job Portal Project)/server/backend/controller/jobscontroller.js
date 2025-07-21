
import Jobs from "../model/jobs.model.js";
import Application from '../model/applications.js';

export const postJobs = async (req, res) => {
    try {
        const { title, company, location, salary, type, technology, details } = req.body;
        const userId = req.user.id; 
        const jobId = req.params.id;

        if (!title || !company || !location || !salary || !technology) {
            return res.status(400).json({
                message: "All required fields must be filled",
                status: "error"
            });
        }

        const techArray = typeof technology === 'string' 
            ? technology.split(',').map(tech => tech.trim()).filter(tech => tech)
            : technology;

        if (jobId) {
            const existingJob = await Jobs.findById(jobId);
            
            if (!existingJob) {
                return res.status(404).json({
                    message: "Job not found",
                    status: "error"
                });
            }

            if (existingJob.recruiter.toString() !== userId) {
                return res.status(403).json({
                    message: "You are not authorized to update this job",
                    status: "error"
                });
            }

            const updatedJob = await Jobs.findByIdAndUpdate(
                jobId,
                {
                    title,
                    company,
                    location,
                    salary,
                    type: type || 'Full-Time',
                    technology: techArray,
                    Details: {
                        discription: details || '',
                        postedIn: existingJob.Details?.postedIn || new Date()
                    },
                    recruiter: userId
                },
                { new: true }
            );

            return res.status(200).json({
                message: "Job updated successfully",
                status: "success",
                job: updatedJob
            });
        } else {
            const newJob = new Jobs({
                title,
                company,
                location,
                salary,
                type: type || 'Full-Time', 
                technology: techArray,
                Details: {
                    discription: details || '',
                    postedIn: new Date()
                },
                recruiter: userId
            });

            await newJob.save();

            return res.status(201).json({
                message: "Job posted successfully",
                status: "success",
                job: newJob
            });
        }
    } catch (error) {
            return res.status(500).json({
                message: "Internal server error",
                status: "error",
                error: error.message
            });
        }
    }

export const getJobsByRecruiter = async (req, res) => {
    try {
        const jobs = await Jobs.find({})
            .populate('recruiter', 'fullName email company profile')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            message: "All jobs retrieved successfully",
            status: "success",
            jobs: jobs,
            totalJobs: jobs.length
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
}

export const getMyJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const jobs = await Jobs.find({ recruiter: userId })
            .populate('recruiter', 'fullName email company profile')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            message: "Your jobs retrieved successfully",
            status: "success",
            jobs: jobs,
            totalJobs: jobs.length
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
}

export const getAllJobs = async (req, res) => {
    try {
        const { search, location, company, technology } = req.query;
        
        let query = {};
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { technology: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }
        
        if (technology) {
            query.technology = { $in: [new RegExp(technology, 'i')] };
        }
        
        const jobs = await Jobs.find(query)
            .populate('recruiter', 'fullName email company profile')
            .sort({ createdAt: -1 });
        const totalJobs = jobs.length;
        
        return res.status(200).json({
            message: "Jobs retrieved successfully",
            status: "success",
            jobs: jobs,
            totalJobs: totalJobs
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
}

export const searchJobs = async (req, res) => {
    try {
        const { q, search, location, company, technology } = req.query;
        
        let query = {};
        
        // If 'q' is provided, use it as a general search term
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { company: { $regex: q, $options: 'i' } },
                { location: { $regex: q, $options: 'i' } },
                { technology: { $in: [new RegExp(q, 'i')] } }
            ];
        } else {
            // Use specific search parameters
            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { technology: { $in: [new RegExp(search, 'i')] } }
                ];
            }
            
            if (location) {
                query.location = { $regex: location, $options: 'i' };
            }
            
            if (company) {
                query.company = { $regex: company, $options: 'i' };
            }
            
            if (technology) {
                query.technology = { $in: [new RegExp(technology, 'i')] };
            }
        }
        
        const jobs = await Jobs.find(query)
            .populate('recruiter', 'fullName email company profile')
            .sort({ createdAt: -1 });
        const totalJobs = jobs.length;
        
        return res.status(200).json({
            message: `Found ${totalJobs} jobs matching your search`,
            status: "success",
            jobs: jobs,
            totalJobs: totalJobs,
            searchQuery: q || search || 'all'
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
}

export const delJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.user.id;

        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid job ID format",
                status: "error"
            });
        }

        const job = await Jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found",
                status: "error"
            });
        }
        
        if (job.recruiter.toString() !== userId.toString()) {
            return res.status(403).json({
                message: "You are not authorized to delete this job",
                status: "error"
            });
        }
        
        await Jobs.findByIdAndDelete(jobId);
        return res.status(200).json({
            message: "Job deleted successfully",
            status: "success"
        });
    } catch (error) {
         return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
};

export const appliedJobs = async (req, res) => {
    try {
        res.set('Cache-Control', 'no-store');
        const { studentId } = req.params;
        if (!studentId) {
            return res.status(400).json({
                message: "Student ID is required",
                status: "error"
            });
        }

        const applications = await Application.find({ userID: studentId }).populate('jobID');

        if (!applications.length) {
            return res.status(200).json({
                message: "No applications found for this student",
                status: "success",
                jobs: []
            });
        }

        const result = applications.map(app => ({
            _id: app._id,
            job: app.jobID,
            status: app.status,
            appliedAt: app.appliedAt
        }));

        return res.status(200).json({
            message: "Applications retrieved successfully",
            status: "success",
            jobs: result
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
}
