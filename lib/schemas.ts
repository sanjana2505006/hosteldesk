import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(6).max(72),
  hostelId: z.string().min(1),
  roomNumber: z.string().min(1).max(12),
});

export const createTicketSchema = z.object({
  title: z.string().min(4).max(90),
  description: z.string().min(10).max(2000),
  category: z.enum([
    "PLUMBING",
    "ELECTRICAL",
    "CARPENTRY",
    "WIFI",
    "HOUSEKEEPING",
    "FURNITURE",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  roomNumber: z.string().min(1).max(12),
  photoUrl: z.string().optional(),
});

export const commentSchema = z.object({
  message: z.string().min(1).max(1000),
});

export const assignSchema = z.object({
  assigneeId: z.string().min(1).nullable(),
});

export const readAlertsSchema = z.object({
  id: z.string().min(1).optional(),
  ticketId: z.string().min(1).optional(),
});

export const statusSchema = z.object({
  status: z.enum([
    "OPEN",
    "ASSIGNED",
    "IN_PROGRESS",
    "WAITING_PARTS",
    "RESOLVED",
    "CLOSED",
    "REJECTED",
  ]),
  note: z.string().max(400).optional(),
});
