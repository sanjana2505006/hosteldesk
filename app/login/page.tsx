import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="font-serif text-2xl text-forest">
        HostelDesk
      </Link>
      <h1 className="mt-6 font-serif text-4xl text-ink">Sign in</h1>
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
  );
}
