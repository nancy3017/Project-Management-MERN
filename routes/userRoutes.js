const express = require('express');
const userController=require("../controllers/userController")
const router = express.Router();
const istokenvalid = require('../middlewares/tokenVerificationMiddleware');


router.delete('/users/delete/:id',istokenvalid,userController.deleteUser)
router.post('/users/create-user',istokenvalid,userController.createUser)
router.patch('/users/assignrole/:userId/:roleId',istokenvalid,userController.assignRoleToUser)

module.exports = router;