-- Add isSuspended to users and isApproved to tutors
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "isSuspended" boolean DEFAULT false;
ALTER TABLE "tutor" ADD COLUMN IF NOT EXISTS "isApproved" boolean DEFAULT false;
