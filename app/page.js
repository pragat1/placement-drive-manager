"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const EMPTY_FORM = {
  companyName: "",
  role: "",
  driveDate: "",
  eligibleBranch: "",
  minCGPA: "",
  jobType: "",
};

function getDateKey(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function isDriveRecord(record) {
  return (
    record !== null &&
    typeof record === "object" &&
    typeof record.id === "string" &&
    typeof record.companyName === "string" &&
    typeof record.role === "string" &&
    typeof record.driveDate === "string" &&
    getDateKey(record.driveDate) !== "" &&
    typeof record.eligibleBranch === "string" &&
    (record.minCGPA === null ||
      record.minCGPA === undefined ||
      (typeof record.minCGPA === "number" && Number.isFinite(record.minCGPA))) &&
    (record.jobType === null ||
      record.jobType === undefined ||
      typeof record.jobType === "string")
  );
}

async function fetchDriveRecords() {
  const response = await fetch("/api/drives", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("We couldn’t load placement drives. Please try again.");
  }

  let records;
  try {
    records = await response.json();
  } catch {
    throw new Error("The server returned an unreadable placement drive response.");
  }
  if (!Array.isArray(records) || !records.every(isDriveRecord)) {
    throw new Error("The server returned an unexpected placement drive response.");
  }

  return [...records].sort((first, second) =>
    getDateKey(first.driveDate).localeCompare(getDateKey(second.driveDate)),
  );
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "We couldn’t load placement drives. Please try again.";
}

function Icon({ name, className = "h-5 w-5" }) {
  const shared = {
    "aria-hidden": true,
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
  };

  if (name === "briefcase") {
    return (
      <svg {...shared}>
        <rect x="3.5" y="7" width="17" height="13" rx="2" />
        <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7M3.5 12h17M10 12v2h4v-2" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...shared}>
        <rect x="3.5" y="5" width="17" height="16" rx="2" />
        <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h2M14 13h2M8 17h2" />
      </svg>
    );
  }

  if (name === "building") {
    return (
      <svg {...shared}>
        <path d="M4 20V6l8-3 8 3v14M2.5 20h19" />
        <path d="M8 8h1M15 8h1M8 12h1M15 12h1M10 20v-4h4v4" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...shared}>
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.2 4.2" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...shared}>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9a7 7 0 0 1 11.7-2L20 12M4 12l2.7 5a7 7 0 0 0 11.7-2" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...shared}>
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  }

  return (
    <svg {...shared}>
      <path d="M12 3.5 20 7v5c0 4.6-3.1 7.3-8 9-4.9-1.7-8-4.4-8-9V7l8-3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StatCard({ label, value, detail, icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  );
}

function DriveStatus({ driveDate }) {
  const isUpcoming = getDateKey(driveDate) >= getTodayKey();
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        isUpcoming
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          isUpcoming ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isUpcoming ? "Upcoming" : "Completed"}
    </span>
  );
}

