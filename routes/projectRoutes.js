const express = require('express');
const projectController=require("../controllers/projectController")
const router = express.Router();
const istokenvalid = require('../middlewares/tokenVerificationMiddleware');


router.post('/projects/create-project',istokenvalid,projectController.createProject);
router.post('/projects/assign-unassign',istokenvalid,projectController.setProjectTaskAssignment);
router.get('/projects',istokenvalid,projectController.getAllProjectList); 

module.exports = router;