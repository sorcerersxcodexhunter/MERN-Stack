import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema({
  jobID: { type: mongoose.Schema.Types.ObjectId, ref: "Jobs", required: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["Applied", "Interviewing", "Offered", "Rejected"], default: "Applied" },
  appliedAt: { type: Date, default: Date.now },
  
});
const Application = mongoose.model("Application", ApplicationSchema);
export default Application;