import {Response } from "express";
import { de } from "zod/v4/locales";

type TResponse<T> ={
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
}

const sendResponse = <T>(res:Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
    });
}

export default sendResponse;