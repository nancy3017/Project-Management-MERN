const User = require('../models/userModel'); 
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt_utils'); 
require('dotenv').config();
const sendEmail=require('../utils/EmailVerification')
const BASE_URL=process.env.BASE_URL
const { verifyToken } = require('../utils/jwt_utils'); 

exports.registerUser = async (req, res) => {
    const { name, email, password} = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }
    
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10); 

        const newUser = await User.create({ name, email, password: hashedPassword});

        if (!newUser || !newUser._id) {
            console.error('Failed to create user:', newUser);
            return res.status(500).json({ message: 'Error creating user' });
        }
        
        const verificationToken = generateToken(newUser._id, newUser.role_id,'60s');
            const url = `${BASE_URL}/${newUser._id}/verify/${verificationToken}`;
            const emailSent = await sendEmail(newUser.email, 'Verify your email', `<a href="${url}">Verify your email</a>`);

            if (!emailSent) {
                return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
            }

            return res.status(200).json({ message: 'User registered successfully, an email has been sent to verify your account' });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ message: 'Error creating user'});
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Error: Please provide both email and password.' });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Error: Invalid credentials. User not found.' });
        }

        if (!user.isVerified) {
            if (!user.password) {
                const result = await setRandomPassword(user, password); 
                if (result.error) {
                    return res.status(500).json({ message: result.error }); 
                }
                return res.status(200).json({ message: 'Success: An email has been sent to set your new password.' }); 
            } else {
                const verificationToken = generateToken(user._id, user.role_id,'60s');
                const url = `${BASE_URL}/${user._id}/verify/${verificationToken}`;
                const emailSent = await sendEmail(user.email, 'Verify Your Email', url);
                
                if (!emailSent) {
                    console.error('Failed to resend verification email to:', user.email);
                    return res.status(500).json({ message: 'Error: Verification email resend failed. Please try again.' });
                }

                console.log('Resent verification email to:', user.email);
                return res.status(400).json({ message: 'Warning: Your email is not verified. A new verification email has been sent.' });
            }
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Error: Invalid credentials. Incorrect password.' });
        }
        const token = generateToken(user._id, user.role_id,'30d');
        user.token = token;
        await user.save();

        return res.status(200).json({ 
            message: 'Success: Login successful.', 
            token: token 
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Error: An unexpected error occurred while logging in. Please try again later.' });
    }
};



const setPassword = async (req, res) => {
    try {
        const { token } = req.params;
        console.log("Received token:", token);

        if (!token) {
            return res.status(403).json({ message: 'Error: No token provided. Please request a new verification email.' });
        }

        const decoded = verifyToken(token);
        const userId = decoded.id; 
        const { newPassword, confirmPassword } = req.body;

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: 'Error: Both new password and confirm password are required.' });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'Error: New password and confirm password do not match.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('User ID:', userId);
        
        const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword, isVerified: true }, { new: true });

        if (!updatedUser) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ message: 'Error: User not found. Unable to set password.' });
        }

        res.status(200).json({ message: 'Success: Email verified and password has been set successfully. You can now log in.' });
    } catch (err) {
        console.error('Error during password setting:', err);
        return res.status(500).json({ message: 'Error: An unexpected error occurred while setting the password. Please try again later.' });
    }
};

const setRandomPassword = async (user, password) => {
    try {
      
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        await user.save();

        const verificationToken = generateToken(user._id, user.role_id,'60s');
        const url = `${BASE_URL}/${user._id}/verify/${verificationToken}`;

        const emailContent = `
        <p>Verify Your Email</p>
        <p>Your password is: <strong>${password}</strong></p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
        `;

        const emailSent = await sendEmail(user.email, 'Verify Your Email', emailContent);
        if (!emailSent) {
            console.error('Email verification failed for:', user.email);
            return { error: 'Warning: User created but email verification failed. Please try again later.' }; 
        }

        return { message: 'Success: An email has been sent to set your new password. Please check your inbox.' }; 
    } catch (error) {
        console.error('Error setting password or sending email:', error);
        return { error: 'Error: An unexpected error occurred while setting the password or sending the email. Please try again later.' };
    }
};

exports.createUserverifyEmail = async (req, res) => {
    const { userId, token } = req.params;
    console.log('Received userId:', userId); 
    console.log('Received token:', token);   
    
    try {
        const decoded = verifyToken(token);
        console.log('Decoded token:', decoded); 

        if (decoded.id !== userId) {
            console.error('UserId mismatch: decoded userId:', decoded.id, 'param userId:', userId);
            return res.status(400).json({ message: 'Invalid token: User ID does not match.' });
        }

        const user = await User.findById(userId);
        console.log('User found:', user);  

        if (!user) {
            console.error('User not found for userId:', userId);
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.isVerified) {
            console.log('User is already verified');
            return res.status(200).json({ message: 'Success: Email is already verified.' });
        }

        await setPassword(req, res);
        return res.status(200).json({ message: 'Success: Email verified.' });

    } catch (error) {
        console.error('Error during email verification:', error);
        console.log(error.name === 'TokenExpiredError')
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Error: Token has expired. Please Login Again' });

        }

        return res.status(500).json({ message: 'Error: An unexpected error occurred during email verification. Please try again later.' });
    }
};



exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist.' });
        }
        const verificationToken=generateToken(user._id, user.role_id,'60s')
        const url = `${BASE_URL}/${user._id}/verify/${verificationToken}`;
        const emailSent = await sendEmail(newUser.email, 'Verify your email', `<a href="${url}">Verify your email</a>`);

        if (!emailSent) {
            return res.status(500).json({ message: 'User created but email verification failed. Please try again.' });
        }

        
        return res.status(200).json({ message: 'Password reset email sent successfully.' });
    } catch (error) {
        console.error('Error in forgot password:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { userId, token } = req.params; 

    try {
        const decoded = verifyToken(token);

        if (decoded.id !== userId) {
            return res.status(403).json({ message: 'Token does not match the user.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified.' });
        }

        user.isVerified = true; 
        await user.save();

        return res.status(200).json({ message: 'Email verified successfully!' });
    } catch (err) {

        if (err.message === 'Access denied. No token provided.') {
            return res.status(400).json({ message: 'Token is required.' });
        } else if (err.message === 'Token has expired') {
            return res.status(401).json({ message: 'Token has expired. Please request a new verification email.Please Login' });
        } else if (err.message === 'Invalid token') {
            return res.status(400).json({ message: 'Invalid token. Please check the verification link.' });
        }

        console.error('Email verification error:', err);
        return res.status(500).json({ message: 'Error verifying email', error: err.message });
    }
};
