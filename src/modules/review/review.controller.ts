import { Request, Response } from "express";
import { ReviewService } from "./review.service";
import sendResponse from "../../utils/sendResponse";
import { ICreateReviewPayload, IReviewParams } from "./review.interface";
import catchAsync from "../../utils/catchAsync";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(
    req.user.id, 
    req.body as ICreateReviewPayload
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted successfully",
    data: result,
  });
});

const getTutorReviews = catchAsync(async (req: Request<IReviewParams>, res: Response) => {
  const { tutorId } = req.params;
  
  const result = await ReviewService.getTutorReviews(tutorId as string);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

export const ReviewController = { createReview, getTutorReviews };
