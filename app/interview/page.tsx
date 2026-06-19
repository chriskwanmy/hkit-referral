"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  timestamp:           string;
  company:             string;
  category:            string;
  companySize:         string;
  title:               string;
  level:               string;
  rounds:              string;
  technicalAssessment: string;
  background:          string;
  skillQuestions:      string;
  behavioralQuestions: string;
  prepTips:            string;
  contributor:         string;
};

const SHEET_ID = "1no73xQLQEplYcxDDRh51gakrZo49ybrZPNl8xtOD_iU";

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
] as const;

const LEVELS = ["All", "Junior", "Senior", "Others"] as const;

/** Parse gviz date strings like Date(2026,4,11,0,23,4)
 *  Month is 0-indexed (4 = May), matching JS Date convention. */
function parseGvizDate(raw: string): string {
  if (!raw) return "";
  const m = raw.match(/^Date\((\d+),(\d+),(\d+)/);
  if (!m) return raw;
  const year  = parseInt(m[1]);
  const month = parseInt(m[2]); // 0-indexed
  const day   = parseInt(m[3]);
  return new Date(year, month, day).toLocaleDateString("en-CA"); // YYYY-MM-DD
}

function normaliseCategory(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes("software") || r.includes("swe") || r.includes("sde"))
    return "Software Engineer";
  if (r.includes("it support") || r.includes("it admin")) return "IT Support";
  if (r.includes("ba") || r.includes("pm") || r.includes("sa"))
    return "BA/PM/SA";
  if (r.includes("market")) return "Marketing";
  if (r.includes("embed"))  return "Embedded";
  if (!raw.trim())           return "Others";
  return raw;
}

function normaliseLevel(raw: string): "Junior" | "Senior" | "Others" {
  const r = raw.toLowerCase();
  if (r.includes("junior") || r.includes("jr") || r.includes("entry")) return "Junior";
  if (r.includes("senior") || r.includes("sr"))                         return "Senior";
  return "Others";
}

/* ── Badge ───────────────────────────────────────────── */
const levelColors: Record<string, string> = {
  Junior: "bg-blue-50   text-blue-800   dark:bg-blue-950   dark:text-blue-300",
  Senior: "bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
  Others: "bg-slate-100 text-slate-700  dark:bg-slate-800  dark:text-slate-300",
};

const categoryColors: Record<string, string> = {
  "Software Engineer": "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  "IT Support":        "bg-orange-50  text-orange-800  dark:bg-orange-950  dark:text-orange-300",
  "BA/PM/SA":          "bg-yellow-50  text-yellow-800  dark:bg-yellow-950  dark:text-yellow-300",
  Marketing:           "bg-pink-50    text-pink-800    dark:bg-pink-950    dark:text-pink-300",
  Embedded:            "bg-indigo-50  text-indigo-800  dark:bg-indigo-950  dark:text-indigo-300",
  Others:              "bg-slate-100  text-slate-700   dark:bg-slate-800   dark:text-slate-300",
};

