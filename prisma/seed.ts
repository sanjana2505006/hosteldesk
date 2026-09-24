import {
  Category,
  PrismaClient,
  Priority,
  Role,
  TicketStatus,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

function ago(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function main() {
  await prisma.alert.deleteMany();
  await prisma.ticketEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hostel.deleteMany();

  const blockA = await prisma.hostel.create({
    data: { name: "Tagore House", block: "Block A", city: "Campus North" },
  });
  const blockB = await prisma.hostel.create({
    data: { name: "Sarojini House", block: "Block B", city: "Campus South" },
  });

  const password = await hash("student123", 10);
  const wardenPass = await hash("warden123", 10);
  const workerPass = await hash("worker123", 10);
  const adminPass = await hash("admin123", 10);

  const [student, student2, warden, plumber, electrician, carpenter, admin] =
    await Promise.all([
      prisma.user.create({
        data: {
          name: "Aarav Mehta",
          email: "student@hosteldesk.dev",
          password,
          role: Role.STUDENT,
          hostelId: blockA.id,
          roomNumber: "A-214",
          phone: "9876500011",
        },
      }),
      prisma.user.create({
        data: {
          name: "Diya Rao",
          email: "student2@hosteldesk.dev",
          password,
          role: Role.STUDENT,
          hostelId: blockB.id,
          roomNumber: "B-108",
          phone: "9876500012",
        },
      }),
      prisma.user.create({
        data: {
          name: "Prof. Iyer",
          email: "warden@hosteldesk.dev",
          password: wardenPass,
          role: Role.WARDEN,
          hostelId: blockA.id,
          phone: "9876500100",
        },
      }),
      prisma.user.create({
        data: {
          name: "Ramesh Kumar",
          email: "worker@hosteldesk.dev",
          password: workerPass,
          role: Role.WORKER,
          hostelId: blockA.id,
          phone: "9876500201",
        },
      }),
      prisma.user.create({
        data: {
          name: "Suresh Nair",
          email: "electrician@hosteldesk.dev",
          password: workerPass,
          role: Role.WORKER,
          hostelId: blockA.id,
          phone: "9876500202",
        },
      }),
      prisma.user.create({
        data: {
          name: "Imran Sheikh",
          email: "carpenter@hosteldesk.dev",
          password: workerPass,
          role: Role.WORKER,
          hostelId: blockB.id,
          phone: "9876500203",
        },
      }),
      prisma.user.create({
        data: {
          name: "Campus Admin",
          email: "admin@hosteldesk.dev",
          password: adminPass,
          role: Role.ADMIN,
        },
      }),
    ]);

  const tickets: Array<{
    ref: string;
    title: string;
    description: string;
    category: Category;
    priority: Priority;
    status: TicketStatus;
    roomNumber: string;
    hostelId: string;
    reporterId: string;
    assigneeId?: string;
    createdAt: Date;
    resolvedAt?: Date;
    events: Array<{ actorId: string; type: string; message: string; hoursAgo: number }>;
  }> = [
    {
      ref: "HD-1041",
      title: "Tap leaking since Sunday night",
      description:
        "Washbasin tap in A-214 drips constantly. Bucket fills in about 40 minutes. Floor is wet and the room below complained.",
      category: Category.PLUMBING,
      priority: Priority.HIGH,
      status: TicketStatus.OPEN,
      roomNumber: "A-214",
      hostelId: blockA.id,
      reporterId: student.id,
      createdAt: ago(80),
      events: [
        {
          actorId: student.id,
          type: "CREATED",
          message: "Ticket opened",
          hoursAgo: 80,
        },
      ],
    },
    {
      ref: "HD-1042",
      title: "Corridor Wi-Fi dead on 2nd floor",
      description:
        "AP near the water cooler shows lights but nobody on A-2xx can connect. Happened after Saturday power cut.",
      category: Category.WIFI,
      priority: Priority.URGENT,
      status: TicketStatus.IN_PROGRESS,
      roomNumber: "A-214",
      hostelId: blockA.id,
      reporterId: student.id,
      assigneeId: electrician.id,
      createdAt: ago(10),
      events: [
        { actorId: student.id, type: "CREATED", message: "Ticket opened", hoursAgo: 10 },
        {
          actorId: warden.id,
          type: "ASSIGNED",
          message: "Assigned to Suresh Nair",
          hoursAgo: 8,
        },
        {
          actorId: electrician.id,
          type: "STATUS_CHANGED",
          message: "Status → In progress. Checking the switch in the shaft.",
          hoursAgo: 3,
        },
      ],
    },
    {
      ref: "HD-1043",
      title: "Study chair wobbles / one leg loose",
      description: "Chair in A-214 rocks. Screw under the left rear leg is missing.",
      category: Category.FURNITURE,
      priority: Priority.LOW,
      status: TicketStatus.ASSIGNED,
      roomNumber: "A-214",
      hostelId: blockA.id,
      reporterId: student.id,
      assigneeId: plumber.id,
      createdAt: ago(20),
      events: [
        { actorId: student.id, type: "CREATED", message: "Ticket opened", hoursAgo: 20 },
        {
          actorId: warden.id,
          type: "ASSIGNED",
          message: "Assigned to Ramesh Kumar",
          hoursAgo: 6,
        },
      ],
    },
    {
      ref: "HD-1044",
      title: "Ceiling fan not starting",
      description:
        "Fan hums but blades do not move. Regulator already tried on every speed.",
      category: Category.ELECTRICAL,
      priority: Priority.MEDIUM,
      status: TicketStatus.WAITING_PARTS,
      roomNumber: "A-214",
      hostelId: blockA.id,
      reporterId: student.id,
      assigneeId: electrician.id,
      createdAt: ago(30),
      events: [
        { actorId: student.id, type: "CREATED", message: "Ticket opened", hoursAgo: 30 },
        {
          actorId: warden.id,
          type: "ASSIGNED",
          message: "Assigned to Suresh Nair",
          hoursAgo: 28,
        },
        {
          actorId: electrician.id,
          type: "STATUS_CHANGED",
          message: "Status → Waiting on parts. Capacitor burnt, indent raised.",
          hoursAgo: 12,
        },
      ],
    },
    {
      ref: "HD-1045",
      title: "Bathroom drain clogged",
      description: "Water stands ankle-deep after a shower. Tried a plunger, no luck.",
      category: Category.PLUMBING,
      priority: Priority.HIGH,
      status: TicketStatus.RESOLVED,
      roomNumber: "A-214",
      hostelId: blockA.id,
      reporterId: student.id,
      assigneeId: plumber.id,
      createdAt: ago(50),
      resolvedAt: ago(6),
      events: [
        { actorId: student.id, type: "CREATED", message: "Ticket opened", hoursAgo: 50 },
        {
          actorId: warden.id,
          type: "ASSIGNED",
          message: "Assigned to Ramesh Kumar",
          hoursAgo: 48,
        },
        {
          actorId: plumber.id,
          type: "STATUS_CHANGED",
          message: "Status → Resolved. Cleared the trap, flow is normal.",
          hoursAgo: 6,
        },
      ],
    },
    {
      ref: "HD-1046",
      title: "Tube light flickering in common bath",
      description: "Flickers every few seconds. Hard to use the area after 9pm.",
      category: Category.ELECTRICAL,
      priority: Priority.MEDIUM,
      status: TicketStatus.CLOSED,
      roomNumber: "A-200",
      hostelId: blockA.id,
      reporterId: student.id,
      assigneeId: electrician.id,
      createdAt: ago(120),
      resolvedAt: ago(90),
      events: [
        { actorId: student.id, type: "CREATED", message: "Ticket opened", hoursAgo: 120 },
        {
          actorId: electrician.id,
          type: "STATUS_CHANGED",
          message: "Status → Closed. Choke replaced.",
          hoursAgo: 88,
        },
      ],
    },
    {
      ref: "HD-1047",
      title: "Door latch stuck — cannot lock",
      description: "Latch does not catch. Room cannot be locked when going to class.",
      category: Category.CARPENTRY,
      priority: Priority.HIGH,
      status: TicketStatus.OPEN,
      roomNumber: "B-108",
      hostelId: blockB.id,
      reporterId: student2.id,
      createdAt: ago(5),
      events: [
        { actorId: student2.id, type: "CREATED", message: "Ticket opened", hoursAgo: 5 },
      ],
    },
  ];

  for (const t of tickets) {
    const ticket = await prisma.ticket.create({
      data: {
        ref: t.ref,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        roomNumber: t.roomNumber,
        hostelId: t.hostelId,
        reporterId: t.reporterId,
        assigneeId: t.assigneeId,
        createdAt: t.createdAt,
        updatedAt: t.createdAt,
        resolvedAt: t.resolvedAt,
      },
    });

    for (const event of t.events) {
      await prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          actorId: event.actorId,
          type: event.type,
          message: event.message,
          createdAt: ago(event.hoursAgo),
        },
      });
    }
  }

  const leak = await prisma.ticket.findUniqueOrThrow({ where: { ref: "HD-1041" } });
  const wifi = await prisma.ticket.findUniqueOrThrow({ where: { ref: "HD-1042" } });
  const chair = await prisma.ticket.findUniqueOrThrow({ where: { ref: "HD-1043" } });
  const drain = await prisma.ticket.findUniqueOrThrow({ where: { ref: "HD-1045" } });

  await prisma.alert.createMany({
    data: [
      {
        userId: warden.id,
        ticketId: leak.id,
        message: "Aarav Mehta filed HD-1041: Tap leaking since Sunday night",
        createdAt: ago(80),
      },
      {
        userId: student.id,
        ticketId: wifi.id,
        message: "HD-1042 assigned to Suresh Nair",
        createdAt: ago(8),
        readAt: ago(7),
      },
      {
        userId: plumber.id,
        ticketId: chair.id,
        message: "HD-1043 assigned to Ramesh Kumar",
        createdAt: ago(6),
      },
      {
        userId: student.id,
        ticketId: drain.id,
        message: "HD-1045: Status → Resolved. Cleared the trap, flow is normal.",
        createdAt: ago(6),
      },
    ],
  });

  console.log("Seeded HostelDesk demo data.");
  console.log("  student@hosteldesk.dev / student123");
  console.log("  warden@hosteldesk.dev  / warden123");
  console.log("  worker@hosteldesk.dev  / worker123");
  console.log("  admin@hosteldesk.dev   / admin123");
  void admin;
  void carpenter;
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
