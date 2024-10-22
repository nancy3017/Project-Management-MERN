const jwt = require('jsonwebtoken'); 
const User = require('../models/users');
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET; 

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log("Token:", token); // Log the token for debugging

        if (!token) return res.status(403).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded:", decoded); // Log the decoded token for debugging

        const user = await User.findOne({ _id: decoded.id });
        console.log({ user });

        if (!user) {
            return res.status(403).json({ message: 'User not found' });
        }

        console.log({ isAdmin: user.role_id === 1 });

        // Assuming role_id 1 corresponds to admin, only allow access for admins
        if (user.role_id !== 1) {
            return res.status(403).json({ message: 'Access denied, admin privileges required' });
        }

        req.user = user; 
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error("Error:", error); // Log any errors
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = isAdmin;
