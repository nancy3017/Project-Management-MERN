const jwt = require('jsonwebtoken');
const dotenv=require("dotenv")
dotenv.config()
const JWT_SECRET=process.env.JWT_SECRET 

exports.generateToken = (userId, roleId) => {
    const payload = {
        id: userId,
        role: roleId
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
    return token;
};


exports.verifyToken = (token) => {
    if (!token) {
        console.error('Access denied. No token provided.');
        throw new Error('Access denied. No token provided.');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded); 
        return decoded;
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('Token has expired:', err); 
            throw new Error('Token has expired');
        } else {
            console.error('Invalid token:', err); 
            throw new Error('Invalid token');
        }
    }
};