function DriveCard({ drive }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">
            {drive.companyName}
          </h3>
          <p className="mt-1 text-sm text-slate-600">{drive.role}</p>
        </div>
        <DriveStatus driveDate={drive.driveDate} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-slate-100 pt-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Drive date</p>
          <p className="mt-1 font-medium text-slate-800">
            {formatDate(drive.driveDate)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Eligible branch</p>
          <p className="mt-1 font-medium text-slate-800">{drive.eligibleBranch}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Minimum CGPA</p>
          <p className="mt-1 font-medium text-slate-800">
            {drive.minCGPA ?? "Not specified"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Job type</p>
          <p className="mt-1 font-medium text-slate-800">
            {drive.jobType || "Not specified"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [scheduleFilter, setScheduleFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDrives = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      setDrives(await fetchDriveRecords());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    fetchDriveRecords()
      .then((records) => {
        if (isCurrent) {
          setDrives(records);
        }
      })
      .catch((error) => {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const todayKey = getTodayKey();
  const stats = useMemo(() => {
    const companies = new Set(
      drives.map((drive) => drive.companyName.trim().toLocaleLowerCase()),
    );

    return {
      total: drives.length,
      upcoming: drives.filter((drive) => getDateKey(drive.driveDate) >= todayKey)
        .length,
      companies: companies.size,
      internships: drives.filter(
        (drive) => drive.jobType?.toLocaleLowerCase() === "internship",
      ).length,
    };
  }, [drives, todayKey]);

  const filteredDrives = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase();

    return drives.filter((drive) => {
      const matchesSearch =
        !query ||
        [drive.companyName, drive.role, drive.eligibleBranch].some((value) =>
          value.toLocaleLowerCase().includes(query),
        );
      const matchesJobType =
        !jobTypeFilter || drive.jobType === jobTypeFilter;
      const isUpcoming = getDateKey(drive.driveDate) >= todayKey;
      const matchesSchedule =
        scheduleFilter === "all" ||
        (scheduleFilter === "upcoming" && isUpcoming) ||
        (scheduleFilter === "past" && !isUpcoming);

      return matchesSearch && matchesJobType && matchesSchedule;
    });
  }, [drives, jobTypeFilter, scheduleFilter, searchTerm, todayKey]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormError("");
    setSuccessMessage("");
  }

  function resetFilters() {
    setSearchTerm("");
    setJobTypeFilter("");
    setScheduleFilter("all");
  }

  async function submitDrive(event) {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const companyName = form.companyName.trim();
    const role = form.role.trim();
    const eligibleBranch = form.eligibleBranch.trim();
    const minCGPA = form.minCGPA.trim() === "" ? null : Number(form.minCGPA);

    if (!companyName || !role || !form.driveDate || !eligibleBranch) {
      setFormError("Complete all required fields before submitting.");
      return;
    }

    if (
      minCGPA !== null &&
      (!Number.isFinite(minCGPA) || minCGPA < 0 || minCGPA > 10)
    ) {
      setFormError("Minimum CGPA must be a number between 0 and 10.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyName,
        role,
        driveDate: form.driveDate,
        eligibleBranch,
        ...(minCGPA === null ? {} : { minCGPA }),
        ...(form.jobType ? { jobType: form.jobType } : {}),
      };
      const response = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);
        throw new Error(
          typeof responseBody?.error === "string"
            ? responseBody.error
            : "We couldn’t add this drive. Please review the details and try again.",
        );
      }

      let createdDrive;
      try {
        createdDrive = await response.json();
      } catch {
        throw new Error(
          "The drive may have been saved, but the server returned an unreadable response. Refresh the list to check.",
        );
      }
      if (!isDriveRecord(createdDrive)) {
        throw new Error(
          "The drive may have been saved, but the server returned an unexpected response. Refresh the list to check.",
        );
      }

      setForm(EMPTY_FORM);
      await loadDrives();
      setSuccessMessage(`${companyName}’s placement drive was added.`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "We couldn’t add this drive. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function focusForm() {
    document.getElementById("add-drive")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    document.getElementById("companyName")?.focus({ preventScroll: true });
  }

  const hasActiveFilters = Boolean(
    searchTerm || jobTypeFilter || scheduleFilter !== "all",
  );
  const statsUnavailable = drives.length === 0 && (isLoading || Boolean(loadError));

  return (
    <main className="min-h-screen bg-slate-50/80 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold tracking-wide text-white shadow-sm shadow-blue-900/15">
              PD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                Placement Drive Manager
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Campus Recruitment Management
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline-flex">
              <Icon name="shield" className="h-4 w-4 text-blue-700" />
              Placement dashboard
            </span>
            <button
              type="button"
              onClick={focusForm}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:px-4"
            >
              <Icon name="plus" className="h-4 w-4" />
              <span className="hidden sm:inline">Add Placement Drive</span>
              <span className="sm:hidden">Add drive</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-8 sm:px-6 sm:pt-10 lg:px-10">
        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              Recruitment overview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Manage campus placements with clarity.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Keep recruitment drives, eligibility requirements, and upcoming
              opportunities organized in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 md:self-auto">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Drive management
          </div>
        </section>

        {loadError && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadDrives}
              disabled={isLoading}
              className="self-start font-semibold underline underline-offset-2 hover:text-rose-950 disabled:opacity-60 sm:self-auto"
            >
              Try again
            </button>
          </div>
        )}

        <section
          aria-label="Placement drive statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard
            label="Total drives"
            value={statsUnavailable ? "—" : stats.total}
            detail="All recorded recruitment drives"
            icon="briefcase"
            tone="blue"
          />
          <StatCard
            label="Upcoming drives"
            value={statsUnavailable ? "—" : stats.upcoming}
            detail="Scheduled for today or later"
            icon="calendar"
            tone="violet"
          />
          <StatCard
            label="Companies participating"
            value={statsUnavailable ? "—" : stats.companies}
            detail="Unique companies in the drive list"
            icon="building"
            tone="teal"
          />
          <StatCard
            label="Internship drives"
            value={statsUnavailable ? "—" : stats.internships}
            detail="Drives marked as internships"
            icon="briefcase"
            tone="amber"
          />
        </section>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section
            aria-labelledby="drives-heading"
            className="min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
          >
            <div className="border-b border-slate-100 px-4 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2
                    id="drives-heading"
                    className="text-lg font-semibold tracking-tight text-slate-900"
                  >
                    Placement drives
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and manage recruitment opportunities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loadDrives}
                  disabled={isLoading}
                  className="inline-flex min-h-9 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                >
                  <Icon
                    name="refresh"
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                  {isLoading ? "Refreshing" : "Refresh"}
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_160px_150px_auto]">
                <label className="relative block">
                  <span className="sr-only">Search drives</span>
                  <Icon
                    name="search"
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search company, role, branch"
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </label>
                <label>
                  <span className="sr-only">Filter by job type</span>
                  <select
                    value={jobTypeFilter}
                    onChange={(event) => setJobTypeFilter(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  >
                    <option value="">All job types</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label>
                  <span className="sr-only">Filter by drive schedule</span>
                  <select
                    value={scheduleFilter}
                    onChange={(event) => setScheduleFilter(event.target.value)}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  >
                    <option value="all">All dates</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                  </select>
                </label>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="min-h-10 rounded-lg px-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {isLoading && drives.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-700" />
                <p className="mt-4 text-sm font-medium text-slate-700">
                  Loading placement drives
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Connecting to your drive records.
                </p>
              </div>
            ) : loadError && drives.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                      <h3 className="font-semibold text-slate-900">
                        Drives are unavailable
                      </h3>
                      <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">
                        The drive list could not be loaded. Check the connection and
                        try again.
                      </p>
                      <button
                        type="button"
                        onClick={loadDrives}
                        className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
                      >
                        Retry loading drives
                      </button>
                    </div>
                  ) : drives.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Icon name="briefcase" className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-semibold text-slate-900">
                  No placement drives yet
                </h3>
                <p className="mt-1 max-w-sm text-sm leading-5 text-slate-500">
                  Add your first drive to keep its role, date, and eligibility
                  details organized here.
                </p>
                <button
                  type="button"
                  onClick={focusForm}
                  className="mt-4 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Add a placement drive
                </button>
              </div>
            ) : filteredDrives.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <h3 className="font-semibold text-slate-900">
                  No drives match these filters
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Try a different search or clear your filters.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-3 text-sm font-semibold text-blue-700 hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 p-4 lg:hidden">
                  {filteredDrives.map((drive) => (
                    <DriveCard key={drive.id} drive={drive} />
                  ))}
                </div>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <tr>
                        <th scope="col" className="px-5 py-3.5">Company / role</th>
                        <th scope="col" className="px-4 py-3.5">Drive date</th>
                        <th scope="col" className="px-4 py-3.5">Eligible branch</th>
                        <th scope="col" className="px-4 py-3.5">Min. CGPA</th>
                        <th scope="col" className="px-4 py-3.5">Job type</th>
                        <th scope="col" className="px-4 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDrives.map((drive) => (
                        <tr key={drive.id} className="transition hover:bg-slate-50/70">
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">{drive.companyName}</p>
                            <p className="mt-1 text-xs text-slate-500">{drive.role}</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-slate-700">
                            {formatDate(drive.driveDate)}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{drive.eligibleBranch}</td>
                          <td className="px-4 py-4 text-slate-700">{drive.minCGPA ?? "—"}</td>
                          <td className="px-4 py-4">
                            {drive.jobType ? (
                              <span className="inline-flex rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                {drive.jobType}
                              </span>
                            ) : (
                              <span className="text-slate-400">Not specified</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <DriveStatus driveDate={drive.driveDate} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                  Showing {filteredDrives.length} of {drives.length}{" "}
                  {drives.length === 1 ? "drive" : "drives"}
                </div>
              </>
            )}
          </section>

          <aside
            id="add-drive"
            aria-labelledby="add-drive-heading"
            className="scroll-mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.03)]"
          >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                New opportunity
              </p>
              <h2
                id="add-drive-heading"
                className="mt-1 text-lg font-semibold tracking-tight text-slate-900"
              >
                Add placement drive
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter the company and eligibility details.
              </p>
            </div>

            <form onSubmit={submitDrive} className="space-y-4 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="companyName"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Company name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={form.companyName}
                  onChange={updateForm}
                  placeholder="e.g. Company name"
                  className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Job role <span className="text-rose-600">*</span>
                </label>
                <input
                  id="role"
                  name="role"
                  type="text"
                  required
                  value={form.role}
                  onChange={updateForm}
                  placeholder="e.g. Software Engineer"
                  className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div>
                <label
                  htmlFor="driveDate"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Drive date <span className="text-rose-600">*</span>
                </label>
                <input
                  id="driveDate"
                  name="driveDate"
                  type="date"
                  required
                  value={form.driveDate}
                  onChange={updateForm}
                  className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div>
                <label
                  htmlFor="eligibleBranch"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Eligible branch <span className="text-rose-600">*</span>
                </label>
                <input
                  id="eligibleBranch"
                  name="eligibleBranch"
                  type="text"
                  required
                  value={form.eligibleBranch}
                  onChange={updateForm}
                  placeholder="e.g. CSE, ECE"
                  className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="minCGPA"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Minimum CGPA
                  </label>
                  <input
                    id="minCGPA"
                    name="minCGPA"
                    type="number"
                    min="0"
                    max="10"
                    step="any"
                    inputMode="decimal"
                    value={form.minCGPA}
                    onChange={updateForm}
                    placeholder="0–10"
                    className="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="jobType"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Job type
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={form.jobType}
                    onChange={updateForm}
                    className="min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  >
                    <option value="">Select type</option>
                    <option value="Internship">Internship</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800"
                >
                  {formError}
                </p>
              )}
              {successMessage && (
                <p
                  role="status"
                  className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"
                >
                  {successMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-65"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding drive…
                  </>
                ) : (
                  <>
                    <Icon name="plus" className="h-4 w-4" />
                    Add placement drive
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500">
                Fields marked with <span className="text-rose-600">*</span> are
                required.
              </p>
            </form>
          </aside>
        </div>
      </div>
    </main>
  );
}
