"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/complaints", label: "Complaints" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const path = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-semibold text-ink">
          HostelDesk
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                path === link.href
                  ? "rounded-md bg-forest/10 px-3 py-1.5 font-medium text-forest"
                  : "rounded-md px-3 py-1.5 text-ink/60 hover:bg-ink/5 hover:text-ink"
              }
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="rounded-md px-3 py-1.5 text-ink/60 hover:bg-ink/5 hover:text-ink">
            Login
          </Link>
          <Link href="/register" className="ml-1 rounded-md bg-forest px-3 py-1.5 text-white">
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
