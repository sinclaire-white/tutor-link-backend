import { Request, Response } from "express";
import { TutorService } from "./tutor.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { UserRole } from "../../middlewares/auth.middleware";
import AppError from "../../errors/AppError";
import { ITutorParams, ITutorRegistration } from "./tutor.interface";

/**
 * Validates that the tutor ID is present.
 * This function acts as a 'Type Guard'.
 * By throwing an error if ID is missing, TypeScript knows that
 * after this function runs, 'id' is definitely a string.
 */
const validateId = (id: string | undefined): string => {
  if (!id) {
    throw new AppError(400, "Tutor ID is required");
  }
  return id;
};

// Wraps logic in catchAsync to forward errors to the globalErrorHandler
const registerTutor = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id; // user object is attached by authMiddleware
  const result = await TutorService.registerTutor(
    userId,
    req.body as ITutorRegistration,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Tutor profile registered successfully",
    data: result,
  });
});

// Fetches all tutors
const getAllTutors = catchAsync(async (req: Request, res: Response) => {
  const result = await TutorService.getAllTutors();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Tutors fetched successfully",
    data: result,
  });
});

const getSingleTutor = catchAsync(
  async (req: Request<ITutorParams>, res: Response) => {
    // Use helper to validate and cast ID to string
    const id = validateId(req.params.id);

    const result = await TutorService.getSingleTutor(id);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tutor fetched successfully",
      data: result,
    });
  },
);

const updateTutor = catchAsync(
  async (req: Request<ITutorParams>, res: Response) => {
    // Use helper to validate and cast ID to string
    const id = validateId(req.params.id);
    const user = req.user;

    // We call getSingleTutor from service to check ownership
    const tutorProfile = await TutorService.getSingleTutor(id);

    // Authorization: Only Admin or the owner can update
    if (user.role !== UserRole.ADMIN && user.id !== tutorProfile.userId) {
      throw new AppError(403, "You are not authorized to update this profile");
    }

    const result = await TutorService.updateTutor(id, req.body);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
  },
);

const deleteTutor = catchAsync(
  async (req: Request<ITutorParams>, res: Response) => {
    // Use helper to validate and cast ID to string
    const id = validateId(req.params.id);
    const user = req.user;

    const tutorProfile = await TutorService.getSingleTutor(id);

    // Authorization: Only Admin or the owner can delete
    if (user.role !== UserRole.ADMIN && user.id !== tutorProfile.userId) {
      throw new AppError(403, "You are not authorized to delete this profile");
    }

    const result = await TutorService.deleteTutor(id);
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Tutor profile deleted successfully",
      data: result,
    });
  },
);

export const TutorController = {
  registerTutor,
  getAllTutors,
  getSingleTutor,
  updateTutor,
  deleteTutor,
};
