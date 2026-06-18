"use client";

import { useState, useMemo } from "react";

type Job = {
  company: string;
  position: string;
  level: string;
  location: string;
  remote: string;
  workMode: string;
  contact: string;
};

type LocationFilter = "all" | "vancouver" | "toronto" | "calgary" | "others";
type RemoteFilter = "all" | "yes" | "no";

function getLocationCategory(location: string): LocationFilter {
  const loc = location.toLowerCase();
  if (loc.includes("vancouver")) return "vancouver";
  if (loc.includes("toronto")) return "toronto";
  if (loc.includes("calgary")) return "calgary";
  return "others";
}

const LOCATION_LABELS: Record<LocationFilter, string> = {
  all: "All",
  vancouver: "Vancouver",
  toronto: "Toronto",
  calgary: "Calgary",
  others: "Others",
};

export default function JobBoard({ jobs }: { jobs: Job[] }) {
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [remoteFilter, setRemoteFilter] = useState<RemoteFilter>("all");

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      // Location filter
      if (locationFilter !== "all") {
        const cat = getLocationCategory(job.location);
        if (cat !== locationFilter) return false;
      }

      // Remote filter
      if (remoteFilter !== "all") {
        const remoteVal = job.remote?.trim().toLowerCase();
        const isRemote =
          remoteVal === "yes" ||
          remoteVal === "可以" ||
          remoteVal === "y" ||
          remoteVal === "true";
        if (remoteFilter === "yes" && !isRemote) return false;
        if (remoteFilter === "no" && isRemote) return false;
      }

      return true;
    });
  }, [jobs, locationFilter, remoteFilter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Sticky header + filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Title */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                Community Referral Board
              </h1>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
              {/* Location filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  City
                </span>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                  {(
                    [
                      "all",
                      "vancouver",
                      "toronto",
                      "calgary",
                      "others",
                    ] as LocationFilter[]
                  ).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLocationFilter(opt)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        locationFilter === opt
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {LOCATION_LABELS[opt]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              {/* Remote filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Remote
                </span>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                  {(
                    [
                      { value: "all", label: "All" },
                      { value: "yes", label: "可以" },
                      { value: "no", label: "唔可以" },
                    ] as { value: RemoteFilter; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRemoteFilter(opt.value)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        remoteFilter === opt.value
                          ? "bg-indigo-600 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count badge */}
              <span className="text-xs text-slate-400 ml-1">
                {filtered.length} results
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Company
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Position / JD
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Level
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Location
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Remote
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Work Mode
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    Contact
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-16 text-slate-400"
                    >
                      No results match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((job, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {job.company || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {job.position ? (
                          job.position.startsWith("http") ? (
                            <a
                              href={job.position}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                            >
                              View JD ↗
                            </a>
                          ) : (
                            job.position
                          )
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {job.level ? (
                          <span className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {job.level}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {job.location || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {job.remote ? (
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                              ["yes", "可以", "y", "true"].includes(
                                job.remote.trim().toLowerCase()
                              )
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {job.remote}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {job.workMode || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {job.contact ? (
                          job.contact.startsWith("http") ? (
                            <a
                              href={job.contact}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                            >
                              Contact ↗
                            </a>
                          ) : (
                            <span className="text-slate-600">{job.contact}</span>
                          )
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-400 text-center">
          Data synced from Google Sheets every 5 minutes.
        </p>
      </div>
    </div>
  );
}
