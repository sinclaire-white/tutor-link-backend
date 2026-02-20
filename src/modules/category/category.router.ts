import { Router } from "express";
import { CategoryController } from "./category.controller";
import { UserRole } from "../../middlewares/auth.middleware";
import authMiddleware from "../../middlewares/auth.middleware";
import validateRequest from "../../middlewares/validateStatus";
import { CategoryValidation } from "./category.validation";

const router: Router = Router();
// Public: Anyone can see the categories
router.get("/", CategoryController.getAllCategories);

// Protected: Only logged-in users with ADMIN role can create
router.post(
  "/",
  authMiddleware(UserRole.ADMIN),
  CategoryController.createCategory,
);
// Protected: Only logged-in users with ADMIN role can update or delete
router.patch(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  validateRequest(CategoryValidation.updateCategoryZodSchema),
  CategoryController.updateCategory,
);
// Protected: Only logged-in users with ADMIN role can delete
router.delete(
  "/:id",
  authMiddleware(UserRole.ADMIN),
  CategoryController.deleteCategory,
);
export const CategoryRoutes = router;
