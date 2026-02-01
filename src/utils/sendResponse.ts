import {Response } from "express";

// Generic response type
type TResponse<T> ={
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
}

// Function to send standardized responses
const sendResponse = <T>(res:Response, data: TResponse<T>) => {
    res.status(data.statusCode).json({
        success: data.success,
        message: data.message,
        data: data.data,
    });
}

export default sendResponse;