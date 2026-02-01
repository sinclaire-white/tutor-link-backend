import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";

const getMyProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, { statusCode: 401, success: false, message: "Unauthorized", data: null });
  }

  const result = await UserService.getMyProfile(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
};

const updateMyProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return sendResponse(res, { statusCode: 401, success: false, message: "Unauthorized", data: null });
  }

  const result = await UserService.updateMyProfile(req.user.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
};

export const UserController = { getMyProfile, updateMyProfile };