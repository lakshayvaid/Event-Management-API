const express=require('express');
const dotenv=require('dotenv');

dotenv.config();


const errorHandler = require("./middlewares/errorHandler");

const rateLimit = require("express-rate-limit");

const app=express();
app.use(express.json());

// Apply to all routes: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

app.get("/",(req,res)=>{
    res.send("Event Management API is running ");
});

app.use(errorHandler);

const eventRoutes = require("./routes/eventRoutes");
app.use("/events", eventRoutes);



module .exports=app;