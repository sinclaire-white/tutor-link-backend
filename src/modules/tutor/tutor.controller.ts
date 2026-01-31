import { Request, Response } from "express";
import { TutorService } from "./tutor.service";
import sendResponse from "../../helpers/sendResponse";
import { UserRole } from "../../middlewares/auth.middleware";

const registerTutor = async (req: Request, res: Response) => {
  // id comes from our authMiddleware, not the client body
  const userId = req.user!.id;

  const result = await TutorService.registerTutor(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tutor profile registered successfully",
    data: result,
  });
};

// Logic for getting the tutor list
const getAllTutors = async (req: Request, res: Response) => {
  const result = await TutorService.getAllTutors();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    data: result,
  });
};

// Logic for getting a single tutor's details
const getSingleTutor = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await TutorService.getSingleTutor(id);

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

const updateTutor = async (req: Request, res: Response) => {
  const { id } = req.params; // The Tutor ID being targeted
  const user = req.user!; // The logged-in user (Admin or Tutor)

  //  Fetch the tutor profile to see who owns it
  const tutorProfile = await TutorService.getSingleTutor(id as string);

  // Security Check:
  // If the user is NOT an Admin AND the logged-in ID doesn't match the profile's UserID...
  if (user.role !== UserRole.ADMIN && user.id !== tutorProfile?.userId) {
    return sendResponse(res, {
      statusCode: 403,
      success: false,
      message: "You are not authorized to update this profile",
      data: null,
    });
  }

  const result = await TutorService.updateTutor(id as string, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
};

// Logic for deleting a tutor profile
// Logic for deleting a tutor profile
const deleteTutor = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const user = req.user!; // The logged-in user

  try {
    // Ownership & Existence Check
    const tutorProfile = await TutorService.getSingleTutor(id);
    
    if (!tutorProfile) {
      return sendResponse(res, {
        statusCode: 404,
        success: false,
        message: "Tutor profile not found",
        data: null,
      });
    }

    // Only Admin or the actual owner can delete
    if (user.role !== UserRole.ADMIN && user.id !== tutorProfile.userId) {
      return sendResponse(res, {
        statusCode: 403,
        success: false,
        message: "You are not authorized to delete this profile",
        data: null,
      });
    }

    // 2. Call the service (which checks for active bookings)
    const result = await TutorService.deleteTutor(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tutor profile deleted and user reverted to Student role successfully",
      data: result,
    });
  } catch (error: any) {
    // Catch the specific "Active Sessions" error from Service
    if (error.message === "CANNOT_DELETE_WITH_ACTIVE_SESSIONS") {
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "You cannot delete your profile while you have active or upcoming sessions.",
        data: null,
      });
    }

    // Handle other potential errors
    sendResponse(res, {
      statusCode: 500,
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
