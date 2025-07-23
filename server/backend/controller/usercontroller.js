import User from "../model/user.model.js";
import { validateUser,validatelogin } from "../validation/user.validation.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudnary.js"; 
import fs from "fs";

const handleFileUpload = async (file) => {
    if (!file) return null;
    
    const result = await cloudinary.uploader.upload(file.path, {
        folder: 'user-profiles',
        resource_type: 'auto',
        access_mode: 'public'
    });
    
    fs.unlinkSync(file.path);
    return result.secure_url;
};

export const registerUser = async (req, res) => {
    try {
        const { error, value } = validateUser(req.body);
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                status: "error",
                error: error.details[0].message 
            });
        }
        
        const { fullName, email, password, phoneNumber, role, profile } = value;
        
        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ 
                message: "All fields are required",
                status: "error" 
            });
        }

        let profilePictureUrl = null;
        if (req.file) {
            if (!req.file.mimetype.startsWith('image/')) {
                return res.status(400).json({
                    message: "Only image files are allowed for profile picture",
                    status: "error"
                });
            }
            profilePictureUrl = await handleFileUpload(req.file);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ 
                message: "User already exists with this email",
                status: "error" 
            });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber,
            role,
            profile: {
                bio: profile?.bio || "",
                skills: profile?.skills || [],
                profilePicture: profilePictureUrl,
                resume: null,
                resumeOriginalName: null
            }
        });

        await newUser.save();

        return res.status(201).json({
            message: "User registered successfully",
            status: "success",
            success: true,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber,
                role: newUser.role,
                profile: newUser.profile,
                createdAt: newUser.createdAt,
                updatedAt: newUser.updatedAt
            }
        });
        
    } catch (error) {
        return res.status(500).json({ 
            message: "Internal server error",
            status: "error",
            error: error.message 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { error, value } = validatelogin(req.body);
        
        if (error) {
            return res.status(400).json({
                message: "Validation failed",
                status: "error",
                error: error.details[0].message 
            });
        }

        const { email, password, role } = value;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                message: "Incorrect email or password",
                status: "error" 
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: "Incorrect password",
                status: "error" 
            });
        }
        
        if (user.role !== role) {
            return res.status(403).json({ 
                message: "Access denied for this role",
                status: "error" 
            });
        }
        
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "Server configuration error",
                status: "error"
            });
        }
        
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        return res.status(200).cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // true in production, false for local dev
    sameSite: "lax", // or "strict" for extra security
    path: "/", // make cookie available to all routes
    maxAge: 60 * 60 * 1000 // 1 hour, matches your JWT expiry
}).json({
    message: "Login successful",
    status: "success",
    success: true,
    user: userResponse
});
        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the 'token' cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        // Send logout success response
        return res.status(200).json({
            message: "Logout successful",
            status: "success",
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        
        const formattedUsers = users.map(user => ({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            profile: user.profile
        }));
        
        return res.status(200).json({
            message: "Users retrieved successfully",
            status: "success",
            count: formattedUsers.length,
            users: formattedUsers
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            status: "error",
            error: error.message
        });
    }
};

export const updateUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, email, phoneNumber, bio, skills } = req.body;
        
        const updateData = {
            fullName,
            email,
            phoneNumber,
            'profile.bio': bio,
            'profile.skills': skills ? skills.split(',').map(skill => skill.trim()) : []
        };
        
        if (req.files) {
            if (req.files.profilePicture) {
                const profilePictureUrl = await handleFileUpload(req.files.profilePicture[0]);
                updateData['profile.profilePicture'] = profilePictureUrl;
            }
            
            if (req.files.resume) {
                const resumeUrl = await handleFileUpload(req.files.resume[0]);
                updateData['profile.resume'] = resumeUrl;
                updateData['profile.resumeOriginalName'] = req.files.resume[0].originalname;
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');
        
        return res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: updatedUser
        });
        
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

export const home = async (req, res) => {
    res.send("Welcome to the Home Page");
};
