import { Request, Response } from "express";
import { TutorService } from "./tutor.service";
import sendResponse from "../../helpers/sendResponse";
import { UserRole } from "../../middlewares/auth.middleware";

const registerTutor = async (req: Request, res: Response) => {
//   check if user is authenticated
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "You must be logged in to register as a tutor.",
      data: null,
    });
  }

  const userId = req.user.id; // get user id from req.user

//   register tutor profile
  const result = await TutorService.registerTutor(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tutor profile registered successfully",
    data: result,
  });
};

// Get all tutors
const getAllTutors = async (req: Request, res: Response) => {
  const result = await TutorService.getAllTutors();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    data: result,
  });
};

// Get a single tutor by ID
const getSingleTutor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TutorService.getSingleTutor(id as string);

  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Tutor not found",
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutor fetched successfully",
    data: result,
  });
};

// Update a tutor
const updateTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

// check if user is authenticated
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const user = req.user;

// check if tutor profile exists and ownership
  const tutorProfile = await TutorService.getSingleTutor(id as string);
  if (!tutorProfile) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Tutor profile not found",
      data: null,
    });
  }

// check if user is admin or owner
  if (user.role !== UserRole.ADMIN && user.id !== tutorProfile.userId) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "You are not authorized to update this profile",
      data: null,
    });
  }

//   proceed to update
  const result = await TutorService.updateTutor(id as string, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
};

// Delete a tutor
const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params;

// check if user is authenticated
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const user = req.user;

  try {
//    check if tutor profile exists
    const tutorProfile = await TutorService.getSingleTutor(id as string);
    if (!tutorProfile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Tutor profile not found",
        data: null,
      });
    }

//    check if user is admin or owner
    if (user.role !== UserRole.ADMIN && user.id !== tutorProfile.userId) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "You are not authorized to delete this profile",
        data: null,
      });
    }

    const result = await TutorService.deleteTutor(id as string);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tutor profile deleted successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message || "Something went wrong",
      data: null,
    });
  }
};

export const TutorController = {
  registerTutor,
  getAllTutors,
  getSingleTutor,
  updateTutor,
  deleteTutor,
};