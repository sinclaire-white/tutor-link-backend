
import { prisma } from "./lib/prisma";
import app from "./app";


const PORT = process.env.PORT || 3000;

async function main(){
    try {
      await prisma.$connect();

    console.log("Connected to database");

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
    } catch (error) {
      console.error("Error connecting to database:", error);
      await prisma.$disconnect();
      process.exit(1);
    }
}

main();