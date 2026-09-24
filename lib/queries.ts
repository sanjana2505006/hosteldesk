export const ticketListInclude = {
  hostel: true,
  reporter: { select: { id: true, name: true, roomNumber: true } },
  assignee: { select: { id: true, name: true } },
} as const;
