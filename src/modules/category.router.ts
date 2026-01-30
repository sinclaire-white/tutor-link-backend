import  { Router} from "express";
import { CategoryController } from "./category.controller";
import {  UserRole } from "../middlewares/auth.middleware";
import authMiddleware from "../middlewares/auth.middleware"

const router: Router = Router();
// Public: Anyone can see the categories
router.get("/", CategoryController.getAllCategories);

// Protected: Only logged-in users with ADMIN role can create
router.post(
  "/",
  authMiddleware(UserRole.ADMIN), 
  CategoryController.createCategory
);

export const CategoryRoutes = router;