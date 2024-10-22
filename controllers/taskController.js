require('dotenv').config();
const {roles}=require('../utils/roles')
const CreateTask=require('../models/taskModel')


//only admins and  project managers can create a new task if task is already created they cannot create it again

exports.createTask=async(req,res)=>{
    const {role}=req.user
    const {taskName,Description,Status,Priority,startDate,endDate,projectId}=req.body
    try{
        const existingTask = await Task.findOne({taskName})
        if (!taskName || !Status || !Priority || !projectId) {
            return res.status(400).json({ message: 'Missing required fields. Task_Name, Status, Priority, and Project_id are required.' });
        }
        if (existingTask) {
            return res.status(400).json({ message: 'Task already exists' });
        }
        if(role===roles.employee){
            return res.status(400).json({message:'Access denied: Insufficient privileges to create a task. Please contact an administrator for assistance.'})
        }
        const validStatuses = ['pending', 'inprogress', 'done'];
        if (!validStatuses.includes(Status)) {
            return res.status(400).json({ message: `Invalid Status. Allowed values are: ${validStatuses.join(', ')}` });
        }
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(Priority)) {
            return res.status(400).json({ message: `Invalid Priority. Allowed values are: ${validPriorities.join(', ')}` });
        }
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return res.status(400).json({ message: 'Invalid Project ID' });
        }
        const newTask=await Task.create({taskName,Description,Status,Priority,startDate,endDate,projectId})
        return res.status(200).json({message:'Task created Successfully',newTask}) 
    }
    catch(error){
        console.error(error); 
        res.status(500).json({ message: error.message });
    }
}


// delete

// exports.deleteTask=async(req,res)=>{
//     const {id}=req.params
//     const {role}=req.user
//     try{
//         const deletedTask = await Task.findByIdAndDelete(req.params.id);
//         if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
//         if (role===3) return res.status(400).json({message:'Access denied: Insufficient privileges to create a task. Please contact an administrator for assistance.'}) 
//         res.json({ message: 'Task deleted successfully' });
//     }
//     catch(error){
//         res.status(500).json({ message: err.message });
//     }
// }

exports.deleteTask = async (req, res) => {
    const { id } = req.params;
    const { role } = req.user;

    try {
        if (role === roles.employee) {
            return res.status(403).json({ 
                message: 'Access denied: Insufficient privileges to delete a task. Please contact an administrator for assistance.' 
            });
        }

        const taskToDelete = await Task.findById(id);
        if (!taskToDelete) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await taskToDelete.remove();
        return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        return res.status(500).json({ message: 'An error occurred while deleting the task. Please try again later.' });
    }
};


exports.getAllTask = async (req, res) => {
    try {
        const tasks = await Task.find();
        if (!tasks.length) {
            return res.status(404).json({ message: 'No tasks found.' });
        }
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ message: 'An error occurred while fetching tasks. Please try again later.' });
    }
};


// // Update a task by ID
// router.patch('/:id', async (req, res) => {
//     try {
//         const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
//         if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
//         res.json(updatedTask);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });



exports.updateTask = async (req, res) => {
    const { id } = req.params;
    const { role } = req.user;
    const { Task_Name, Description, Status, Priority, Start_Date, End_Date, Project_id } = req.body;

    try {
        if (role === roles.employee) {
            return res.status(403).json({
                message: 'Access denied: Insufficient privileges to update a task. Please contact an administrator for assistance.'
            });
        }
        const task = await Task.findById(id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const validStatuses = ['pending', 'inprogress', 'done'];
        if (Status && !validStatuses.includes(Status)) {
            return res.status(400).json({ message: `Invalid Status. Allowed values are: ${validStatuses.join(', ')}` });
        }

        const validPriorities = ['low', 'medium', 'high'];
        if (Priority && !validPriorities.includes(Priority)) {
            return res.status(400).json({ message: `Invalid Priority. Allowed values are: ${validPriorities.join(', ')}` });
        }
        if (Start_Date && End_Date && new Date(Start_Date) > new Date(End_Date)) {
            return res.status(400).json({ message: 'Start Date cannot be later than End Date' });
        }
        task.Task_Name = Task_Name || task.Task_Name;
        task.Description = Description || task.Description;
        task.Status = Status || task.Status;
        task.Priority = Priority || task.Priority;
        task.Start_Date = Start_Date || task.Start_Date;
        task.End_Date = End_Date || task.End_Date;
        task.Project_id = Project_id || task.Project_id;

        const updatedTask = await task.save();
        return res.status(200).json({ message: 'Task updated successfully', updatedTask });

    } catch (error) {
        console.error('Error updating task:', error);
        return res.status(500).json({ message: 'An error occurred while updating the task. Please try again later.' });
    }
};