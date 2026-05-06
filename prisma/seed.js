import prisma from "../src/config/prisma.js";
import bcrypt from "bcrypt";

async function seedRoles() {
  const roles = ["host", "player", "organizer", "super_admin"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedFormats() {
  const formats = ["Double's", "Single's", "Mlp", "Triples"];
  for (const name of formats) {
    await prisma.format.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedGroups() {
  const groups = ["Men's", "Women's", "Mixed", "Boys", "Girls", "Junior"];
  for (const name of groups) {
    await prisma.group.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedBracketFormats() {
  const bracketFormats = [
    {
      name: "single Elimination",
      description: "Single elimination with gold and silver medals",
    },
    {
      name: "Double Elimination",
      description: "The winner of the consolation for the gold medal.",
    },
    {
      name: "Round Robin",
      description: "All teams play against each other one time.",
    },
    {
      name: "Double Round Robin",
      description: "All teams play against each other two times.",
    },
  ];

  for (const format of bracketFormats) {
    await prisma.bracketFormat.upsert({
      where: { name: format.name },
      update: { description: format.description },
      create: format,
    });
  }
}

async function seedScoringLists() {
  const scoringLists = ["Rally Scoring", "Side-out Scoring"];
  for (const name of scoringLists) {
    await prisma.scoringList.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function seedPlayoffSeedings() {
  const seedings = [
    { name: "Standard", description: "Traditional top-seed vs low-seed order" },
    { name: "Random", description: "Randomized playoff order" },
  ];
  for (const seeding of seedings) {
    const existing = await prisma.playoffSeeding.findFirst({
      where: { name: seeding.name },
      select: { id: true },
    });

    if (existing) {
      await prisma.playoffSeeding.update({
        where: { id: existing.id },
        data: { description: seeding.description },
      });
    } else {
      await prisma.playoffSeeding.create({
        data: seeding,
      });
    }
  }
}

async function seedAuthUsers() {
  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || "ChangeMe123";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || defaultPassword;
  const organizerPassword = process.env.SEED_ORGANIZER_PASSWORD || defaultPassword;

  const [adminRole, organizerRole] = await Promise.all([
    prisma.role.findUnique({ where: { name: "super_admin" } }),
    prisma.role.findUnique({ where: { name: "organizer" } }),
  ]);

  if (!adminRole || !organizerRole) {
    throw new Error("Required roles (super_admin, organizer) are missing.");
  }

  const adminEmail = "admin@jomg.com";
  const organizerEmail = "organizer@jomg.com";

  let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        firstname: "Super",
        lastname: "Admin",
        email: adminEmail,
        password: await bcrypt.hash(adminPassword, 10),
        age: 30,
        gender: "male",
        phoneNumber: "+10000000001",
        isVerified: true,
      },
    });
  }

  let organizerUser = await prisma.user.findUnique({
    where: { email: organizerEmail },
  });
  if (!organizerUser) {
    organizerUser = await prisma.user.create({
      data: {
        firstname: "Default",
        lastname: "Organizer",
        email: organizerEmail,
        password: await bcrypt.hash(organizerPassword, 10),
        age: 28,
        gender: "male",
        phoneNumber: "+10000000002",
        isVerified: true,
      },
    });
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: organizerUser.id,
        roleId: organizerRole.id,
      },
    },
    update: {},
    create: {
      userId: organizerUser.id,
      roleId: organizerRole.id,
    },
  });
}

async function main() {
  await seedRoles();
  await seedFormats();
  await seedGroups();
  await seedBracketFormats();
  await seedScoringLists();
  await seedPlayoffSeedings();
  await seedAuthUsers();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Prisma seed completed");
  })
  .catch(async (error) => {
    console.error("Prisma seed failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
