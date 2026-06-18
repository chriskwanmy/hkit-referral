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

  if (b.includes("toronto")) return "Toronto";
  if (b.includes("vancouver")) return "Vancouver";
  if (b.includes("calgary")) return "Calgary";

  return "Others";
}

function formatRemote(value: string) {
  if (value.includes("可以")) return "Yes";
  if (value.includes("唔可以")) return "No";
  return value;
}

function formatWorkingMode(value: string) {
  const v = value.toLowerCase();

  if (v.includes("hybrid")) return "Hybrid";
  if (v.includes("wfh")) return "WFH";
  if (v.includes("office") || v.includes("返office")) return "Office";

  return value;
}

function ContactButton({ contact }: { contact: string }) {
  if (!contact) return null;

  const lower = contact.toLowerCase();

  if (lower.includes("linkedin.com")) {
    return (
      <a
        href={contact}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      >
        LinkedIn
      </a>
    );
  }

  if (
    lower.includes("whatsapp") ||
    lower.includes("wts")
  ) {
    const phone = contact.replace(/[^\d]/g, "");

    return (
      <a
        href={`https://wa.me/${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
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
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
      >
        Contact
      </a>
    );
  }

  return (
    <span className="text-sm text-gray-600">
      {contact}
    </span>
  );
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [areaFilter, setAreaFilter] = useState("All");
  const [remoteFilter, setRemoteFilter] = useState("All");

  useEffect(() => {
    loadJobs();
  }, []);

  async function loadJobs() {
    try {
      const sheetId =
        "1PeXhG78pIC28tIOvq45I8EPPNtiMaG-xUf79jc3xUKk";

      const res = await fetch(
        `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`
      );

      const text = await res.text();

      const json = JSON.parse(
        text.substring(47).slice(0, -2)
      );

      const data: Job[] = json.table.rows.map((row: any) => ({
        timestamp: row.c?.[0]?.v ?? "",
        company: row.c?.[1]?.v ?? "",
        role: row.c?.[2]?.v ?? "",
        level: row.c?.[3]?.v ?? "",
        base: row.c?.[4]?.v ?? "",
        remote: row.c?.[5]?.v ?? "",
        workingMode: row.c?.[6]?.v ?? "",
        contact: row.c?.[7]?.v ?? "",
      }));

      // 保持 Google Sheet 原本順序
      setJobs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const area = getArea(job.base);

      const areaMatch =
        areaFilter === "All" ||
        area === areaFilter;

      const remoteMatch =
        remoteFilter === "All" ||
        formatRemote(job.remote) === remoteFilter;

      return areaMatch && remoteMatch;
    });
  }, [jobs, areaFilter, remoteFilter]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Community Referral Board
            </h1>

            <p className="text-gray-600 mt-1">
              Community-submitted referral opportunities
            </p>
          </div>

          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            Submit Referral
          </a>
        </div>
      </div>

      {/* Sticky Filter */}
      <div className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={areaFilter}
              onChange={(e) =>
                setAreaFilter(e.target.value)
              }
              className="rounded-lg border px-3 py-2"
            >
              <option>All</option>
              <option>Toronto</option>
              <option>Vancouver</option>
              <option>Calgary</option>
              <option>Others</option>
            </select>

            <select
              value={remoteFilter}
              onChange={(e) =>
                setRemoteFilter(e.target.value)
              }
              className="rounded-lg border px-3 py-2"
            >
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>

            <div className="text-sm text-gray-500">
              {filteredJobs.length} opportunities
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                  {/* Company */}
                  <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold">
                      {job.company}
                    </h2>
                  </div>

                  {/* Role */}
                  <div className="lg:col-span-4">
                    <div className="text-xs uppercase text-gray-500 mb-1">
                      Hiring Role / JD
                    </div>

                    {job.role.startsWith("http") ? (
                      <a
                        href={job.role}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {job.role}
                      </a>
                    ) : (
                      <div className="text-sm">
                        {job.role || "-"}
                      </div>
                    )}
                  </div>

                  {/* Level */}
                  <div className="lg:col-span-1">
                    <div className="text-xs uppercase text-gray-500 mb-1">
                      Level
                    </div>

                    <div>{job.level || "-"}</div>
                  </div>

                  {/* Base */}
                  <div className="lg:col-span-2">
                    <div className="text-xs uppercase text-gray-500 mb-1">
                      Base
                    </div>

                    <div>{job.base || "-"}</div>
                  </div>

                  {/* Remote / Mode */}
                  <div className="lg:col-span-2">
                    <div className="text-xs uppercase text-gray-500 mb-1">
                      Details
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        Remote:{" "}
                        {formatRemote(job.remote)}
                      </div>

                      <div>
                        Mode:{" "}
                        {formatWorkingMode(
                          job.workingMode
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="lg:col-span-1">
                    <div className="text-xs uppercase text-gray-500 mb-1">
                      Contact
                    </div>

                    <ContactButton
                      contact={job.contact}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}