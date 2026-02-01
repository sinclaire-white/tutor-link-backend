import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import sendResponse from "../../helpers/sendResponse";

const createReview = async (req: Request, res: Response) => {
  // Safe User Check
  if (!req.user) {
    return sendResponse(res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      data: null,
    });
  }

  const result = await ReviewService.createReview(req.user.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
};

const getTutorReviews = async (req: Request, res: Response) => {
  const { tutorId } = req.params;
  const result = await ReviewService.getTutorReviews(tutorId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
};

export const ReviewController = { createReview, getTutorReviews };
