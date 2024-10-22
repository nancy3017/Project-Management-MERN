const User = require('../models/userModel'); 
const { generateToken } = require('../utils/jwt_utils'); 
require('dotenv').config();
const sendEmail=require('../utils/EmailVerification')
const BASE_URL=process.env.BASE_URL
const {roles}=require('../utils/roles')



/* soft delete the user in which after deletion isDeleted filed will have date instead of null at initial only admin can delete user
Admins: Can delete any user // Managers: Can delete employees but not other managers or admins // Employees: Cannot delete any users.**/

exports.deleteUser = async (req, res) => {
    try {
        const userIdToDelete = req.params.id;
        const { role } = req.user; 

        const userToDelete = await User.findById(userIdToDelete);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToDelete.isDeleted!==null) {
            return res.status(400).json({ message: 'User is already deleted' });
        }
    
        if (role === roles.admin) {
            if (userToDelete.isDeleted == null) 
            {
            await User.updateOne({ _id: req.params.id }, { $set: { isDeleted:Date() } });
            return res.status(200).json({ message: 'User deleted successfully' });
            }

        } else if (role === roles.manager) {
            if (userToDelete.role === roles.employee) {
                if (userToDelete.isDeleted == null) {
                    await User.updateOne({ _id: req.params.id }, { $set: { isDeleted:Date() } });
                    return res.status(200).json({ message: 'User deleted successfully' });
                    }
            } else {
                return res.status(403).json({ message: 'Access denied: You cannot delete this user' });
            }
        } else {
            return res.status(403).json({ message: 'Access denied: You cannot delete users' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


exports.createUser = async (req, res) => {
    const { role: currentUserRoleId } = req.user; 
        const { name, email, role_id: newUserRoleId } = req.body; 

        if (!name || !email || newUserRoleId === undefined) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }
    try {
        if ((currentUserRoleId === roles.admin) || (currentUserRoleId === roles.manager && newUserRoleId !== roles.admin)) {
            const newUser = await User.create({ name, email, role_id: newUserRoleId });
            const verificationToken = generateToken(newUser._id, newUser.role_id);
            const url = `${BASE_URL}/${newUser._id}/verify/${verificationToken}`;
            const emailSent = await sendEmail(newUser.email, 'Verify your email', `<a href="${url}">Verify your email</a>`);

            if (!emailSent) {
                return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
            }

            return res.status(200).json({ message: 'User registered successfully, an email has been sent to verify your account' });
        } else {
            return res.status(400).json({ message: 'You do not have access to create users' });
        }
    } catch (err) {
        console.error('Error creating user:', err.message); 
        return res.status(500).json({ message: 'Error creating user' });
    }
};
// exports.createUser = async (req, res) => {
//     try {
//         const { role: currentUserRoleId } = req.user; 
//         const { name, email, role_id: newUserRoleId } = req.body; 
//         s
//         if (!name || !email || newUserRoleId === undefined) {
//             return res.status(400).json({ message: 'Please provide all fields' });
//         }
      
//         if (currentUserRoleId === 1) {
//             const newUser = await User.create({ name, email, role_id: newUserRoleId });
//             const verificationToken = generateToken(newUser._id, newUser.role_id);
//             const url = `${BASE_URL}/${newUser._id}/verify/${verificationToken}`;
//             const emailSent=await sendEmail(newUser.email, 'Verify your email',`<a href="${url}">Verify your email</a>`);
//             if (!emailSent) {
//                 return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
//             }
//             return res.status(200).json({ message: 'User registered successfully, an email has been sent to verify your account' });
//         } 
//         else if (currentUserRoleId === 2) { 
//             if (newUserRoleId === 1) { 
//                 return res.status(400).json({ message: 'You do not have access to create an admin user' });
//             }
//             const newUser = await User.create({ name, email, role_id: newUserRoleId });
//             const verificationToken = generateToken(newUser._id, newUser.role_id);
//             const url = `${BASE_URL}/${newUser._id}/verify/${verificationToken}`;
//             const emailSent=await sendEmail(newUser.email, 'Verify your email', `<a href="${url}">Verify your email</a>`);
//             if (!emailSent) {
//                 return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
//             }
//             return res.status(200).json({ message: 'User registered successfully, an email has been sent to verify your account' });
//         } 
//         else {
//             return res.status(400).json({ message: 'You do not have access to create users' });
//         }
//     } catch (err) {
//         console.error('Error creating user:', err);
//         return res.status(500).json({ message: 'Error creating user' });
//     }
// };

// exports.getAssignedProjects = async (req, res) => {
//     try {
//         const {role}=req.user
//         if(role===3){
//             return res.status(400).json({ message: 'Error: You are not authorized to access this endpoint.' });
//         }
//         const assignedProjects = await UserProject.find({});
//         if (!assignedProjects.length) {
//             return res.status(404).json({ message: "No projects assigned" });
//         }
//         return res.status(200).json({ projects: assignedProjects });
//     } catch (err) {
//         console.error("Error fetching assigned projects:", err);
//         return res.status(500).json({ message: "Error fetching projects" });
//     }
// };


/*assign role to user admin is logged in can assign any role to any user, emp cannot assign any role, manager cannot assign to admin*/

exports.assignRoleToUser = async (req, res) => {
    const { role } = req.user; 
    const { userId, roleId } = req.params; 

    try {
        const user = await User.findOne({ _id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (role === roles.employee) {
            return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
        }
        if (role === roles.admin) {

            user.role_id= roleId; 
            await user.save(); 
            return res.status(200).json({ message: 'Role assigned successfully', user });
        }
        
        if (role === roles.manager) {
            if (roleId > 2) {
                return res.status(403).json({ message: 'Access denied: Cannot assign higher or equal role' });
            }
            user.role_id = roleId; 
            await user.save(); 
            return res.status(200).json({ message: 'Role assigned successfully', user });
        }
        return res.status(400).json({ message: 'Invalid role assignment request' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error', error });
    }
};