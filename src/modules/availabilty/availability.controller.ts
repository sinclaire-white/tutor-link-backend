import { Request, Response } from "express";
import { AvailabilityService } from "./availability.service";
import sendResponse from "../../utils/sendResponse";
import { prisma } from "../../lib/prisma";
import catchAsync from "../../utils/catchAsync";
import AppError from "../../errors/AppError";
import { IAvailabilityParams, IUpdateAvailabilityPayload } from "./availability.interface";

const updateMyAvailability = catchAsync(async (req: Request, res: Response) => {
  // Map User to Tutor profile
  const tutorProfile = await prisma.tutor.findUnique({
    where: { userId: req.user.id },
  });

  if (!tutorProfile) {
    throw new AppError(404, "Tutor profile not found");
  }
const result = await AvailabilityService.updateAvailability(
    tutorProfile.id, 
    (req.body as IUpdateAvailabilityPayload).slots
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Weekly availability updated successfully",
    data: result,
  });
});

const getTutorAvailability = catchAsync(async (req: Request<IAvailabilityParams>, res: Response) => {
  const { tutorId } = req.params;
  
  const result = await AvailabilityService.getTutorAvailability(tutorId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Availability slots retrieved successfully",
    data: result,
  });
});

export const AvailabilityController = {
  updateMyAvailability,
  getTutorAvailability,
};