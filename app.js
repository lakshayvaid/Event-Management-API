const express=require('express');
const dotenv=require('dotenv');

dotenv.config();

const app=express();
app.use(express.json());



app.get("/",(req,res)=>{
    res.send("Event Management API is running ");
});

const eventRoutes = require("./routes/eventRoutes");
app.use("/events", eventRoutes);



module .exports=app;