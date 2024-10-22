const express = require('express');
const taskController=require("../controllers/taskController")
const router = express.Router();
const istokenvalid = require('../middlewares/tokenVerificationMiddleware');


router.post('/tasks/create-task',istokenvalid,taskController.createTask)
router.delete('/tasks/delete-task/:id',istokenvalid,taskController.deleteTask)
router.get('/tasks',istokenvalid,taskController.getAllTask)
router.patch('/tasks/update-task',istokenvalid,taskController.updateTask)

module.exports = router;
