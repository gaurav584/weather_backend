import {Request,Response, NextFunction } from "express";

export type ControllerType = (
    req:Request,
    res:Response,
    next:NextFunction
) => Promise<void | Response<any,Record<string,any>>>;

export type CreateRequestBody = {
    name:String
}

export type RequestRegisterBody = {
    name:string,
    email:string,
    password:string
}

export type RequestLoginBody = {
    email:string,
    password:string
}

export type UpdateRequestBody = {
    name?:string,
    email?:string,
    password?:string
}

export type ParamsBody = {
    id:string
}