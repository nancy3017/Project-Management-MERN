
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true, unique: true },
    projectDescription: { type: String, required: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["pending", "inprogress", "done"], required: true },
});


projectSchema.index({ projectName: 'text' });

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;

// [
//     {
//       "Project_name": "Website Redesign",
//       "Project_description": "Redesign the company’s website for better user experience.",
//       "duration": 45,
//       "status": "not completed"
//     },
//     {
//       "Project_name": "Mobile App Development",
//       "Project_description": "Develop a mobile app for the company's e-commerce platform.",
//       "duration": 90,
//       "status": "not completed"
//     },
//     {
//       "Project_name": "Cloud Migration",
//       "Project_description": "Migrate on-premise servers to cloud infrastructure.",
//       "duration": 120,
//       "status": "in progress"
//     },
//     {
//       "Project_name": "Marketing Campaign",
//       "Project_description": "Launch a digital marketing campaign for the new product line.",
//       "duration": 30,
//       "status": "completed"
//     },
//     {
//       "Project_name": "Data Analytics Implementation",
//       "Project_description": "Integrate data analytics tools for business insights.",
//       "duration": 60,
//       "status": "not completed"
//     }
//   ]
  