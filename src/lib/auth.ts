import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465, false for port 587
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },

      role: {
        type: "string",
        defaultValue: "STUDENT",
      },
      age: {
        type: "number",
        required: false,
      },
    },
  },
  trustedOrigins: [process.env.APP_URL || "http://localhost:5000"],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;

        const mailOptions = {
          from: `"TutorLink Support" <${process.env.APP_EMAIL}>`,
          to: user.email,
          subject: "Verify your email address",
          html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Welcome to TutorLink!</h2>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verificationLink}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
            <p>If the button doesn't work, copy and paste this link: <br/> ${url}</p>
          </div>
        `,
        };
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
      } catch (error) {
        console.error("Error sending verification email:", error);
      }
    },
  },

  socialProviders: {
    google: {
      accessType: "offline",
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
