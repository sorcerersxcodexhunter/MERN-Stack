import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true  
    },
    company: {
        type:String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    salary:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        enum: ["Full-Time", "Part-Time", "Internship", "Contract", "Temporary", "Freelance", "Volunteer", "Remote"],
        default: "Full-Time",
    },
    technology:{
        type: Array,
        required: true,
        default: []
    },
    Details:{
        discription: {
            type: String,
            default: null
        },
        requirements: {
            type: String,
            default: null
        },
        responsibilities: {
            type: String,
            default: null
        },
        benefits: {
            type: String,
            default: null
        },
        postedIn: {
            type: Date,
            default: Date.now
        },
        deadline: {
            type: Date,
            default: null
        }
    },
    recruiter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        }
    }, {
        timestamps: true
    });

export default mongoose.model("Jobs", JobSchema);