import express from "express";
import { createLocation, getLocation, updateLocation } from "../controller/Location";

const app = express.Router();

app.post("/create",createLocation);
app.get("/find/all",getLocation);
app.put("/update/:id",updateLocation);
app.delete("/delete/:id",updateLocation);

export default app;