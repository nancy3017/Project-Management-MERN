const mongoose = require("mongoose");

const UserTaskSchema = mongoose.Schema({
    task_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
}, {
    timestamps: true
});

const UserTask = mongoose.model(" UserTask", UserTaskSchema);
module.exports =  UserTask;
