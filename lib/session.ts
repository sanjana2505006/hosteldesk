import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function auth() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}
