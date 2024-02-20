import {Request,Response, NextFunction } from "express";
import ErrorHandler from "./exceptions";
import { ControllerType } from "../types/types";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {

    err.message ||="Internal server error";
    err.statusCode ||=500;

    if(err.name === "CastError"){
        err.message="Invalid Id"
    }

    return res.status(400).json({
        success:false,
        message:err.message,
    })
};


// Middleware for reusable of try-catch block

export const TryCatch = (func:ControllerType) => (req:Request,res:Response,next:NextFunction) => {
    return Promise.resolve(func(req,res,next)).catch(next);
}
