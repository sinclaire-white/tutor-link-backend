import { Router } from "express";
import { UserController } from "./user.controller";
import authMiddleware from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { UserValidation } from "./user.vaidation";

const router: Router = Router();

// protected:Get my own profile (Dashboard data)
router.get("/me", 
    authMiddleware(), 
    UserController.getMyProfile
);

// Update my basic info
router.patch("/me", 
    authMiddleware(), 
     validateRequest(UserValidation.updateUserProfileZod),
    UserController.updateMyProfile
);

export const UserRoutes = router;
