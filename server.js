const express=require("express")
const dotenv=require("dotenv")
const connectDB=require("./config/db")
const routes = require('./routes/routes'); 
const app=express()
dotenv.config()
connectDB()
app.use(express.json());
app.use('/api', routes);    
const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
}) 

