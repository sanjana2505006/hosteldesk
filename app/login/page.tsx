import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  const filing = searchParams.callbackUrl?.includes("/tickets");
  const registerHref = filing
    ? `/register?callbackUrl=${encodeURIComponent(searchParams.callbackUrl ?? "")}`
    : "/register";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-6 pb-16 pt-16">
        <h1 className="text-4xl font-semibold text-ink">{filing ? "Sign in to file it." : "Sign in."}</h1>
        <p className="mt-3 text-[17px] text-ink/60">
          {filing
            ? "Looking around does not need an account. Filing one does."
            : "Use a demo chip or your own student account."}
        </p>
        <div className="mt-8 rounded-2xl bg-paper p-6 shadow-desk">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-4 text-sm text-ink/55">
          New student?{" "}
          <Link href={registerHref} className="text-forest underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
