const mongoose = require("mongoose");

const userProjectSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    project_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

const UserProject = mongoose.model("UserProject",  userProjectSchema);
module.exports = UserProject;


