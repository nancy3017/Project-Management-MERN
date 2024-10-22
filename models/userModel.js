const mongoose=require("mongoose")
const userschema=mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String},
    role_id:{type:Number,required:true},
    isVerified:{type:Boolean,default:false},
    isDeleted:{type: Date, default:null},
    token:{type:String}
},{
    timestamps:true
})
userschema.index({ name: 'text' });
const User=mongoose.model("User",userschema)
module.exports=User

// [
//     {
//         "name": "John Doe",
//         "email": "johndoe@example.com",
//         "password": "$2b$10$abcdef1234567890hashedpasswordhere",  // Assume this is a bcrypt hashed password
//         "role_id": 1,
//         "isVerified": true,
//         "isDeletd": null,
//         "token": "samplejwttokenhere"
//     },
//     {
//         "name": "Jane Smith",
//         "email": "janesmith@example.com",
//         "password": "$2b$10$abcdef1234567890hashedpasswordhere",  // Assume this is a bcrypt hashed password
//         "role_id": 2,
//         "isVerified": false,
//         "isDeletd": null,
//         "token": null
//     },
//     {
//         "name": "Michael Johnson",
//         "email": "michaelj@example.com",
//         "password": "$2b$10$abcdef1234567890hashedpasswordhere",  // Assume this is a bcrypt hashed password
//         "role_id": 3,
//         "isVerified": true,
//         "isDeletd": "2023-09-15T10:23:00.000Z", // Soft delete timestamp
//         "token": "samplejwttoken

