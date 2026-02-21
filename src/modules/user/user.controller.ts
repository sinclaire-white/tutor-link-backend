import { Request, Response } from "express";
import { UserService } from "./user.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { IUpdateUserProfilePayload } from "./user.interface";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getMyProfile(req.user.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const result = await UserService.getUserById(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

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

const listUsers = catchAsync(async (req: Request, res: Response) => {
  const { q, page, perPage, includeSuspended } = req.query as { 
    q?: string; 
    page?: string; 
    perPage?: string;
    includeSuspended?: string;
  };
  
  const p = page ? parseInt(page, 10) : 1;
  const pp = perPage ? parseInt(perPage, 10) : 10;
  const includeSus = includeSuspended === 'true';
  
  const result = await UserService.listUsers({ 
    search: q, 
    page: p, 
    perPage: pp,
    includeSuspended: includeSus 
  });
  
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

// Admin: Suspend user
const suspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const result = await UserService.suspendUser(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User suspended successfully",
    data: result,
  });
});

// Admin: Unsuspend user
const unsuspendUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  const result = await UserService.unsuspendUser(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User reactivated successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = Array.isArray(id) ? id[0] : id;
  await UserService.deleteUser(userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: null,
  });
});

export const UserController = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  listUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
};