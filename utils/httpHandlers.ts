import type { Response } from "express";
import {ServiceResponse} from "./serviceResponse";

export const sendResponse = (res:Response, serviceResponse:ServiceResponse<any>,response:Response):Response => {
    const {statusCode,success,message,result,...rest}=serviceResponse
    return response.status(statusCode).json({
        success,
        message,
        result,
        ...rest
    });
};