const express=require("express")
const dotenv=require("dotenv")
const connectDB=require("./config/db")
const authRoutes = require('./routes/authRoutes'); 
const app=express()
dotenv.config()
connectDB()
app.use(express.json());
app.use('/api', authRoutes);
const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}) 

