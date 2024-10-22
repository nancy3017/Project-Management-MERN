const Project = require('../models/userProjectModel');
const User = require('../models/userModel'); 
require('dotenv').config();
const {roles}=require('../utils/roles')
const CreateTask=require('../models/taskModel')


//only admins and  project managers can create a new project if project is already created they cannot create it again

exports.createProject=async(req,res)=>{
    const {role}=req.user
    const {projectName,projectDescription,duration,status}=req.body

    if (!projectName || !projectDescription || !duration || !status) {
        return res.status(400).json({ message: 'All fields (Project Name, Description, Duration, Status) are required.' });
    }

    const validStatuses = ['active', 'inactive', 'completed', 'pending'];
    if (!validStatuses.includes(status.toLowerCase())) {
    return res.status(400).json({ message: `Invalid status. Status must be one of: ${validStatuses.join(', ')}.` });
    }
    try{
        const existingProject = await Project.findOne({ projectName });
        if (existingProject) {
            return res.status(400).json({ message: 'A project with this name already exists. Please choose a different name.' });
        }

        if(role===roles.employee)
        {
            return res.status(400).json({ message: 'Access denied: Insufficient privileges to create a project. Please contact an administrator for assistance.' });
        }
        const newProject=await Project.create({projectName,projectDescription,duration,status})
        return res.status(200).json({message:'Project created Successfully',newProject})  
     }
    catch(error)
    {
        console.error(error); 
        return res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }

} 


/* assign and unassign project to user where  emp cannot assign and manager cannot assign project to admin.admin can assign to all including 
admin same as manager*/

