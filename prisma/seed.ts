// seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Define the user data
  const userData = {
    name: "Ahsan",
    email: "ahsan@gmail.com", // sample
    password: "pass123$", // The plain text password
  };

  // Hash the password using bcryptjs
  const hashedPassword = await bcrypt.hash(userData.password, 10); // Salt rounds = 10

  // Seed the user into the database with the hashed password
  const user = await prisma.users.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
  });

  console.log("User seeded:", user);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
