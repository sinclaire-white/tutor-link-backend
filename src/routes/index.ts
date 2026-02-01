import { Router } from "express";
import { TutorRoutes } from "../modules/tutor/tutor.router";
import { AvailabilityRoutes } from "../modules/availabilty/availability.router";
import { ReviewRoutes } from "../modules/review/review.routes";
import { BookingRoutes } from "../modules/booking/boooking.route";
import { UserRoutes } from "../modules/user/user.router";
import { CategoryRoutes } from "../modules/category/category.router";

const router: Router = Router();

const moduleRoutes = [
  {
    path: "/tutors",
    route: TutorRoutes,
  },
  {
    path: "/availability",
    route: AvailabilityRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/bookings",
    route: BookingRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
];

// This loop registers all the routes automatically
moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
