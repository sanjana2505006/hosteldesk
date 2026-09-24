import { Category, Priority, Role, TicketStatus } from "@prisma/client";

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In progress",
  WAITING_PARTS: "Waiting on parts",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  REJECTED: "Rejected",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  CARPENTRY: "Carpentry",
  WIFI: "Wi-Fi / network",
  HOUSEKEEPING: "Housekeeping",
  FURNITURE: "Furniture",
  OTHER: "Other",
};

export const ROLE_LABEL: Record<Role, string> = {
  STUDENT: "Student",
  WARDEN: "Warden",
  WORKER: "Worker",
  ADMIN: "Admin",
};

export const CATEGORIES = Object.keys(CATEGORY_LABEL) as Category[];
export const PRIORITIES = Object.keys(PRIORITY_LABEL) as Priority[];
