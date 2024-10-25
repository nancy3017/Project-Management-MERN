const Project = require('../models/projectModel');
const User = require('../models/userModel'); 
const Task=require('../models/taskModel')
const UserProject=require('../models/userProjectModel')

exports.dashboardapi = async (req, res) => {
    try {
        const tasksWithPassedEndDate = await Task.countDocuments({ endDate: { $lt: new Date() } }); //$lt: This is a MongoDB operator that stands for "less than." It is used to compare the endDate field with another value.
        const taskCompleted=await Project.countDocuments({status:'completed'})
        const taskPending=await Project.countDocuments({status:'pending'})
        const taskInProgress=await Project.countDocuments({status:'inprogress'})
        const projectCompleted=await Project.countDocuments({status:'completed'})
        const projectPending=await Project.countDocuments({status:'pending'})
        const projectInProgress=await Project.countDocuments({status:'inprogress'})
        const totalProjects = await Project.countDocuments();
        const totalEmployees = await User.countDocuments({ role_id: 3 });
        const totalTasks=await Task.countDocuments(); 
        const totalManagers=await User.countDocuments({ role_id: 2})
        const managerIds = await User.find({ role_id: 2 }).distinct('_id');
        const assignedEmployees = await UserProject.distinct('user_id', { user_id: { $in: managerIds } });
        const assignedManagerCount = assignedEmployees.length; 
        return res.status(200).json({
            totalEmployeesCount: totalEmployees,
            totalProjectsCount: totalProjects,
            totalTasksCount:totalTasks,
            totalManagersCount:totalManagers,
            totalProjectCompleted:projectCompleted,
            totalProjectPending:projectPending,
            totalProjectInProgress:projectInProgress,
            totalTaskCompleted:taskCompleted,
            totalTaskPending:taskPending,
            totalTaskInProgress:taskInProgress,
            tasksWithPassedEndDate:tasksWithPassedEndDate,
            assignedManagerCount:assignedManagerCount
        });
        
    } catch (error) {
        console.error('Error counting employees:', error);
        return res.status(500).json({ message: 'Error counting employees', error });
    }
};

// const countEmployeesWithRoleId3 = async () => {
//     try {
//         const result = await Employee.aggregate([
//             { $match: { roleId: 3 } },
//             { $count: "count" } // This will give you a document with the count
//         ]);
        
//         const count = result.length > 0 ? result[0].count : 0;
//         console.log(`Number of employees with roleId 3: ${count}`);
//         return count;
//     } catch (error) {
//         console.error('Error counting employees:', error);
//     }
// };


//i have userproject,user and project modal i want to find count of user who are employee who are assigned pprojects


