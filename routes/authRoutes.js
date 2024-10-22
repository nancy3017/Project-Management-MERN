const express = require('express');
const authController=require("../controllers/authController")
const router = express.Router();

router.post('/Register',authController.register);
router.post('/login',authController.login)      
// router.post('/verifyEmail/:userId/verify/:token',authController.createUserverifyEmail)
router.post('/forgotPassword',authController.forgotPassword)
router.get('/verifyEmail/:userId/verify/:token',authController.verifyEmail);

module.exports = router;


