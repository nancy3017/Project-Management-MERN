const mongoose = require("mongoose");

const TaskSchema=mongoose.Schema({
    taskName:{
        type:String,
        required:true
    },
    Description:{
        type:String,
    },
    Status:{
        type:String,
        enum:["pending","inprogress","done"]
    },
    Priority:{
        type:String,
        enum:["low","medium","high"]
    },
    startDate:{
        type:Date,
        default:Date.now,
    },
    endDate:{
        type:Date,
    },
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
    }

})
const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;


// [
//     {
//         "Task_Name": "Design Homepage",
//         "Description": "Create the initial homepage design for the website",
//         "Status": "inprogress",
//         "Priority": "high",
//         "Start_Date": "2023-10-01",
//         "End_Date": "2023-10-15",
//         "Project_id": "653a7e1bcf84727b1f112345"  // Sample Project ObjectId
//     },
//     {
//         "Task_Name": "Develop API",
//         "Description": "Build RESTful API for the project management system",
//         "Status": "pending",
//         "Priority": "medium",
//         "Start_Date": "2023-10-05",
//         "End_Date": "2023-11-01",
//         "Project_id": "653a7e1bcf84727b1f112345"  // Sample Project ObjectId
//     },
//     {
//         "Task_Name": "Write Documentation",
//         "Description": "Prepare detailed documentation for the API",
//         "Status": "done",
//         "Priority": "low",
//         "Start_Date": "2023-09-10",
//         "End_Date": "2023-09-20",
//         "Project_id": "653a7e1bcf84727b1f112346"  // Another sample Project ObjectId
//     },
//     {
//         "Task_Name": "Set Up Database",
//         "Description": "Set up MongoDB with Mongoose for data persistence",
//         "Status": "inprogress",
//         "Priority": "high",
//         "Start_Date": "2023-10-10",
//         "End_Date": "2023-10-20",
//         "Project_id": "653a7e1bcf84727b1f112347"  // Another sample Project ObjectId
//     },
//     {
//         "Task_Name": "User Authentication",
//         "Description": "Implement user authentication and JWT for the app",
//         "Status": "pending",
//         "Priority": "medium",
//         "Start_Date": "2023-10-12",
//         "End_Date": "2023-10-25",
//         "Project_id": "653a7e1bcf84727b1f112348"  // Another sample Project ObjectId
//     }
// ]
