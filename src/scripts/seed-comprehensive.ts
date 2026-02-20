import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth"; // Assuming this is where better-auth is initialized
import { Day, BookingStatus, UserRole } from "../../generated/prisma/enums";

// --- Random Data Generators ---

const firstNames = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const bios = [
  "Passionate educator with 5+ years of experience.",
  "PhD student specializing in advanced topics.",
  "Friendly and patient tutor for all ages.",
  "Former university professor available for private lessons.",
  "Helping students achieve their academic goals since 2018.",
  "Expert in exam preparation and study skills.",
  "Making learning fun and accessible for everyone.",
  "Specialized in helping students with learning difficulties.",
  "Interactive teaching style with proven results.",
  "Focused on building confidence and mastery."
];
const qualifications = [
  "PhD in Subject Matter",
  "Master's Degree in Education",
  "Bachelor of Science, First Class Honours",
  "Certified Teacher (state licensed)",
  "Published Author in Academic Journals",
  "TEFL Certified",
  "Former Olympiad Medalist"
];

const categories = [
  "Mathematics", "Physics", "Chemistry", "Biology", 
  "English Literature", "Computer Science", "History", 
  "Geography", "Music", "Art", "Economics", "Psychology"
];

const getRandom = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomSubset = (arr: any[], count: number) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

// --- Main Seeding Function ---

