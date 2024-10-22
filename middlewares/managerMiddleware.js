
// const isManager = (req, res, next) => {
//     const { user_id } = req.params.id; 
//     const user = await User.findById(user_id);
//     if (role_id === 2) { 
//         return next();
//     } else {
//         return res.status(403).json({ message: "Access forbidden: only managers can view this information" });
//     }
// };
// module.exports =isManager;


const isManager = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log({id}) 
        const user = await User.findById(id); 
        console.log({user})
        console.log(user.role_id)
        console.log(user.role_id===2)
        if (user.role_id === 2) {
            return next();
        } else {
            return res.status(403).json({ message: "Access forbidden: only managers can view this information" });
        }
    } catch (err) {
        console.error("Error verifying manager:", err);
        return res.status(500).json({ message: "Error verifying user role" });
    }
};

module.exports = isManager;