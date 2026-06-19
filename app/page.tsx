"use client";

import { useEffect, useMemo, useState } from "react";

type Job = {
  timestamp: string;
  company: string;
  role: string;
  level: string;
  base: string;
  remote: string;
  workingMode: string;
  contact: string;
};

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdYdTpYliFqBRHX5NDcb_aR_8w5wGxrAbBwq6kROU6p00KRCA/viewform";

function getArea(base: string) {
  const b = base.toLowerCase();
  if (b.includes("toronto"))   return "Toronto";
  if (b.includes("vancouver")) return "Vancouver";
  if (b.includes("calgary"))   return "Calgary";
  return "Others";
}

function formatRemote(value: string) {
  if (value.includes("可以"))   return "Yes";
  if (value.includes("唔可以")) return "No";
  return value;
}

function formatWorkingMode(value: string) {
  const v = value.toLowerCase();
  if (v.includes("hybrid"))                        return "Hybrid";
  if (v.includes("wfh"))                           return "WFH";
  if (v.includes("office") || v.includes("返office")) return "Office";
  return value;
}

function ContactButton({ contact }: { contact: string }) {
  if (!contact) return null;

  const lower = contact.toLowerCase();
  const baseClass =
    "inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm " +
    "hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
    "min-h-[44px] min-w-[44px]";

  if (lower.includes("linkedin.com")) {
    return (
      <a
        href={contact}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn profile (opens in new tab)"
        className={baseClass}
      >
        LinkedIn
      </a>
    );
  }

  if (lower.includes("whatsapp") || lower.includes("wts")) {
    const phone = contact.replace(/[^\d]/g, "");
    return (
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact via WhatsApp (opens in new tab)"
        className={baseClass}
      >
        WhatsApp
      </a>
    );
  }

  if (contact.startsWith("http")) {
    return (
      <a
        href={contact}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact link (opens in new tab)"
        className={baseClass}
      >
        Contact
      </a>
    );
  }

  return (
    <span className="text-sm text-slate-600 dark:text-slate-400">
      {contact}
    </span>
  );
}

/* Shared input/select style */
const controlClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 " +
  "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
  "min-h-[44px]";

export default function Home() {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [areaFilter,   setAreaFilter]   = useState("All");
  const [remoteFilter, setRemoteFilter] = useState("All");

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    try {
      const sheetId = "1PeXhG78pIC28tIOvq45I8EPPNtiMaG-xUf79jc3xUKk";
      const res  = await fetch(
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
      );
      const text = await res.text();
      const json = JSON.parse(text.substring(47).slice(0, -2));

      const data: Job[] = json.table.rows.map((row: any) => ({
        timestamp:   row.c?.[0]?.v ?? "",
        company:     row.c?.[1]?.v ?? "",
        role:        row.c?.[2]?.v ?? "",
        level:       row.c?.[3]?.v ?? "",
        base:        row.c?.[4]?.v ?? "",
        remote:      row.c?.[5]?.v ?? "",
        workingMode: row.c?.[6]?.v ?? "",
        contact:     row.c?.[7]?.v ?? "",
      }));

      setJobs(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load opportunities. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const area   = getArea(job.base);
      const areaMatch   = areaFilter   === "All" || area === areaFilter;
      const remoteMatch = remoteFilter === "All" || formatRemote(job.remote) === remoteFilter;
      return areaMatch && remoteMatch;
    });
  }, [jobs, areaFilter, remoteFilter]);

  return (
    <main id="main-content" className="min-h-screen">
      {/* ── Page header ──────────────────────────────── */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Community Referral Board
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Community-submitted referral opportunities
            </p>
          </div>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Submit a referral (opens in new tab)"
            className={
              "rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white " +
              "hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 " +
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 " +
              "min-h-[44px] inline-flex items-center transition-colors"
            }
          >
            Submit Referral
          </a>
        </div>
      </header>

      {/* ── Sticky filter bar ────────────────────────── */}
      <div
        role="search"
        aria-label="Filter opportunities"
        className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Area filter */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="area-filter"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Area
              </label>
              <select
                id="area-filter"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className={controlClass}
              >
                <option value="All">All</option>
                <option value="Toronto">Toronto</option>
                <option value="Vancouver">Vancouver</option>
                <option value="Calgary">Calgary</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Remote filter */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="remote-filter"
                className="text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Remote
              </label>
              <select
                id="remote-filter"
                value={remoteFilter}
                onChange={(e) => setRemoteFilter(e.target.value)}
                className={controlClass}
              >
                <option value="All">All</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Live results count — announced by screen readers on change */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm text-slate-500 dark:text-slate-400"
            >
              {loading ? "Loading…" : `${filteredJobs.length} ${filteredJobs.length === 1 ? "opportunity" : "opportunities"}`}
            </div>
          </div>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────── */}
      <section
        aria-label="Referral opportunities"
        aria-busy={loading}
        className="mx-auto max-w-7xl px-6 py-6"
      >
        {loading ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400" aria-live="polite">
            Loading opportunities…
          </p>
        ) : error ? (
          <p role="alert" className="py-12 text-center text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : filteredJobs.length === 0 ? (
          <p className="py-12 text-center text-slate-400 dark:text-slate-500">
            No opportunities match your filters.
          </p>
        ) : (
          <ul role="list" className="space-y-4">
            {filteredJobs.map((job, index) => (
              <li key={index}>
                <article
                  aria-labelledby={`job-${index}-heading`}
                  className={
                    "rounded-xl border border-slate-200 bg-white p-5 shadow-sm " +
                    "hover:shadow-md transition-shadow " +
                    "dark:border-slate-700 dark:bg-slate-900"
                  }
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* Company */}
                    <div className="lg:col-span-2">
                      <h2
                        id={`job-${index}-heading`}
                        className="text-xl font-bold text-slate-900 dark:text-white"
                      >
                        {job.company || "—"}
                      </h2>
                    </div>

                    {/* Role / JD */}
                    <div className="lg:col-span-4">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Hiring Role / JD
                      </p>
                      {job.role.startsWith("http") ? (
                        <a
                          href={job.role}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Job posting for ${job.company} (opens in new tab)`}
                          className={
                            "text-blue-600 dark:text-blue-400 hover:underline break-all text-sm " +
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
                          }
                        >
                          {job.role}
                        </a>
                      ) : (
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {job.role || "—"}
                        </p>
                      )}
                    </div>

                    {/* Level */}
                    <div className="lg:col-span-1">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Level
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {job.level || "—"}
                      </p>
                    </div>

                    {/* Base */}
                    <div className="lg:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Base
                      </p>
                      <p className="text-slate-700 dark:text-slate-300">
                        {job.base || "—"}
                      </p>
                    </div>

                    {/* Remote / Mode */}
                    <div className="lg:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Details
                      </p>
                      <dl className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        <div className="flex gap-1">
                          <dt className="font-medium">Remote:</dt>
                          <dd>{formatRemote(job.remote) || "—"}</dd>
                        </div>
                        <div className="flex gap-1">
                          <dt className="font-medium">Mode:</dt>
                          <dd>{formatWorkingMode(job.workingMode) || "—"}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* Contact */}
                    <div className="lg:col-span-1">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">
                        Contact
                      </p>
                      <ContactButton contact={job.contact} />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
