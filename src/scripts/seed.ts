import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";

const adminMail = process.env.ADMIN_EMAIL as string;

async function seedAdmin() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminMail },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  };

  await auth.api.signUpEmail({
    body: {
      email: adminMail,
      password: process.env.ADMIN_PASSWORD as string,
      name: "TutorLink Admin", 
    },
  });

// Verify the email manually
  await prisma.user.update({
    where: { email: adminMail },
    data: { emailVerified: true },
  });
 // Update the role directly via Prisma
  await prisma.user.update({
    where: { email: adminMail },
    data: { 
      emailVerified: true,
      role: "ADMIN", // role set it via Prisma
    },
  });

  console.log("Admin created and verified successfully");
}




seedAdmin()
  .catch((e) => {
    // If ANY step above fails, it lands here.
    console.error("Critical Seed Error:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());