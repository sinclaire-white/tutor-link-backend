import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { IUpdateUserProfilePayload } from "./user.interface";

// get current user's profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

// update current user's profile
const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.updateMyProfile(
    req.user.id,
    req.body as IUpdateUserProfilePayload,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
};

// Admin helpers
const listUsers = catchAsync(async (req: Request, res: Response) => {
  const { q, page, perPage } = req.query as { q?: string; page?: string; perPage?: string };
  const p = page ? parseInt(page, 10) : 1;
  const pp = perPage ? parseInt(perPage, 10) : 10;
  const result = await (require("./user.service").UserService.listUsers({ search: q, page: p, perPage: pp }));
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { suspended } = req.body as { suspended: boolean };
  const result = await (require("./user.service").UserService.setUserSuspended(id, !!suspended));
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

Object.assign(UserController, { listUsers, suspendUser });
