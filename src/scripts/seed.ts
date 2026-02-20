import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

const adminMail = process.env.ADMIN_EMAIL as string;

async function seedAdmin() {
  // Check if user exists
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminMail } });

  if (!existingAdmin) {
    console.log("Creating new admin account..."); // Log creation
    await auth.api.signUpEmail({
      body: {
        email: adminMail,
        password: process.env.ADMIN_PASSWORD as string,
        name: "TutorLink Admin", 
      },
    });
  } else {
    console.log("User found. Syncing permissions..."); // Log found
  }

  // Update logic is now outside the if-block so it always runs
  await prisma.user.update({
    where: { email: adminMail },
    data: { 
      emailVerified: true, // Ensure verified
      role: "ADMIN", // Force ADMIN role
    },
  });

  console.log("Admin role synced successfully!"); // Final success
}

seedAdmin()
  .catch((e) => { console.error("Seed Error:", e.message); process.exit(1); }) // Error handling
  .finally(() => prisma.$disconnect()); // Close connection