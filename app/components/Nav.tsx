"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Referral Board" },
  { href: "/interview", label: "Interview DB" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-6 py-3 flex gap-6">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium transition-colors ${
              pathname === href
                ? "text-black border-b-2 border-black pb-1"
                : "text-gray-500 hover:text-black"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
