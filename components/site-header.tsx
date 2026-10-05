"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/complaints", label: "Complaints" },
  { href: "/how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  return (
    <header className="frost sticky top-0 z-20 border-b border-black/10">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-5">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink">
          HostelDesk
        </Link>
        <nav className="hidden items-center gap-5 text-base text-ink/80 sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors duration-200 hover:text-ink ${path === link.href ? "text-ink" : ""}`}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="transition-colors duration-200 hover:text-ink">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-forest px-3 py-1 text-white transition-colors duration-200 hover:bg-forest-600"
          >
            Register
          </Link>
        </nav>
        <div className="flex items-center gap-3 sm:hidden">
          <Link href="/register" className="rounded-full bg-forest px-3 py-1 text-white">
            Register
          </Link>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="text-base text-ink"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {open ? (
        <nav className="space-y-1 border-t border-black/10 px-4 py-3 sm:hidden">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-base text-ink">
              {link.label}
            </Link>
          ))}
          <Link href="/login" className="block py-2 text-base text-ink">
            Login
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
