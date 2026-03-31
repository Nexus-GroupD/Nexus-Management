import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alex = await prisma.employee.upsert({
    where: { email: "alex@nexus.io" },
    update: {},
    create: {
      name: "Alex Rivera",
      role: "manager",
      email: "alex@nexus.io",
    },
  });

  const jordan = await prisma.employee.upsert({
    where: { email: "jordan@nexus.io" },
    update: {},
    create: {
      name: "Jordan Lee",
      role: "employee",
      email: "jordan@nexus.io",
    },
  });

  const sam = await prisma.employee.upsert({
    where: { email: "sam@nexus.io" },
    update: {},
    create: {
      name: "Sam Patel",
      role: "employee",
      email: "sam@nexus.io",
    },
  });

  const casey = await prisma.employee.upsert({
    where: { email: "casey@nexus.io" },
    update: {},
    create: {
      name: "Casey Morgan",
      role: "employee",
      email: "casey@nexus.io",
    },
  });

  const existingConversation = await prisma.conversation.findFirst({
    where: {
      participants: {
        some: { employeeId: alex.id },
      },
    },
    include: {
      participants: true,
    },
  });

  let conversation;

  if (existingConversation) {
    conversation = existingConversation;
  } else {
    conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { employeeId: alex.id },
            { employeeId: jordan.id },
          ],
        },
      },
    });

    await prisma.message.createMany({
      data: [
        {
          conversationId: conversation.id,
          senderId: alex.id,
          content: "Hi Jordan, can you cover the Friday evening shift?",
        },
        {
          conversationId: conversation.id,
          senderId: jordan.id,
          content: "Yes, I can cover that shift.",
        },
        {
          conversationId: conversation.id,
          senderId: alex.id,
          content: "Great, thanks for helping out.",
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log({
    employees: [alex.email, jordan.email, sam.email, casey.email],
    conversationId: conversation.id,
  });
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });