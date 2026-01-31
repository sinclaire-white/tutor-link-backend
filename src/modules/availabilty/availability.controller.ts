import { Request, Response } from "express";
import { AvailabilityService } from "./availability.service";
import sendResponse from "../../helpers/sendResponse";
import { prisma } from "../../lib/prisma";

const updateMyAvailability = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Map the User to their Tutor profile 
  const tutorProfile = await prisma.tutor.findUnique({
    where: { userId },
  });

  if (!tutorProfile) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Tutor profile not found.",
      data: null,
    });
  }

  const result = await AvailabilityService.updateAvailability(tutorProfile.id, req.body.slots);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Weekly availability updated successfully.",
    data: result,
  });
};

const getTutorAvailability = async (req: Request, res: Response) => {
    // For students viewing a specific tutor's availability
  const { tutorId } = req.params;  
  const result = await AvailabilityService.getTutorAvailability(tutorId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Availability slots retrieved successfully.",
    data: result,
  });
};

export const AvailabilityController = {
  updateMyAvailability,
  getTutorAvailability,
};