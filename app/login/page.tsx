import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-6 py-12">
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink/55">Use a demo chip or your own student account.</p>
        <div className="mt-8 rounded-lg border border-line bg-panel p-6 shadow-desk">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-4 text-sm text-ink/55">
          New student?{" "}
          <Link href="/register" className="text-forest underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
