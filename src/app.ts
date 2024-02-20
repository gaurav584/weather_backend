import express from "express";
import { connectDb } from "./services/db";
import cors from "cors";

const app = express();

// env-variables 
const port = 9000;
const uri ="mongodb://127.0.0.1:27017/"


// Database-connection
connectDb(uri);

// default-middlewares
app.use(express.json());
app.use(cors());

// Routes
import userRoute from "./router/user";
import locationRoute from "./router/Location";

app.use("/api/v1/user",userRoute);
app.use("/api/v1/location",locationRoute);

// server 
app.listen(port,()=>{
    console.log(`server is working on ${port}`);
})