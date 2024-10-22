const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const verifyToken = async(req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No token provided' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({_id: verified.id});
        if (!user) {
            return res.status(403).json({ message: 'User not found' });
        }
        req.user = verified; 
        next(); 
    } catch (error) { 
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Error: Token has expired' });

        }
        return res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = verifyToken;


