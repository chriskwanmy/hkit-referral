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
    <div>HELLO</div>
  );
}