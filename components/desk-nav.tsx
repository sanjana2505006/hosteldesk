"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/sign-out-button";

export type DeskLink = { href: string; label: string; badge?: number };

function isCurrent(path: string, href: string) {
  if (href === "/inbox") return path === "/inbox";
  return path === href || path.startsWith(`${href}/`);
}

export function DeskNav({
  name,
  roleLabel,
  links,
}: {
  name: string;
  roleLabel: string;
  links: DeskLink[];
}) {
  const path = usePathname();
  const columns = links.length <= 3 ? "grid-cols-3" : links.length === 4 ? "grid-cols-4" : "grid-cols-3";

  return (
    <>
      <header className="frost sticky top-0 z-20 border-b border-black/10">
        <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-5">
          <Link href="/inbox" className="text-lg font-semibold tracking-tight text-ink">
            HostelDesk
          </Link>
          <nav className="hidden items-center gap-x-5 gap-y-1 text-base text-ink/80 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors duration-200 hover:text-ink ${isCurrent(path, link.href) ? "text-ink" : ""}`}
              >
                {link.label}
                {link.badge ? (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-xs text-white">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
            <span className="text-ink/40">
              {name} · {roleLabel}
            </span>
            <SignOutButton />
          </nav>
          <div className="flex items-center gap-3 md:hidden">
            <span className="max-w-[8rem] truncate text-sm text-ink/50">{name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <nav className={`frost fixed inset-x-0 bottom-0 z-30 grid border-t border-black/10 ${columns} md:hidden`}>
        {links.map((link) => {
          const current = isCurrent(path, link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex min-h-14 items-center justify-center px-1 text-center text-sm leading-tight ${current ? "font-medium text-ink" : "text-ink/55"}`}
            >
              <span>
                {link.label}
                {link.badge ? (
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rust px-1.5 text-xs text-white">
                    {link.badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
