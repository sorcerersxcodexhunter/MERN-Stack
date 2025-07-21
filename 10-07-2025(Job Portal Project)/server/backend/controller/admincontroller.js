import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import Jobs from "../model/jobs.model.js";

let ADMIN_USERS = [
    {
        id: "RahulPatelAdmin",
        email: "admin@jobportal.com",
        password: "$2b$10$r1j..uqNb7qp.uqLJhweI.YUUKHzUvtpKVLQNyGgi2Lb9V/HxZANC",
        name: "System Administrator",
        role: "admin",
        createdAt: new Date()
    }
];

export const registerAdmin = async (req, res) => {
    try {
        const { email, password, name, masterKey } = req.body;

        const MASTER_KEY = process.env.ADMIN_MASTER_KEY || "MASTER_ADMIN_2024";
        if (masterKey !== MASTER_KEY) {
            return res.status(403).json({
                success: false,
                message: "Invalid master key. Admin registration denied."
            });
        }

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: "Email, password, and name are required"
            });
        }

        const existingAdmin = ADMIN_USERS.find(admin => admin.email === email);
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Admin with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = {
            id: `admin_${Date.now()}`,
            email,
            password: hashedPassword,
            name,
            role: "admin",
            createdAt: new Date()
        };

        ADMIN_USERS.push(newAdmin);

        return res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: {
                id: newAdmin.id,
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role,
                createdAt: newAdmin.createdAt
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const admin = ADMIN_USERS.find(admin => admin.email === email);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        const token = jwt.sign(
            { 
                id: admin.id,
                email: admin.email,
                role: "admin",
                name: admin.name
            },
            process.env.SECRET_KEY || "your-secret-key",
            { expiresIn: "24h" }
        );

        
        res.cookie("adminToken", token, {
            maxAge: 24 * 60 * 60 * 1000, 
            httpOnly: true,
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token: token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: "admin"
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const adminLogout = async (req, res) => {
    try {
        res.clearCookie("adminToken");
        return res.status(200).json({
            success: true,
            message: "Admin logout successful"
        });
    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};



export const getAllAdmins = async (req, res) => {
    try {
        // Return all admins without passwords
        const adminList = ADMIN_USERS.map(admin => ({
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
            createdAt: admin.createdAt
        }));

        return res.status(200).json({
            success: true,
            message: "Admins retrieved successfully",
            admins: adminList,
            count: adminList.length
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

// Admin User Management Functions
export const getAllUsersByAdmin = async (req, res) => {
    try {
        // Get all users from database
        const allUsers = await User.find({})
            .select('-password') // Exclude password field
            .sort({ createdAt: -1 });

        // Categorize users by role
        const usersByRole = {
            students: allUsers.filter(user => user.role === 'student'),
            recruiters: allUsers.filter(user => user.role === 'recruiter'),
            total: allUsers.length
        };

        // Get statistics
        const stats = {
            totalUsers: allUsers.length,
            totalStudents: usersByRole.students.length,
            totalRecruiters: usersByRole.recruiters.length,
            recentUsers: allUsers.slice(0, 10) // Last 10 users
        };

        return res.status(200).json({
            success: true,
            message: "Users retrieved successfully",
            users: usersByRole,
            statistics: stats
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const deleteUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find and delete the user
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // If the deleted user was a recruiter, also delete their jobs
        if (deletedUser.role === 'recruiter') {
            await Jobs.deleteMany({ recruiter: userId });
        }

        return res.status(200).json({
            success: true,
            message: `User ${deletedUser.fullName} deleted successfully`,
            deletedUser: {
                id: deletedUser._id,
                name: deletedUser.fullName,
                email: deletedUser.email,
                role: deletedUser.role
            }
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// Admin Job Management Functions
export const getAllJobsByAdmin = async (req, res) => {
    try {
        // Get all jobs with recruiter information
        const allJobs = await Jobs.find({})
            .populate('recruiter', 'fullName email company')
            .sort({ createdAt: -1 });

        // Get statistics
        const stats = {
            totalJobs: allJobs.length,
            recentJobs: allJobs.slice(0, 10), // Last 10 jobs
            jobsByType: {}
        };

        // Count jobs by type
        allJobs.forEach(job => {
            const type = job.type || 'Unknown';
            stats.jobsByType[type] = (stats.jobsByType[type] || 0) + 1;
        });

        return res.status(200).json({
            success: true,
            message: "Jobs retrieved successfully",
            jobs: allJobs,
            statistics: stats
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const deleteJobByAdmin = async (req, res) => {
    try {
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json({
                success: false,
                message: "Job ID is required"
            });
        }

        // Find and delete the job
        const deletedJob = await Jobs.findByIdAndDelete(jobId);

        if (!deletedJob) {
            return res.status(404).json({
                success: false,
                message: "Job not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: `Job "${deletedJob.title}" deleted successfully`,
            deletedJob: {
                id: deletedJob._id,
                title: deletedJob.title,
                company: deletedJob.company,
                location: deletedJob.location
            }
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

export const getAdminDashboardStats = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalRecruiters = await User.countDocuments({ role: 'recruiter' });

        // Get job statistics
        const totalJobs = await Jobs.countDocuments();
        
        // Get recent activity
        const recentUsers = await User.find({})
            .select('fullName email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentJobs = await Jobs.find({})
            .select('title company createdAt')
            .populate('recruiter', 'fullName')
            .sort({ createdAt: -1 })
            .limit(5);

        // Calculate growth (users and jobs created in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUserGrowth = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const recentJobGrowth = await Jobs.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        return res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully",
            statistics: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    recruiters: totalRecruiters,
                    recentGrowth: recentUserGrowth
                },
                jobs: {
                    total: totalJobs,
                    recentGrowth: recentJobGrowth
                },
                recentActivity: {
                    users: recentUsers,
                    jobs: recentJobs
                }
            }
        });

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
