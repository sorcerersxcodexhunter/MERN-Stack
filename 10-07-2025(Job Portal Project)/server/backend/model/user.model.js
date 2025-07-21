import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: true  
    },
    email: {
        type:String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ["student", "recruiter"],
        default: "student",
    },
    profile:{
        bio:String,
        skills:[{type: String}],
        resume:{
            type: String,
            default: null
        },
        resumeOriginalName: {
            type: String,
            default: null
        },
        profilePicture: {
            type: String,
            default: null
            },
        }
    }, {
        timestamps: true
    });

export default mongoose.model("User", userSchema);