"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Referral Board" },
  { href: "/interview", label: "Interview DB"   },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Site navigation"
      className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mx-auto max-w-7xl px-6 py-3 flex gap-6">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "text-sm font-medium rounded transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                active
                  ? "text-slate-900 border-b-2 border-slate-900 pb-1 dark:text-white dark:border-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
