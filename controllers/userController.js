const User = require('../models/userModel'); 
const { generateToken } = require('../utils/jwt_utils'); 
require('dotenv').config();
const sendEmail=require('../utils/EmailVerification')
const BASE_URL=process.env.BASE_URL
const {roles}=require('../utils/roles')
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');


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
            const verificationToken = generateToken(newUser._id, newUser.role_id,'60s');
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

exports.uploadCsvFile = async (req, res) => {
    if (!req.file) {
        console.log('No file uploaded');
        return res.status(400).send('No file uploaded');
    }

    const results = [];
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    console.log('File Path:', filePath);

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
            console.log('Row Data:', data); 
            results.push(data);
        })
        .on('end', async () => {
            console.log('CSV file reading completed');
            console.log('Results:', results); 

            const validFields = ['name', 'email', 'password'];
            const missingFields = [];

            results.forEach((row, index) => {
                validFields.forEach((field) => {
                    if (!row[field]) {
                        missingFields.push({ row: index + 1, field });
                    }
                });
            });

            if (missingFields.length > 0) {
                console.log('Missing Fields:', missingFields); 
                return res.status(400).json({
                    message: 'Missing fields in CSV file',
                    missingFields,
                });
            }
            if (results.length > 25) {
                const excessRecords = results.length - 25;
                const limitedResults = results.slice(0, 25);

                console.log("More than 25 records, limiting to 25");
                console.log("Limited Results:", limitedResults);
                console.log("Excess Records:", excessRecords);

                try {
                    await User.insertMany(limitedResults);
                    console.log("Inserted 25 records into the database");
                    return res.status(200).json({
                        message: '25 records from the CSV have been imported. The rest were not imported. Please modify the CSV and try again.',
                        importedCount: limitedResults.length,
                        excessCount: excessRecords,
                        data: limitedResults,
                    });
                } catch (error) {
                    console.error("Error inserting data into the database:", error);
                    return res.status(500).json({ message: 'Error inserting data into database', error });
                }
            }

            // Bulk insert into MongoDB using Mongoose
            try {
                await User.insertMany(results);
                console.log('Data successfully inserted into database'); // Log successful insertion
                res.status(200).json({
                    message: 'CSV file uploaded and processed successfully!',
                    data: results,
                });
            } catch (error) {
                console.log('Error inserting data into database:', error); // Log error during insertion
                res.status(500).json({
                    message: 'Error inserting data into database',
                    error,
                });
            }

            // Remove the file after processing
            try {
                fs.unlinkSync(filePath);
                console.log('File removed successfully:', filePath); // Log file removal success
            } catch (error) {
                console.log('Error removing file:', error); // Log file removal error
            }
        })
        .on('error', (error) => {
            console.log('Error processing CSV file:', error); // Log CSV processing error
            res.status(500).send('Error processing CSV file.');
        });
};


exports.getcvsFile= async (req, res) => {
    console.log("hello")
    try {
        // Fetch data from MongoDB
        const users = await User.find({});

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Set the path where the CSV file will be saved
        const filePath = path.join(__dirname, '../uploads/users.csv');
       console.log({filePath})
        // Create CSV writer instance
        const csvWriter = createCsvWriter({
            path: filePath,
            header: [
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'password', title: 'Password' }, // Caution: avoid exporting passwords in real applications!
            ],
        });
        const userRecords = users.map(user => ({
            name: user.name,
            email: user.email,
            password: user.password
        }));

        // Write data to CSV
        await csvWriter.writeRecords(userRecords); // Write MongoDB records to CSV file
        console.log(userRecords)
        console.log('CSV file created successfully');

        // Send the CSV file as a response to the client
        res.download(filePath, 'users.csv', (err) => {
            const emailSent = sendEmail('nainsi.elitesigma@gmail.com', 'CSV File','text',filePath);

            if (!emailSent) {
                return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
            }
    
            if (err) {
                console.log('Error downloading file:', err);
                res.status(500).send('Error downloading file');
            }
        });

    } catch (error) {
        console.log('Error exporting users:', error);
        res.status(500).json({ message: 'Error exporting users', error });
    }
};