exports.setProjectTaskAssignment = async (req, res) => {
    const { id, user_id, type, action } = req.body; 
    const { role } = req.user;

    try {
        
        if (!user_id || !id || !type || !action) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (role === roles.employee || (user.role_id === roles.admin && role === roles.manager)) {
            return res.status(400).json({ message: 'Access denied: Insufficient privileges to assign or unassign projects' });
        }

        if (action === 'assign') {
            if (type === 1 || type === "Project") {
                const project = await Project.findById(id);
                if (!project) {
                    return res.status(404).json({ message: 'Project not found' });
                }
                const existingAssignment = await UserProject.findOne({ user_id, project_id: id });
                if (existingAssignment) {
                    return res.status(400).json({ message: 'User is already assigned to this project' });
                }
                const projectAssigned = await UserProject.create({
                    user_id,
                    project_id: id
                });
                return res.status(201).json({ message: 'Project assigned successfully', projectAssigned });
            } else {
                const task = await CreateTask.findById(id);
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                const existingTaskAssignment = await  UserTask.findOne({ user_id, task_id: id });
                if (existingTaskAssignment) {
                    return res.status(400).json({ message: 'User is already assigned to this task' });
                }
                const taskAssigned = await  UserTask.create({
                    user_id,
                    task_id: id
                });
                return res.status(201).json({ message: 'Task assigned successfully', taskAssigned });
            }
        } 
        else if (action === 'unassign') {
            if (type === 1 || type === "Project") {
                const existingAssignment = await UserProject.findOneAndDelete({ user_id, project_id: id });
                if (!existingAssignment) {
                    return res.status(400).json({ message: 'User is not assigned to this project' });
                }
                return res.status(200).json({ message: 'Project unassigned successfully' });
            } else {
                const existingTaskAssignment = await  UserTask.findOneAndDelete({ user_id, task_id: id });
                if (!existingTaskAssignment) {
                    return res.status(400).json({ message: 'User is not assigned to this task' });
                }
                return res.status(200).json({ message: 'Task unassigned successfully' });
            }
        } else {
            return res.status(400).json({ message: 'Invalid action specified' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}


//get all user projects data with search and sorting functionality in this user cannot search there own record as well as admins record

exports.getAllProjectList = async (req, res) => {
    try {
        const { user_id, name, Sort_By } = req.query;
        const {role}=req.user
        let result;
        if (user_id) {
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
           if(role===user.role_id){
            return res.status(400).json({ message: 'User cannot search there own record' });
           }
           if((role===roles.employee || role===roles.manager) && (user.role_id===roles.admin))
           {
            return res.status(400).json({ message: 'Access denied: Insufficient privileges to search'})
           }

            result = await UserProject.aggregate([
                {
                    $match: { user_id: user._id }
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "project_id",
                        foreignField: "_id",
                        as: "projectDetails"
                    }
                },
                { $unwind: "$projectDetails" },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    $group: {
                        _id: "$projectDetails._id",
                        Project_name: { $first: "$projectDetails.Project_name" },
                        Project_description:{$first:"$projectDetails.Project_description"},
                        Status:{$first:"$projectDetails.status"},
                        Duration:{$first:"$projectDetails.duration"},
                        users: {
                            $push: {
                                _id: "$userDetails._id",
                                name: "$userDetails.name",
                                email: "$userDetails.email",
                                isAdmin: "$userDetails.isAdmin",
                                isVerified: "$userDetails.isVerified"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        "projectDetails.Project_name": Sort_By && Sort_By.toLowerCase() === 'desc' ? -1 : 1
                    }
                }
            ]);

        } else if (name) {
            const currentUserRole=req.user
            const [users, projects] = await Promise.all([
                User.find({ $text: { $search: name } }),
                Project.find({ $text: { $search: name } })
            ]);
            
            if (!users.length && !projects.length) {
                return res.status(404).json({ message: 'No matching details found' });
            }
            
            const matchCriteria = [];
            if (users.length) {
                const userIds = users.map(user => user._id);
                matchCriteria.push({ user_id: { $in: userIds } });
            }
            if (projects.length) {
                const projectIds = projects.map(project => project._id);
                matchCriteria.push({ project_id: { $in: projectIds } });
            }

            result = await UserProject.aggregate([
                {
                    $match: {
                        $or: matchCriteria
                    }
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "project_id",
                        foreignField: "_id",
                        as: "projectDetails"
                    }
                },
                { $unwind: "$projectDetails" },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    // Filter out users with the same role as the current user
                    $match: {
                        "userDetails.role_id": { $ne:currentUserRole.role}
                    }
                },
                {
                    $group: {
                        _id: "$projectDetails._id",
                        Project_name: { $first: "$projectDetails.Project_name" },
                        Project_description:{$first:"$projectDetails.Project_description"},
                        Status:{$first:"$projectDetails.status"},
                        Duration:{$first:"$projectDetails.duration"},
                        users: {
                            $push: {
                                _id: "$userDetails._id",
                                name: "$userDetails.name",
                                email: "$userDetails.email",
                                isAdmin: "$userDetails.isAdmin",
                                isVerified: "$userDetails.isVerified"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        "projectDetails.Project_name": Sort_By && Sort_By.toLowerCase() === 'desc' ? -1 : 1
                    }
                }
            ]);

        } else {
            const currentUser = req.user; 
            console.log({currentUser })
            result = await UserProject.aggregate([
                {
                    $lookup: {
                        from: "projects",
                        localField: "project_id",
                        foreignField: "_id",
                        as: "projectDetails"
                    }
                },
                { $unwind: "$projectDetails" },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "userDetails"
                    }
                },
                { $unwind: "$userDetails" },
                {
                    $match: {
                        "userDetails._id": { $ne: currentUser.id },  
                        "userDetails.role_id": { $ne: currentUser.role }
                    }
                },
                {
                    $group: {
                        _id: "$projectDetails._id",
                        Project_name: { $first: "$projectDetails.Project_name" },
                        Project_description:{$first:"$projectDetails.Project_description"},
                        Status:{$first:"$projectDetails.status"},
                        Duration:{$first:"$projectDetails.duration"},
                        users: {
                            $push: {
                                _id: "$userDetails._id",
                                name: "$userDetails.name",
                                email: "$userDetails.email",
                                isAdmin: "$userDetails.isAdmin",
                                isVerified: "$userDetails.isVerified"
                            }
                        }
                    }
                },
                {
                    $sort: {
                        "projectDetails.Project_name": Sort_By && Sort_By.toLowerCase() === 'desc' ? -1 : 1
                    }
                }
            ]);
        }
        
        res.status(200).json({ message: 'Projects retrieved successfully', projects:result});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};