function Badge({ text, colorClass }: { text: string; colorClass: string }) {
  if (!text) return null;
  return (
    <span
      className={`badge inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}
    >
      {text}
    </span>
  );
}

/* ── Detail section ──────────────────────────────────── */
function Section({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  const id = `section-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <h3
        id={id}
        className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 font-semibold"
      >
        {label}
      </h3>
      <p
        aria-labelledby={id}
        className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap"
      >
        {value}
      </p>
    </div>
  );
}

/* ── Shared control style ────────────────────────────── */
const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
  "min-h-[44px]";

/* ── Page ────────────────────────────────────────────── */
export default function InterviewPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [levelFilter,    setLevelFilter]    = useState("All");
  const [search,         setSearch]         = useState("");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const res  = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`
      );
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));

      const rows: Entry[] = json.table.rows
        .map((row: any) => ({
          timestamp:           parseGvizDate(row.c?.[0]?.v ?? "") || (row.c?.[0]?.f ?? ""),
          company:             row.c?.[1]?.v ?? "",
          category:            row.c?.[2]?.v ?? "",
          companySize:         row.c?.[3]?.v ?? "",
          title:               row.c?.[4]?.v ?? "",
          level:               row.c?.[5]?.v ?? "",
          rounds:              row.c?.[6]?.v ?? "",
          technicalAssessment: row.c?.[7]?.v ?? "",
          background:          row.c?.[8]?.v ?? "",
          skillQuestions:      row.c?.[9]?.v ?? "",
          behavioralQuestions: row.c?.[10]?.v ?? "",
          prepTips:            row.c?.[11]?.v ?? "",
          contributor:         row.c?.[12]?.v ?? "",
        }))
        .filter((e: Entry) => e.company || e.category);

      setEntries(rows);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const cat = normaliseCategory(e.category);
      const lv  = normaliseLevel(e.level);

      const catMatch = categoryFilter === "All" || cat === categoryFilter;
      const lvMatch  = levelFilter    === "All" || lv  === levelFilter;

      const q = search.toLowerCase();
      const searchMatch =
        !q ||
        e.company.toLowerCase().includes(q)             ||
        e.title.toLowerCase().includes(q)               ||
        e.skillQuestions.toLowerCase().includes(q)      ||
        e.behavioralQuestions.toLowerCase().includes(q) ||
        e.prepTips.toLowerCase().includes(q);

      return catMatch && lvMatch && searchMatch;
    });
  }, [entries, categoryFilter, levelFilter, search]);

  return (
    <main id="main-content" className="min-h-screen">
      {/* ── Page header ──────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Interview DB
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Real interview experiences shared by the community
            </p>
          </div>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share my interview experience (opens in new tab)"
            className={
              "rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white " +
              "hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 " +
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
              "min-h-[44px] inline-flex items-center whitespace-nowrap transition-colors"
            }
          >
            Share My Experience
          </a>
        </div>
      </header>

      {/* ── Sticky filter bar ────────────────────────── */}
      <div
        role="search"
        aria-label="Filter interview entries"
        className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="category-filter"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={controlClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="level-filter"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Level
              </label>
              <select
                id="level-filter"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className={controlClass}
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="search-input"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Search
              </label>
              <input
                id="search-input"
                type="search"
                placeholder="Company, title, questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${controlClass} w-56`}
              />
            </div>

            {/* Live results count */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              {loading
                ? "Loading…"
                : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <section
        aria-label="Interview entries"
        aria-busy={loading}
        className="mx-auto max-w-7xl px-6 py-6"
      >
        {loading ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400" aria-live="polite">
            Loading entries…
          </p>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-slate-400 dark:text-slate-500">
            No entries match your filters.
          </p>
        ) : (
          <ul role="list" className="space-y-4">
            {filtered.map((e, i) => {
              const cat = normaliseCategory(e.category);
              const lv  = normaliseLevel(e.level);

              return (
                <li key={i}>
                  <article
                    aria-labelledby={`entry-${i}-heading`}
                    className={
                      "rounded-xl border border-slate-200 bg-white p-5 shadow-sm " +
                      "hover:shadow-md transition-shadow " +
                      "dark:border-slate-700 dark:bg-slate-900"
                    }
                  >
                    {/* ── Top row ─────────────────── */}
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          id={`entry-${i}-heading`}
                          className="text-lg font-bold text-slate-900 dark:text-white"
                        >
                          {e.company || "—"}
                        </h2>
                        <Badge
                          text={cat}
                          colorClass={categoryColors[cat] ?? categoryColors.Others}
                        />
                        <Badge
                          text={lv}
                          colorClass={levelColors[lv] ?? levelColors.Others}
                        />
                      </div>

                      {e.timestamp && (
                        <time
                          dateTime={e.timestamp}
                          className="text-xs text-slate-500 dark:text-slate-400"
                        >
                          {e.timestamp}
                        </time>
                      )}
                    </div>

                    {/* ── Meta row ────────────────── */}
                    <dl className="flex flex-wrap gap-4 mb-4 text-sm text-slate-600 dark:text-slate-400">
                      {e.title && (
                        <div className="flex gap-1">
                          <dt className="font-semibold text-slate-700 dark:text-slate-300">Title:</dt>
                          <dd>{e.title}</dd>
                        </div>
                      )}
                      {e.companySize && (
                        <div className="flex gap-1">
                          <dt className="font-semibold text-slate-700 dark:text-slate-300">Size:</dt>
                          <dd>{e.companySize}</dd>
                        </div>
                      )}
                      {e.rounds && (
                        <div className="flex gap-1">
                          <dt className="font-semibold text-slate-700 dark:text-slate-300">Rounds:</dt>
                          <dd>{e.rounds}</dd>
                        </div>
                      )}
                      {e.background && (
                        <div className="flex gap-1">
                          <dt className="font-semibold text-slate-700 dark:text-slate-300">Background:</dt>
                          <dd>{e.background}</dd>
                        </div>
                      )}
                    </dl>

                    {/* ── Detail sections ─────────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section label="Technical Assessment" value={e.technicalAssessment} />
                      <Section label="Skill Questions"      value={e.skillQuestions}      />
                      <Section label="Behavioral Questions" value={e.behavioralQuestions} />
                      <Section label="Preparation Tips"     value={e.prepTips}            />
                    </div>

                    {/* ── Contributor ─────────────── */}
                    {e.contributor && (
                      <p className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                        Shared by:{" "}
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {e.contributor}
                        </span>
                      </p>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
