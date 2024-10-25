const express = require('express');
const authController=require("../controllers/authController")
const router = express.Router();
const taskController=require("../controllers/taskController")
const istokenvalid = require('../middlewares/tokenVerificationMiddleware');
const userController=require("../controllers/userController")
const multer = require('multer');
const projectController=require('../controllers/projectController')
const dashboardController=require('../controllers/dashboardController')
const upload = multer({
    dest: 'uploads/',
});


router.post('/register',authController.registerUser);
router.post('/login',authController.login)      
// router.post('/verifyEmail/:userId/verify/:token',authController.createUserverifyEmail)
router.post('/forgotPassword',authController.forgotPassword)
router.get('/verifyEmail/:userId/verify/:token',authController.verifyEmail);


router.post('/tasks/create',istokenvalid,taskController.createTask)
router.delete('/tasks/delete/:id',istokenvalid,taskController.deleteTask)
router.get('/tasks',istokenvalid,taskController.getAllTask)
router.patch('/tasks/update/:id',istokenvalid,taskController.updateTask)


router.delete('/users/delete/:id',istokenvalid,userController.deleteUser)
router.post('/users/create-user',istokenvalid,userController.createUser)
router.patch('/users/assignrole/:userId/:roleId',istokenvalid,userController.assignRoleToUser)
router.post('/upload-csv', upload.single('csvfile'),userController.uploadCsvFile);
router.get('/csv',userController.getcvsFile)

router.post('/projects/create-project',istokenvalid,projectController.createProject);
router.get('/projects',istokenvalid,projectController.getAllProjectList); 
router.delete('/projects/delete-project/:id',istokenvalid,projectController.deleteProject);
router.patch('/projects/update-project/:id',istokenvalid,projectController.updateProject)
router.post('/projects/assign-unassign',istokenvalid,projectController.setProjectTaskAssignment);
router.get('/projects/assigned-projects',istokenvalid,projectController.getAssignedProjects)

router.get('/dashboard',dashboardController.dashboardapi)
module.exports = router;


