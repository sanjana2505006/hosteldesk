export const ticketListInclude = {
  hostel: true,
  reporter: { select: { id: true, name: true, roomNumber: true } },
  assignee: { select: { id: true, name: true } },
  events: {
    select: { type: true, message: true, createdAt: true },
    orderBy: { createdAt: "asc" as const },
  },
} as const;
