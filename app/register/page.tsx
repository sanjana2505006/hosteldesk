import Link from "next/link";
import { RegisterForm } from "@/components/register-form";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const hostels = await prisma.hostel.findMany({ orderBy: { block: "asc" } });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-6 py-12">
        <h1 className="text-2xl font-semibold text-ink">Join as a student</h1>
        <p className="mt-2 text-sm text-ink/55">Wardens and workers are created by admin seed / desk staff.</p>
        <div className="mt-8 rounded-lg border border-line bg-panel p-6 shadow-desk">
          {hostels.length ? (
            <RegisterForm hostels={hostels} />
          ) : (
            <p className="text-sm text-ink/60">
              No hostels yet. Run <code className="font-mono">npm run db:seed</code> first.
            </p>
          )}
        </div>
        <p className="mt-4 text-sm text-ink/55">
          Already have a desk pass?{" "}
          <Link href="/login" className="text-forest underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
