import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.hostel.count();
  if (existing > 0) {
    console.log("hostels already added");
    return;
  }

  await prisma.hostel.createMany({
    data: [
      { name: "Tagore House", block: "A" },
      { name: "Sarojini House", block: "B" },
    ],
  });

  console.log("added 2 hostels");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
