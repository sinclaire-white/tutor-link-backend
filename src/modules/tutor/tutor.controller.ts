import { Request, Response } from "express";
import { TutorService } from "./tutor.service";
import sendResponse from "../../helpers/sendResponse";

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

export const TutorController = {
  registerTutor,
  getAllTutors,
};