async function main() {
  console.log("🌱 Starting comprehensive database seed...");

  // 1. Clean existing data (Optional: comment out if you want to keep existing data)
  // Be careful with foreign key constraints. Delete in order: Reviews -> Bookings -> Availability -> Tutors -> Users -> Categories
  console.log("Cleaning old data...");
  try {
    await prisma.review.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    // We need to delete tutors first, but tutors are linked to Users. 
    // Prisma client deletion order matters.
    await prisma.tutor.deleteMany();
    // We won't delete all users to keep the admin, but we might delete test users if we can identify them.
    // For now, let's just add new data.
    
    // Upsert Categories
    console.log("Seeding Categories...");
    const categoryMap = new Map();
    for (const catName of categories) {
      const cat = await prisma.category.upsert({
        where: { name: catName },
        update: {},
        create: { name: catName },
      });
      categoryMap.set(catName, cat.id);
    }

    // 2. Create Students
    console.log("Seeding Students...");
    const students = [];
    for (let i = 0; i < 20; i++) {
        const fName = getRandom(firstNames);
        const lName = getRandom(lastNames);
        const email = `student${i + 1}@example.com`;
        
        // Check if exists
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Create via auth to ensure proper password hashing if possible, 
            // but for speed/bulk we might simulating it or just using the API
            // Using auth.api.signUpEmail is safer for consistency
            try {
               const res = await auth.api.signUpEmail({
                    body: {
                        email,
                        password: "password123",
                        name: `${fName} ${lName}`,
                    }
               });
               user = await prisma.user.findUnique({ where: { id: res.user.id } });
            } catch (e) {
                console.error(`Failed to create student ${email}:`, e);
                continue;
            }
        }
        
        // Ensure role is STUDENT
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: UserRole.STUDENT }
            });
            students.push(user);
        }
    }

    // 3. Create Tutors
    console.log("Seeding Tutors...");
    const tutors = [];
    for (let i = 0; i < 15; i++) {
        const fName = getRandom(firstNames);
        const lName = getRandom(lastNames);
        const email = `tutor${i + 1}@example.com`;

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
             try {
               const res = await auth.api.signUpEmail({
                    body: {
                        email,
                        password: "password123",
                        name: `${fName} ${lName}`,
                    }
               });
               user = await prisma.user.findUnique({ where: { id: res.user.id } });
            } catch (e) {
                console.error(`Failed to create tutor ${email}:`, e);
                continue;
            }
        }

        if (user) {
            // Update role
            await prisma.user.update({
                where: { id: user.id },
                data: { role: UserRole.TUTOR }
            });

            // Create Tutor Profile
            const isApproved = i < 12; // Most are approved
            const cats = getRandomSubset(categories, getRandomInt(1, 3)).map(c => ({ id: categoryMap.get(c) }));
            
            // Upsert Tutor profile
            const tutor = await prisma.tutor.upsert({
                where: { userId: user.id },
                update: {},
                create: {
                    userId: user.id,
                    bio: getRandom(bios),
                    qualifications: getRandom(qualifications),
                    hourlyRate: getRandomInt(20, 100),
                    isApproved: isApproved,
                    isFeatured: i < 3, // First 3 featured
                    categories: {
                        connect: cats
                    }
                }
            });

            // Create Availability
            const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
            await prisma.availability.deleteMany({ where: { tutorId: tutor.id } });
            
            const tutorSlots = [];
            for (const day of getRandomSubset(days, getRandomInt(3, 5))) {
                tutorSlots.push({
                    tutorId: tutor.id,
                    dayOfWeek: day,
                    startTime: "09:00",
                    endTime: "17:00"
                });
            }
            await prisma.availability.createMany({ data: tutorSlots });

            tutors.push(tutor);
        }
    }

    // 4. Create Bookings
    console.log(`Seeding Bookings... (Students: ${students.length}, Tutors: ${tutors.length})`);
    if (students.length === 0 || tutors.length === 0) {
        throw new Error("Not enough students or tutors to seed bookings.");
    }

    const statuses = [BookingStatus.COMPLETED, BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CANCELLED];
    
    // Helper to get raw category ID from connection (requires fetching or assuming)
    // We'll just fetch a random category ID from the tutor's categories for the booking
    
    for (let i = 0; i < 50; i++) {
        console.log(`Creating booking ${i + 1}/50...`);
        try {
            const student = getRandom(students);
            const tutor = getRandom(tutors);
            
            // Need to get one category ID from the tutor
            const tutorWithCats = await prisma.tutor.findUnique({
                where: { id: tutor.id },
                include: { categories: true }
            });
            
            if (!tutorWithCats || tutorWithCats.categories.length === 0) {
                console.log(`Skipping booking ${i}: Tutor has no categories`);
                continue;
            }
            const categoryId = getRandom(tutorWithCats.categories).id;

            const status = getRandom(statuses);
            
            // Date logic
            let scheduledAt: Date;
            const now = new Date();
            
            if (status === BookingStatus.COMPLETED || status === BookingStatus.CANCELLED) {
                // Past date (last 30 days)
                scheduledAt = new Date(now.getTime() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000);
            } else {
                // Future date (next 14 days)
                scheduledAt = new Date(now.getTime() + getRandomInt(1, 14) * 24 * 60 * 60 * 1000);
            }
            
            // Set fixed time suitable for "09:00" to "17:00"
            scheduledAt.setHours(getRandomInt(9, 16), 0, 0, 0);

            const booking = await prisma.booking.create({
                data: {
                    studentId: student.id,
                    tutorId: tutor.userId, 
                    categoryId: categoryId,
                    status: status,
                    scheduledAt: scheduledAt,
                    duration: getRandomInt(1, 2)
                }
            });
            console.log(`Booking ${i + 1} created: ${booking.id}`);

            // 5. Create Review if Completed (50% chance)
            if (status === BookingStatus.COMPLETED && Math.random() > 0.5) {
                try {
                  await prisma.review.create({
                      data: {
                          bookingId: booking.id,
                          rating: getRandomInt(3, 5),
                          comment: getRandom(["Great session!", "Very helpful", "Good teacher", "Learned a lot", "Highly recommend"])
                      }
                  });
                  console.log(`Review created for booking ${booking.id}`);
                } catch (reviewErr) {
                    console.error('Review creation failed:', reviewErr);
                }
            }
        } catch (innerError) {
            console.error(`Error creating booking ${i}:`, innerError);
        }
    }

    console.log("✅ Seeding completed successfully!");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
