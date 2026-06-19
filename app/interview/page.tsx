"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  timestamp: string;
  company: string;
  category: string;
  companySize: string;
  title: string;
  level: string;
  rounds: string;
  technicalAssessment: string;
  background: string;
  skillQuestions: string;
  behavioralQuestions: string;
  prepTips: string;
  contributor: string;
};

const SHEET_ID = "1no73xQLQEplYcxDDRh51gakrZo49ybrZPNl8xtOD_iU";

/** Parse gviz date strings like Date(2026,4,11,0,23,4)
 *  Month is 0-indexed (4 = May), matching JS Date convention. */
function parseGvizDate(raw: string): string {
  if (!raw) return "";
  const m = raw.match(/^Date\((\d+),(\d+),(\d+)/);
  if (!m) return raw;
  const year = parseInt(m[1]);
  const month = parseInt(m[2]); // 0-indexed
  const day = parseInt(m[3]);
  return new Date(year, month, day).toLocaleDateString("en-CA"); // YYYY-MM-DD
}

const FORM_URL =
  "https://docs.google.com/forms/d/14w_7kVh1FCJ2pEIilMNk9avuB4JjSpeB1smAixVWpWI/viewform";

const CATEGORIES = [
  "All",
  "Software Engineer",
  "IT Support",
  "BA/PM/SA",
  "Marketing",
  "Embedded",
  "Others",
];

const LEVELS = ["All", "Junior", "Senior", "Others"];

function normaliseCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("software") || r.includes("swe") || r.includes("sde"))
    return "Software Engineer";
  if (r.includes("it support") || r.includes("it admin"))
    return "IT Support";
  if (r.includes("ba") || r.includes("pm") || r.includes("sa"))
    return "BA/PM/SA";
  if (r.includes("market")) return "Marketing";
  if (r.includes("embed")) return "Embedded";
  if (!raw.trim()) return "Others";
  return raw;
}

function normaliseLevel(raw: string): "Junior" | "Senior" | "Others" {
  const r = raw.toLowerCase();
  if (r.includes("junior") || r.includes("jr") || r.includes("entry"))
    return "Junior";
  if (r.includes("senior") || r.includes("sr")) return "Senior";
  return "Others";
}

function Badge({ text, color }: { text: string; color: string }) {
  if (!text) return null;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {text}
    </span>
  );
}

function Section({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-sm text-gray-700 whitespace-pre-wrap">{value}</div>
    </div>
  );
}

const levelColors: Record<string, string> = {
  Junior: "bg-blue-50 text-blue-700",
  Senior: "bg-purple-50 text-purple-700",
  Others: "bg-gray-100 text-gray-600",
};

const categoryColors: Record<string, string> = {
  "Software Engineer": "bg-emerald-50 text-emerald-700",
  "IT Support": "bg-orange-50 text-orange-700",
  "BA/PM/SA": "bg-yellow-50 text-yellow-700",
  Marketing: "bg-pink-50 text-pink-700",
  Embedded: "bg-indigo-50 text-indigo-700",
  Others: "bg-gray-100 text-gray-600",
};

export default function InterviewPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
      );
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));

      const rows: Entry[] = json.table.rows
        .map((row: any) => ({
          timestamp: parseGvizDate(row.c?.[0]?.v ?? "") || (row.c?.[0]?.f ?? ""),
          company: row.c?.[1]?.v ?? "",
          category: row.c?.[2]?.v ?? "",
          companySize: row.c?.[3]?.v ?? "",
          title: row.c?.[4]?.v ?? "",
          level: row.c?.[5]?.v ?? "",
          rounds: row.c?.[6]?.v ?? "",
          technicalAssessment: row.c?.[7]?.v ?? "",
          background: row.c?.[8]?.v ?? "",
          skillQuestions: row.c?.[9]?.v ?? "",
          behavioralQuestions: row.c?.[10]?.v ?? "",
          prepTips: row.c?.[11]?.v ?? "",
          contributor: row.c?.[12]?.v ?? "",
        }))
        .filter((e: Entry) => e.company || e.category);

      setEntries(rows);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const cat = normaliseCategory(e.category);
      const lv = normaliseLevel(e.level);

      const catMatch =
        categoryFilter === "All" || cat === categoryFilter;
      const lvMatch =
        levelFilter === "All" || lv === levelFilter;

      const q = search.toLowerCase();
      const searchMatch =
        !q ||
        e.company.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.skillQuestions.toLowerCase().includes(q) ||
        e.behavioralQuestions.toLowerCase().includes(q) ||
        e.prepTips.toLowerCase().includes(q);

      return catMatch && lvMatch && searchMatch;
    });
  }, [entries, categoryFilter, levelFilter, search]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Interview DB</h1>
            <p className="text-gray-600 mt-1">
              Real interview experiences shared by the community
            </p>
          </div>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black px-5 py-3 text-white text-sm font-medium whitespace-nowrap"
          >
            Share My Experience
          </a>
        </div>
      </div>

      {/* Sticky Filters */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              {LEVELS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Search company, title, questions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm w-64"
            />

            <div className="text-sm text-gray-500">
              {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {loading ? (
          <div className="text-gray-500 py-12 text-center">Loading…</div>
        ) : error ? (
          <div className="text-red-500 py-12 text-center">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-400 py-12 text-center">No results found.</div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e, i) => {
              const cat = normaliseCategory(e.category);
              const lv = normaliseLevel(e.level);

              return (
                <div
                  key={i}
                  className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
                >
                  {/* Top row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold">
                        {e.company || "—"}
                      </h2>
                      <Badge
                        text={cat}
                        color={
                          categoryColors[cat] ?? "bg-gray-100 text-gray-600"
                        }
                      />
                      <Badge
                        text={lv}
                        color={levelColors[lv] ?? "bg-gray-100 text-gray-600"}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{e.timestamp}</div>
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                    {e.title && (
                      <span>
                        <span className="font-medium">Title:</span> {e.title}
                      </span>
                    )}
                    {e.companySize && (
                      <span>
                        <span className="font-medium">Size:</span>{" "}
                        {e.companySize}
                      </span>
                    )}
                    {e.rounds && (
                      <span>
                        <span className="font-medium">Rounds:</span> {e.rounds}
                      </span>
                    )}
                    {e.background && (
                      <span>
                        <span className="font-medium">Background:</span>{" "}
                        {e.background}
                      </span>
                    )}
                  </div>

                  {/* Detail sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Section
                      label="Technical Assessment"
                      value={e.technicalAssessment}
                    />
                    <Section
                      label="Skill Questions"
                      value={e.skillQuestions}
                    />
                    <Section
                      label="Behavioral Questions"
                      value={e.behavioralQuestions}
                    />
                    <Section
                      label="Preparation Tips"
                      value={e.prepTips}
                    />
                  </div>

                  {/* Contributor */}
                  {e.contributor && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                      Shared by: {e.contributor}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
