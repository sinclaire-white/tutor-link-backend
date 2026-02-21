import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import crypto from "crypto";

const getSignature = catchAsync(async (req: Request, res: Response) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured");
  }

  const paramsToSign = `folder=tutorlink/profiles&timestamp=${timestamp}&upload_preset=tutorlink_unsigned${apiSecret}`;
  const signature = crypto
    .createHash("sha256")
    .update(paramsToSign)
    .digest("hex");

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Signature generated successfully",
    data: {
      signature,
      timestamp,
      cloudName,
      apiKey,
    },
  });
});

export const UploadController = {
  getSignature,
};
