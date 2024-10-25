
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true, unique: true },
    projectDescription: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["pending", "inprogress", "completed"], required: true },
});


projectSchema.index({ projectName: 'text' });

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;


