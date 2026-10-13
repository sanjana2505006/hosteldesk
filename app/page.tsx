import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-14">
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl">Hostel complaint desk.</h1>
          <p className="mt-4 text-[19px] leading-snug text-ink/60">
            Students file a complaint for their own room. A warden assigns a worker. See{" "}
            <Link href="/how-it-works" className="text-forest hover:underline">
              how it works
            </Link>{" "}
            or the open list on{" "}
            <Link href="/complaints" className="text-forest hover:underline">
              Complaints
            </Link>
            .
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-forest px-5 py-2.5 text-center text-[17px] text-white transition-colors duration-200 hover:bg-forest-600"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-paper px-5 py-2.5 text-center text-[17px] text-ink transition-colors duration-200 hover:bg-ink/5"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
